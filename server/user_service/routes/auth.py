from datetime import datetime, timedelta
from typing import Annotated
from starlette import status
from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Role, Users, User_role
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import JWTError, jwt

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

SECRET_KEY='1ffce67b3b5781a1f8f0bf6e6b71230409b2b7735dec46cb83051e00cf03cc5f'
ALGORITHM = 'HS256'



def get_db():
    db = SessionLocal()
    try: 
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]


# bcrypt_context is used to hash the password
bcrypt_context = CryptContext(schemes=['bcrypt'],deprecated='auto')
# 
oauth2_bearer = OAuth2PasswordBearer(tokenUrl='auth/login')


# Request model for register user
class RegisterUserRequest(BaseModel):
    username: str = Field(min_length=4)
    email: str = Field(min_length=6)
    password: str = Field(min_length=6)
    role: str = Field(min_length=1)


# Creating access token
def create_access_token(username: str, user_id: int, role: str, expires_delta: timedelta):
    encode = {'sub':username, 'id':user_id, 'role':role}
    expires = datetime.utcnow() + expires_delta
    encode.update({'exp':expires})
    return jwt.encode(encode, SECRET_KEY, algorithm = ALGORITHM)

# Verifying user authenticity and giving current user if valid token
async def get_current_user(token: Annotated[str,Depends(oauth2_bearer)]):
    try:
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get('sub')
        user_id:int = payload.get('id')
        user_role: str = payload.get('role')
        if username is None or user_id is None or user_role is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="could not validate user.")

        return {'username':username, 'id':user_id, 'user_role':user_role}
    
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail=str(e))



# >-----------------Routes--------------------<


# Get all users
@router.get("/getall_users")
async def all_users(db:db_dependency):

    all_users =  db.query(Users,Role.role_name).join(User_role, User_role.user_id==Users.id).join(Role,Role.id==User_role.role_id).all()

    result = []
    for user, role_name in all_users:
        result.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "password": user.password_hash,
            "created_at":user.created_at,
            "role": role_name
        })

    return result;



# Register new user
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(register_user_request: RegisterUserRequest,db:db_dependency):
    username_exits =  db.query(Users).filter(Users.username==register_user_request.username).first()
    if username_exits:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="username already exists")
    email_exits =  db.query(Users).filter(Users.email==register_user_request.email).first()
    if email_exits:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="user already exists with this email")
    
    try:
        register_user_model = Users(
            username = register_user_request.username,
            email = register_user_request.email,
            password_hash = bcrypt_context.hash(register_user_request.password),
            created_at = datetime.now()
        )
        db.add(register_user_model)
        db.flush()

        role_name = register_user_request.role
        role_name_exists = db.query(Role).filter(Role.role_name == role_name).first()
        if role_name_exists:
            role_model = Role(role_name = role_name_exists.role_name)
        else:
            role_model = Role(role_name=role_name)
        db.add(role_model)
        db.flush()


        user_role_model = User_role(user_id = register_user_model.id, role_id = role_model.id)
        db.add(user_role_model)
        db.commit()

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail="failed to register user")

    return {"details":"User created successfully"}




# Login user for access_token
@router.post("/login", status_code=status.HTTP_200_OK)
async def login_user(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],db:db_dependency,response:Response):
    # Check login credentials
    user = db.query(Users).filter(Users.username == form_data.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="User not found")
    
    if not bcrypt_context.verify(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user password")
    

    # Getting user role from db
    user_and_role = db.query(User_role, Role).join(Role, User_role.role_id == Role.id).filter(User_role.user_id == user.id).first()

    # Extracting the values 
    role = user_and_role[1].role_name  


    # Generating access token
    token = create_access_token(user.username, user.id, role, timedelta(minutes=120))

    response.set_cookie(key='access_token',value=token,max_age=7200)

    return {"access_token":token, "token_type":"bearer"}

