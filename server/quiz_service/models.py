from database import Base
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String


class Quiz_tag(Base):
    __tablename__ = "quiz_tag"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey('quiz.id' ),nullable=False)
    tag_id = Column(Integer, ForeignKey('tag.id' ),nullable=False)


class Quiz_question(Base):
    __tablename__ = "quiz_question"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey('quiz.id' ),nullable=False)
    question_id = Column(Integer, ForeignKey('question.id' ),nullable=False)


class Quiz(Base):
    __tablename__ = 'quiz'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    difficulty = Column(String)
    max_time = Column(Integer)
    created_by = Column(Integer, ForeignKey('users.id'),nullable=False)


class Tag(Base):
    __tablename__ = 'tag'

    id = Column(Integer, primary_key=True, index=True)
    tag_name = Column(String)

    __table_args__ = {'extend_existing': True}


class Question(Base):
    __tablename__ = 'question'

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    option1 = Column(String)
    option2 = Column(String)
    option3 = Column(String)
    option4 = Column(String)
    correct_answer = Column(String)

    __table_args__ = {'extend_existing': True}


class Users(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String)
    email = Column(String)
    password_hash = Column(String)
    created_at = Column(DateTime)

    __table_args__ = {'extend_existing': True}


