from fastapi import FastAPI
from database import engine
import models, routes


app = FastAPI()

models.Base.metadata.create_all(bind=engine)

app.include_router(routes.router)







