from datetime import datetime
import os
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Quiz, Quiz_Attempts
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from starlette import status
from httpx import AsyncClient


router = APIRouter(
    prefix="/quiz_attempt",
    tags=['quiz_attempt']
)

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
    
@router.get("/")
async def getAllAttempts(db:db_dependency):
   result= db.query(Quiz_Attempts).all()
   return result

@router.post('/start_quiz')
async def start_quiz(quiz_id: int, db:db_dependency,token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    token_details = await verify_token(token.credentials)
    if token_details == None :
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid Access token")
    
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found!")
    

    quiz_attempt = db.query(Quiz_Attempts).filter(
                                    Quiz_Attempts.user_id == token_details['id'],
                                    Quiz_Attempts.quiz_id == quiz_id
                                    ).first()

    if quiz_attempt:
        if quiz_attempt.end_time:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quiz already attempted!")
        else:
            # Update the start time if the quiz was started but not finished
            quiz_attempt.start_time = datetime.now()  
            db.commit()
            return {"message": "Quiz attempt resumed", "quiz_attempt_id": quiz_attempt.id}
    
    else:
        quiz_attempt = Quiz_Attempts(
            user_id=token_details['id'], 
            quiz_id=quiz_id, 
            start_time=datetime.now()
        )
        db.add(quiz_attempt)
        db.commit()
        return {"message": "Quiz attempt started", "quiz_attempt_id": quiz_attempt.id}





@router.post('/complete_quiz')
async def complete_quiz(quiz_attempt_id: int, score: float, db: db_dependency,token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    token_details = await verify_token(token.credentials)
    if token_details == None :
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid Access token")
    

    # Chech whether the quiz has started or not 
    quiz_attempt = db.query(Quiz_Attempts).filter(Quiz_Attempts.id == quiz_attempt_id).first()
    if quiz_attempt is None:
        raise HTTPException(status_code=404, detail="You have not attempted the quiz yet")
    
    # check whether the quiz has already completed
    if quiz_attempt.end_time:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail='Quiz already completed before')
    else:
        quiz_attempt.end_time = datetime.now()
        quiz_attempt.score = score
        db.commit()
        
        return {"message": "Quiz completed", "score": score}




@router.get('/attempted_quizzes')
async def attempted_quizzes(db:db_dependency,token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    token_details = await verify_token(token.credentials)
    if token_details == None :
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid Access token")
    
    attempts = (
        db.query(Quiz_Attempts, Quiz)
        .join(Quiz, Quiz_Attempts.quiz_id == Quiz.id)
        .filter(Quiz_Attempts.user_id == token_details['id'])
        .all()
        )
    
    response = []
    for attempt, quiz in attempts:
        response.append({
            "quiz_id": attempt.quiz_id,
            "quiz_name": quiz.name,
            "difficulty": quiz.difficulty,
            "max_time": quiz.max_time,
            "start_time": attempt.start_time,
            "end_time": attempt.end_time,
            "score": attempt.score,
        })

    return response
