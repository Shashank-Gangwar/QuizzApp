from collections import defaultdict
from typing import Annotated, Dict, List
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Path, Query, Request
from pydantic import BaseModel, Field
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Quiz, Quiz_question, Quiz_tag,Users,Tag
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, OAuth2PasswordBearer
from starlette import status
from httpx import AsyncClient
import os


router = APIRouter(
    prefix="/quiz",
    tags=['quiz']
)

load_dotenv("../.env")


# Getting environment variables
GET_QUESTIONS_BY_IDS_URL = os.environ.get("GET_QUESTIONS_BY_IDS_URL")
CREATE_QUESTION_URL= os.environ.get("CREATE_QUESTION_URL")
VALIDATE_USER_URL=os.environ.get("VALIDATE_USER_URL")

def get_db():
    db = SessionLocal()
    try: 
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
auth_scheme = HTTPBearer()



async def verify_token(token:str):
    url = VALIDATE_USER_URL 
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    async with AsyncClient() as client:
        try:
            response = await client.get(url,headers=headers)
            response.raise_for_status() 
            if response.status_code==200:
                return response.json()
        except Exception as err:
                # Handle other potential errors (e.g., network issues)
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occurred: {err}")



async def createQuestions(questions:list):
    url = CREATE_QUESTION_URL
    data = [question.dict() for question in questions]  # Convert Pydantic models to dict

    headers = {"Content-Type": "application/json"}
    
    async with AsyncClient() as client:
        response = await client.post(url, headers=headers, json=data)

    if response.status_code != 201 :
        raise HTTPException(status_code=response.status_code, detail="Failed to create questions")
    
    return response.json()


async def get_questions(question_ids:list):
    
    url = GET_QUESTIONS_BY_IDS_URL
    headers = {"Content-Type": "application/json"}
    
    async with AsyncClient() as client:
        response = await client.post(url, headers=headers, json=question_ids)

    if response.status_code != 200 :
        raise HTTPException(status_code=response.status_code, detail="Failed to get questions")
    
    return response.json()

   
    

class Questions(BaseModel):
    text : str = Field(min_length=3)
    option1 : str = Field(min_length=1)
    option2 : str = Field(min_length=1)
    option3 : str = Field(min_length=1)
    option4 : str = Field(min_length=1)
    correct_answer : str = Field(min_length=1)
    tags : list[str] 


class CreateQuizRequest(BaseModel):
    name : str = Field(min_length=5)
    questions : list[Questions] 
    tags: list = Field(min_length=1)
    difficulty : str 
    max_time : int = Field(gt=10)


@router.get('/')
async def get_all_quiz(db:db_dependency,token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    token_details = await verify_token(token.credentials)
    if token_details == None :
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid Access token")
    
    all_quiz =( db.query(Quiz,Tag.tag_name,Users.username.label("created_by"))
                .join(Quiz_tag , Quiz.id==Quiz_tag.quiz_id)
                .join(Tag , Tag.id==Quiz_tag.tag_id)
                .join(Users,Users.id==Quiz.created_by)
                .all()
            )

    # Dictionary to hold quizzes with their associated tags
    quiz_dict = defaultdict(lambda: {"tags": []})

    # Process each result
    for quiz, tag_name,created_by in all_quiz:
        quiz_id = quiz.id
        if quiz_id not in quiz_dict:
            # Add quiz details the first time this quiz_id is encountered
            quiz_dict[quiz_id] = {
                "id": quiz.id,
                "name": quiz.name,
                "difficulty": quiz.difficulty,
                "max_time": quiz.max_time,
                "created_by":created_by,
                "tags": []
            }
        # Append the tag to the quiz tags list
        quiz_dict[quiz_id]["tags"].append(tag_name)

    # Convert dictionary to a list for the response
    quiz_list = list(quiz_dict.values())

    return quiz_list;


@router.get('/my_quizes')
async def my_quizes( db:db_dependency,token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    token_details = await verify_token(token.credentials)
    if token_details == None :
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid Access token")
    
    if token_details['role'] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="Invalid request")
    
    all_quiz =( db.query(Quiz,Tag.tag_name)
                .join(Quiz_tag , Quiz.id==Quiz_tag.quiz_id)
                .join(Tag , Tag.id==Quiz_tag.tag_id)
                .filter(Quiz.created_by==token_details['id'])
                .all()
            )

    # Dictionary to hold quizzes with their associated tags
    quiz_dict = defaultdict(lambda: {"tags": []})

    # Process each result
    for quiz, tag_name in all_quiz:
        quiz_id = quiz.id
        if quiz_id not in quiz_dict:
            # Add quiz details the first time this quiz_id is encountered
            quiz_dict[quiz_id] = {
                "id": quiz.id,
                "name": quiz.name,
                "difficulty": quiz.difficulty,
                "max_time": quiz.max_time,
                "created_by":token_details['username'],
                "tags": []
            }
        # Append the tag to the quiz tags list
        quiz_dict[quiz_id]["tags"].append(tag_name)

    # Convert dictionary to a list for the response
    quiz_list = list(quiz_dict.values())
    

    return quiz_list;





@router.get('/{quiz_id}')
async def quiz_by_id(db:db_dependency,token: HTTPAuthorizationCredentials = Depends(auth_scheme),quiz_id:int = Path(gt=0)):
    token_details = await verify_token(token.credentials)
    if token_details == None :
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid Access token")
    
    # Getting quiz from db
    quiz_details = db.query(Quiz).filter(Quiz.id==quiz_id).first()
    if quiz_details is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="quiz not found")
    quiz_details.created_by = token_details['username']   # created_by updated to username

    # Getting tags of the quiz
    tags = db.query(Tag.tag_name).join(Quiz_tag , Tag.id==Quiz_tag.tag_id).filter(Quiz_tag.quiz_id == quiz_id).all()

    question_ids = db.query(Quiz_question.question_id).filter(Quiz_question.quiz_id==quiz_details.id).all()
    questions = [question[0] for question in question_ids ]

    question_details = await get_questions(questions)

    
    quiz_details_response =quiz_details.__dict__
    quiz_details_response["tags"] = [t[0] for t in tags]
    quiz_details_response['questions'] = question_details
    
    

    return quiz_details_response;




@router.post('/create_quiz')
async def create_quiz(create_quiz_request 
                      : CreateQuizRequest,db:db_dependency,token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    
    token_details = await verify_token(token.credentials)
    if token_details == None :
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid Access token")
    
    if token_details['role'] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="Not Authorized")
    
    try:
        # Creating new quiz 
        create_quiz_model = Quiz( name= create_quiz_request.name,
            difficulty= create_quiz_request.difficulty,
            max_time= create_quiz_request.max_time,
            created_by= token_details["id"])
        
        db.add(create_quiz_model)
        db.flush()

        # Inserting tags of related to quiz and taking IDs of all
        tag_ids = []
        for tag in create_quiz_request.tags:
            existing_tag = db.query(Tag).filter(Tag.tag_name == tag).first()
            if existing_tag:
                tag_ids.append(existing_tag.id)
            else:
                new_tag = Tag(tag_name=tag)
                db.add(new_tag)
                db.flush()  # flush to get the tag's ID
                tag_ids.append(new_tag.id)

        # Inserting tag_is and quiz_id in quiz_tag table for many to many relation
        quiz_tag_models = []
        for tag_id in tag_ids:
            quiz_tag_model = Quiz_tag(quiz_id = create_quiz_model.id,
                                    tag_id = tag_id
                                    )
            quiz_tag_models.append(quiz_tag_model)
        db.add_all(quiz_tag_models)


        # post request to create questions and getting their ids
        question_ids = []
        if create_quiz_request.questions:
            response = await createQuestions(create_quiz_request.questions)
            print(response)
            if not response['question_ids']:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail="Failed to create quiz. Internal server error.")
        
        # Inserting question_id and quiz_id in quiz_question table for many to many relation
        question_ids = response['question_ids']
        for question_id in question_ids:
            quiz_question_model = Quiz_question( quiz_id = create_quiz_model.id,
                                            question_id = question_id
                                            )
            db.add(quiz_question_model)

        db.commit()
        return {'deatil':"Quiz created successfully", 'Quiz id' : create_quiz_model.id}


    except Exception as e:
        db.rollback()
        return {"message": "An error occurred while creating the quiz. Transaction rolled back.","error":e }   






@router.get('/filter_quiz/')
async def filter_quiz(
    db: db_dependency,
    token: HTTPAuthorizationCredentials = Depends(auth_scheme),
    string: str = Query(None, min_length=1),
    time: int = Query(None,ge=0),
    difficulty: str = Query(None, min_length=1),
    filter_tag: str = Query(None, min_length=1),
):
    token_details = await verify_token(token.credentials)
    if token_details == None :
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid Access token")
    
    print(filter_tag)
    tags = filter_tag.split(',') if filter_tag else []
    print(tags)
    query = (db.query(Quiz.id.label("quiz_id"), 
                        Quiz.name.label("quiz"), 
                        Quiz.difficulty, 
                        Quiz.max_time, 
                        Users.username.label("created_by"), 
                        Tag.tag_name)
                .join(Quiz_tag, Quiz.id == Quiz_tag.quiz_id)
                .join(Tag, Tag.id == Quiz_tag.tag_id)
                .join(Users, Users.id == Quiz.created_by))
    
    filters = []

    if string:
        filters.append(Quiz.name.ilike(f"%{string}%"))

    if tags:
        filters.extend([Tag.tag_name.ilike(f"%{tag}%") for tag in tags])

    # Combine all filters using `or_`
    if filters:
        # Execute the query and fetch results
        filtered_quizzes = query.filter(or_(*filters)).all()

        # check if got any Quiz after filtering if not return {}
        # code to remove the same quiz to one ,occurred due to multiple tags
        # and add all tag of same quiz to one of that quiz
        # then filter those quizes on the basis of max_time and difficulty
        # then code to convert the filtered quiz to returned format


        # Process results to remove duplicates and aggregate tags
        quiz_dict = defaultdict(lambda: {"tags": []})
        for quiz_id, quiz_name, difficulty, max_time, created_by, tag_name in filtered_quizzes:
            quiz_dict[quiz_id]["quiz"] = quiz_name
            quiz_dict[quiz_id]["difficulty"] = difficulty
            quiz_dict[quiz_id]["max_time"] = max_time
            quiz_dict[quiz_id]["created_by"] = created_by
            if tag_name:
                quiz_dict[quiz_id]["tags"].append(tag_name)

        # Convert the filtered quizzes to the final returned format
        result = [{
            "id": quiz_id,
            "name": details["quiz"],
            "difficulty": details["difficulty"],
            "max_time": details["max_time"],
            "tags": details["tags"],
            "created_by": details["created_by"],
        } for quiz_id, details in quiz_dict.items()]

        # Apply additional filters based on max_time and difficulty
        if time or difficulty:
            result = [quiz for quiz in result
                      if (time is None or quiz["max_time"] <= time) and
                         (difficulty is None or quiz["difficulty"] == difficulty)]

        return {"quizzes": result}



    else:
        if time or difficulty:
            filtered_quizzes = query.filter(and_(
                (Quiz.difficulty == difficulty) if difficulty else True,
                (Quiz.max_time <= time) if time else True
            )).all()

            # check if got any Quiz after filtering if not return {}
            # code to convert the filtered quiz to returned format

            # Process results
            quiz_dict = defaultdict(lambda: {"tags": []})
            for quiz_id, quiz_name, difficulty, max_time, created_by, tag_name in filtered_quizzes:
                quiz_dict[quiz_id]["quiz"] = quiz_name
                quiz_dict[quiz_id]["difficulty"] = difficulty
                quiz_dict[quiz_id]["max_time"] = max_time
                quiz_dict[quiz_id]["created_by"] = created_by
                if tag_name:
                    quiz_dict[quiz_id]["tags"].append(tag_name)

            # Convert the filtered quizzes to the final returned format
            result = [{
                "id": quiz_id,
                "name": details["quiz"],
                "difficulty": details["difficulty"],
                "max_time": details["max_time"],
                "tags": details["tags"],
                "created_by": details["created_by"],
            } for quiz_id, details in quiz_dict.items()]

            return {"quizzes": result}

        else:
            return {"message":"Filters not provided"}

    
    