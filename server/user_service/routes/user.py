from datetime import timedelta
from typing import Annotated, Dict
from starlette import status
from fastapi import APIRouter, Depends, HTTPException, Path
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Users
from routes.auth import bcrypt_context, create_tokens, verify_access_token

router = APIRouter(
    prefix='/user',
    tags=['user']
)



def get_db():
    db = SessionLocal()
    try: 
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict,Depends(verify_access_token)]


class update_password_request(BaseModel):
    old_password: str = Field(min_length=6)
    new_password: str = Field(min_length=6) 




# Routes -------------------------------


# Get user details and also verify access token
@router.get("/")
async def current_user(token_user:user_dependency, db:db_dependency):
    user = db.query(Users).filter(Users.id==token_user['id']).first()
    
    user_details = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "created_at": user.created_at,
            "role": token_user["user_role"],
            "avatar_url": user.avatar_url
        }
    return user_details



# Update username
@router.put("/update_username/{username}",status_code=status.HTTP_200_OK)
async def update_username(username:str, token_user:user_dependency, db:db_dependency):
    print(username);
    user = db.query(Users).filter(Users.username == token_user['username']).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Unauthorized22")
    

    username_exists = db.query(Users).filter(Users.username==username).first()
    if username_exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="username already exists.")
    
    try:
        db.query(Users).filter(Users.id == token_user['id']).update({"username": username})
        db.commit()

        # Generating new access token
        access_token,_ = create_tokens(username, token_user['id'], token_user['user_role'], timedelta(minutes=120))

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail="failed to update username")

    return {"message":"Username updated successfully","new_username":username,"access_token":access_token,"token_type":"bearer"}



# Update Email
@router.put("/update_email/{email}",status_code=status.HTTP_200_OK)
async def update_email(token_user:user_dependency, db:db_dependency,email:str = Path(min_length=6)):
    user = db.query(Users).filter(Users.username == token_user['username']).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Unauthorized")
    
    email_exits = db.query(Users).filter(Users.email == email).first()
    if email_exits:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="email already exits")

    try:
        db.query(Users).filter(Users.id == token_user['id']).update({"email": email})
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail="failed to update email")

    return {"message":"email updated successfully"}



# Update Password
@router.put("/update_password",status_code=status.HTTP_200_OK)
async def update_password(update_password:update_password_request,token_user:user_dependency, db:db_dependency):
    user = db.query(Users).filter(Users.username == token_user['username']).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Unauthorized")
    
    if not bcrypt_context.verify(update_password.old_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid old password")
    

    try:
        new_password_hash = bcrypt_context.hash(update_password.new_password)
        
        db.query(Users).filter(Users.id == token_user['id']).update({"password_hash": new_password_hash})
        db.commit()

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail="failed to update password")


    return {"message":"Password updated successfully"}
