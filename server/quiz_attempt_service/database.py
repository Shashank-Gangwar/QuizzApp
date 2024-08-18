from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base


SQLALCHEMY_DATABASE_URL = 'postgresql://postgres:shashank@localhost:5432/Quizz'

#creating a connection to database
engine = create_engine(SQLALCHEMY_DATABASE_URL) 


SessionLocal  = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
