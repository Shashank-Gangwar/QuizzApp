import datetime
from database import Base
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String


class Quiz_Attempts(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id' ),nullable=False)
    quiz_id = Column(Integer, ForeignKey('quiz.id' ),nullable=False)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    score = Column(Float, nullable=True)




class Quiz(Base):
    __tablename__ = 'quiz'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    difficulty = Column(String)
    max_time = Column(Integer)
    created_by = Column(Integer, ForeignKey('users.id'),nullable=False)


class Users(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String)
    email = Column(String)
    password_hash = Column(String)
    created_at = Column(DateTime)


