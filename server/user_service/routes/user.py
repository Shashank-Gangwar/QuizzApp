from typing import Annotated
from starlette import status
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Users
from routes.auth import get_current_user,bcrypt_context

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
user_dependency = Annotated[dict,Depends(get_current_user)]


class update_password_request(BaseModel):
    old_password: str = Field(min_length=6)
    new_password: str = Field(min_length=6) 




# Routes -------------------------------

@router.get("/")
async def get_user_details(token_user:user_dependency, db:db_dependency):
    user = db.query(Users).filter(Users.id==token_user['id']).first()
    print("hello")

    user_details = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "created_at": user.created_at,
            "role": token_user["user_role"]
        }
    return user_details



@router.put("/update_username/{username}",status_code=status.HTTP_200_OK)
async def update_username(username:str, token_user:user_dependency, db:db_dependency):
    username_exists = db.query(Users).filter(Users.username==username).first()
    if username_exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="username already exists.")
    db.query(Users).filter(Users.id == token_user['id']).update({"username": username})
    db.commit()

    return {"message":"Username updated successfully"}



@router.put("/update_password",status_code=status.HTTP_200_OK)
async def update_password(update_password:update_password_request,token_user:user_dependency, db:db_dependency):
    user = db.query(Users).filter(Users.username == token_user['username']).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Unauthorized")
    if not bcrypt_context.verify(update_password.old_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid old password")
    
    new_password_hash = bcrypt_context.hash(update_password.new_password)

    
    db.query(Users).filter(Users.id == token_user['id']).update({"password_hash": new_password_hash})
    db.commit()

    return {"message":"Password updated successfully"}
