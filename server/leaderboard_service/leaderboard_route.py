from datetime import datetime
import os
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Users, Quiz_Attempts
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from starlette import status
from httpx import AsyncClient

 


router = APIRouter(
    prefix="/leaderboard",
    tags=['leaderboard']
)

# Environment variable
AUTHENTICATE_USER= os.environ.get("AUTHENTICATE_USER")


def get_db():
    db = SessionLocal()
    try: 
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
auth_scheme = HTTPBearer()


async def verify_token(token:str):
    url = AUTHENTICATE_USER  
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    async with AsyncClient() as client:
        # Sending a GET request with custom headers
        response = await client.get(url,headers=headers)
    if response.status_code==200:
        return response.json()
    else:
        return None
    


@router.get('/{quiz_id}')
async def quiz_leaderboard(quiz_id: int, db:db_dependency,token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    token_details = await verify_token(token.credentials)
    if token_details == None :
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid Access token")
    
    leaderboard = (
    db.query(
        Quiz_Attempts.user_id,
        Users.username,
        func.sum(Quiz_Attempts.score).label('total_score')
    )
    .join(Users, Users.id == Quiz_Attempts.user_id)
    .filter(Quiz_Attempts.quiz_id == quiz_id)
    .group_by(Quiz_Attempts.user_id, Users.username)
    .order_by(func.sum(Quiz_Attempts.score).desc())
    .all()
)

    results = []
    for rank, entry in enumerate(leaderboard, start=1):
        
        results.append({
            "rank": rank,
            "user_id": entry.user_id,
            "username": entry.username,
            "total_score": entry.total_score,
        })

    return {"leaderboard": results}





@router.get('/global/')
async def global_leaderboard(db:db_dependency,token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    token_details = await verify_token(token.credentials)
    if token_details == None :
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid Access token")
    
    leaderboard = (
        db.query(
            Quiz_Attempts.user_id,
            Users.username,
            func.sum(Quiz_Attempts.score).label('total_score')
        )
        .join(Users, Users.id==Quiz_Attempts.user_id)
        .group_by(Quiz_Attempts.user_id,Users.username)
        .order_by(func.sum(Quiz_Attempts.score).desc())
        .all()
    )

    results = []
    for rank, entry in enumerate(leaderboard, start=1):
        results.append({
            "rank": rank,
            "user_id": entry.user_id,
            "username": entry.username,
            "total_score": entry.total_score,
        })

    return {"leaderboard": results}