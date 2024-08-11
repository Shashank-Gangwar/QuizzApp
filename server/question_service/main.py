from fastapi import FastAPI
import models
from database import  engine
import routes

app = FastAPI()

models.Base.metadata.create_all(bind=engine)

app.include_router(routes.router)







