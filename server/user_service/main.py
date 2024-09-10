from fastapi import  FastAPI
from database import  engine
from fastapi.middleware.cors import CORSMiddleware
import models
from routes import auth, user

app = FastAPI()

# Cors
origins = [
    "http://localhost:5173",
    "https://quizzard-shashank.netlify.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows all origins from the list
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

models.Base.metadata.create_all(bind=engine)

# Adding routes
app.include_router(auth.router)
app.include_router(user.router)

