from database import Base
from sqlalchemy import Column, ForeignKey, Integer, String

class Question_tag(Base):
    __tablename__ = "question_tag"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey('question.id' ))
    tag_id = Column(Integer, ForeignKey('tag.id' ))



class Question(Base):
    __tablename__ = 'question'

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    option1 = Column(String)
    option2 = Column(String)
    option3 = Column(String)
    option4 = Column(String)
    correct_answer = Column(String)


class Tag(Base):
    __tablename__ = 'tag'

    id = Column(Integer, primary_key=True, index=True)
    tag_name = Column(String)
    