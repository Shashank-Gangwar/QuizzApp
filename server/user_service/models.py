from database import Base
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

class User_role(Base):
    __tablename__ = "user_role"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id' ),nullable=False)
    role_id = Column(Integer, ForeignKey('role.id' ),nullable=False)



class Users(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String)
    email = Column(String)
    password_hash = Column(String)
    created_at = Column(DateTime)


class Role(Base):
    __tablename__ = 'role'

    id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String)
    