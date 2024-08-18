from fastapi import FastAPI
import quiz_route
import models
from database import engine

app = FastAPI()

models.Base.metadata.create_all(bind=engine)



app.include_router(quiz_route.router)


