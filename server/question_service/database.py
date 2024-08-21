import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

load_dotenv("../.env")

SQLALCHEMY_DATABASE_URL = os.environ.get("SQLALCHEMY_DATABASE_URL") # Database URL from environment

#creating a connection to database
engine = create_engine(SQLALCHEMY_DATABASE_URL) 


SessionLocal  = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
