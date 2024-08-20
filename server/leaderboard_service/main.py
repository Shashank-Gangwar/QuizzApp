from fastapi import FastAPI
import models, leaderboard_route
from database import engine

app = FastAPI()

models.Base.metadata.create_all(bind=engine)


app.include_router(leaderboard_route.router)

