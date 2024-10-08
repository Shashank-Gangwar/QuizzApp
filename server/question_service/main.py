from fastapi import FastAPI
from database import engine
import models, question_routes


app = FastAPI()

models.Base.metadata.create_all(bind=engine)

app.include_router(question_routes.router)







