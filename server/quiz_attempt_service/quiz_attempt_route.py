from collections import defaultdict
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from pydantic import BaseModel, Field
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Quiz, Quiz_question, Quiz_tag,Users,Tag
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, OAuth2PasswordBearer
from starlette import status
from httpx import AsyncClient


router = APIRouter(
    prefix="/quiz",
    tags=['quiz']
)


def get_db():
    db = SessionLocal()
    try: 
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
auth_scheme = HTTPBearer()


