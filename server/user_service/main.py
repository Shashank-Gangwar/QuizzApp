from fastapi import  FastAPI
from database import  engine
import models
from routes import auth, user

app = FastAPI()



models.Base.metadata.create_all(bind=engine)

# Adding routes
app.include_router(auth.router)
app.include_router(user.router)

