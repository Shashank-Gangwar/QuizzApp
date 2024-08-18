from fastapi import FastAPI
import models,quiz_attempt_route
from database import engine

app = FastAPI()

models.Base.metadata.create_all(bind=engine)



app.include_router(quiz_attempt_route.router)


