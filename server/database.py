from sqlalchemy.ext.declarative import declarative_base


SQLALCHEMY_DATABASE_URL = 'postgresql://postgres:shashank@localhost:5432/Quizz'


Base = declarative_base()
