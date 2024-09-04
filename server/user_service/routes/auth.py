from datetime import datetime, timedelta
from typing import Annotated
from starlette import status
from fastapi import APIRouter, Depends, HTTPException, Request, Response
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

# All dependencies
db_dependency = Annotated[Session, Depends(get_db)]
bcrypt_context = CryptContext(schemes=['bcrypt'],deprecated='auto') # bcrypt_context is used to hash the password
oauth2_bearer = OAuth2PasswordBearer(tokenUrl='auth/login')


# Request model for register user
class RegisterUserRequest(BaseModel):
    username: str = Field(min_length=4)
    email: str = Field(min_length=6)
    password: str = Field(min_length=6)
    role: str = Field(min_length=1)
    login:bool = Field(default=True)


# Create access and refresh token function
def create_tokens(username: str, user_id: int, role: str, access_expires_delta: timedelta, refresh_expires_delta: timedelta = timedelta(days=30)):
    now = datetime.utcnow()
    
    # Create the Access Token
    access_token_payload = {
        'sub': username,
        'id': user_id,
        'role': role,
        'exp': now + access_expires_delta
    }
    access_token = jwt.encode(access_token_payload, SECRET_KEY, algorithm=ALGORITHM)
    
    # Create the Refresh Token
    refresh_token_payload = {
        'id': user_id,
        'exp': now + refresh_expires_delta
    }
    refresh_token = jwt.encode(refresh_token_payload, SECRET_KEY, algorithm=ALGORITHM)
    
    return access_token, refresh_token





# Verifying access token and returing token details
async def verify_access_token(token: Annotated[str,Depends(oauth2_bearer)]):
    print("access_token recieved: ",token)
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
    


# verify refresh_token and return token details
async def verify_refresh_token(token: Annotated[str,Depends(oauth2_bearer)]):
    print("refresh_token recieved: ",token)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id:int = payload.get('id')
        if user_id is None :
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="could not validate user.")

        
        return {'id':user_id,"token":token}
    
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
            "role": role_name,
            "refresh_token": user.refresh_token,
            "avatar_url": user.avatar_url
        })

    return result;



# Register new user
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(register_user_request: RegisterUserRequest,db:db_dependency):
    # First check for username and email existence
    username_exits =  db.query(Users).filter(Users.username==register_user_request.username).first()
    if username_exits:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="username already exists")
    email_exits =  db.query(Users).filter(Users.email==register_user_request.email).first()
    if email_exits:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="user already exists with this email")
    

    try:
        # Add new user into users table
        register_user_model = Users(
            username = register_user_request.username,
            email = register_user_request.email,
            password_hash = bcrypt_context.hash(register_user_request.password),
            created_at = datetime.now()
        )
        db.add(register_user_model)
        db.flush()

        # role implementation of user and taking role id
        role_name = register_user_request.role
        role_name_exists = db.query(Role).filter(Role.role_name == role_name).first()
        if role_name_exists:
            role_model = Role(role_name = role_name_exists.role_name)
        else:
            role_model = Role(role_name=role_name)
        db.add(role_model)
        db.flush()


        # Add user ID and role ID in user_role table
        user_role_model = User_role(user_id = register_user_model.id, role_id = role_model.id)
        db.add(user_role_model)
        db.commit()

    except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail="failed to register user")

    # If automatic login true
    if register_user_request.login:
        access_token,refresh_token = create_tokens(register_user_request.username, register_user_model.id, register_user_request.role, timedelta(minutes=15))

        db.query(Users).filter(Users.id==register_user_model.id).update({"refresh_token":refresh_token})
        db.commit()

        # building response
        response = {"message":"logged In successfully",
            "user":{
                "id":register_user_model.id,
                "username":register_user_request.username,
                "email":register_user_request.email,
                "role":register_user_request.role,
                "created_at":datetime.now(),
                "avatar_url":None
                },
            "access_token":access_token,
            "refresh_token":refresh_token,
            "token_type":"bearer"
            }
        
        return  response

    else:
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
    

    try:
        # Getting user role from db
        user_and_role = db.query(User_role, Role).join(Role, User_role.role_id == Role.id).filter(User_role.user_id == user.id).first()

        # Extracting the values 
        role = user_and_role[1].role_name  


        # Generating access token and refresh token
        access_token,refresh_token = create_tokens(user.username, user.id, role, timedelta(minutes=15))

        db.query(Users).filter(Users.id==user.id).update({"refresh_token":refresh_token})
        db.commit()

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail="login failed")
    

    return {"message":"logged In successfully",
            "user":{
                "id":user.id,
                "username":user.username,
                "email":user.email,
                "role":role,
                "created_at":user.created_at,
                "avatar_url":user.avatar_url
                },
            "access_token":access_token,
            "refresh_token":refresh_token,
            "token_type":"bearer"
            }



@router.get("/login_token")
async def login_using_token(token_details:Annotated[dict,Depends(verify_access_token)],db:db_dependency):
    print("token_details")
    if not token_details:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="invalid token")
    
    # Get user details from database
    user = db.query(Users).filter(Users.id== token_details["id"]).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="user not found with access token")


    # Generating access token and refresh token
    access_token,refresh_token = create_tokens(user.username, user.id, token_details['user_role'], timedelta(minutes=15))

    db.query(Users).filter(Users.id==user.id).update({"refresh_token":refresh_token})
    db.commit()

    return {"message":"logged In successfully",
            "user":{
                "id":user.id,
                "username":user.username,
                "email":user.email,
                "role":token_details['user_role'],
                "created_at":user.created_at,
                "avatar_url":user.avatar_url
                },
            "access_token":access_token,
            "refresh_token":refresh_token,
            "token_type":"bearer"
            }




@router.get('/refresh_access_token')
async def refresh_access_token(token_details:Annotated[dict,Depends(verify_refresh_token)],db:db_dependency):
    
    user =db.query(Users).filter(Users.id==token_details["id"]).first()
    print(user.refresh_token)
    if user.refresh_token != token_details["token"]:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid refresh token2")
    if not user:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="user not found with refresh token")
    
    user_role = db.query(Role).join(User_role, User_role.role_id==Role.id).filter(User_role.user_id==user.id).first()

    access_token,refresh_token = create_tokens(user.username, user.id, user_role.role_name, timedelta(minutes=15))

    db.query(Users).filter(Users.id==user.id).update({"refresh_token":refresh_token})
    db.commit()

    return {"message":"new tokens generated",
            "user":{
                "id":user.id,
                },
            "access_token":access_token,
            "refresh_token":refresh_token,
            "token_type":"bearer"
            }




@router.get('/logout')
async def logout(db:db_dependency,token_details:Annotated[dict,Depends(verify_access_token)]):
    if not token_details:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="invalid access token")
    try:
        db.query(Users).filter(Users.id==token_details['id']).update({"refresh_token":None})
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail="logout failed")
    db.commit()
    return {"message":"logout successfully"}

