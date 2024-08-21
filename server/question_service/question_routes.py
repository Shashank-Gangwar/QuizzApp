from fastapi import  APIRouter, Body,Depends, HTTPException, Path
from typing import Annotated, List
from psycopg2 import IntegrityError
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from starlette import status
from models import Question, Question_tag, Tag
from database import SessionLocal

router = APIRouter(
    prefix='/question',
    tags=['question']
)



def get_db():
    db = SessionLocal()
    try: 
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]


class QuestionRequest(BaseModel):
    text : str = Field(min_length=3)
    option1 : str = Field(min_length=1)
    option2 : str = Field(min_length=1)
    option3 : str = Field(min_length=1)
    option4 : str = Field(min_length=1)
    correct_answer : str = Field(min_length=1)
    tags : list[str] 


# >---------------------- Routes -------------------------<




# Get all the questions
@router.get("/getall")
async def read_all_questions(db:db_dependency):
    return db.query(Question).all()



# Get particular Question using Question Id
@router.get("/{question_id}")
async def read_particular_question(db:db_dependency , question_id:int = Path(gt=0)):

    question = db.query(Question).filter(Question.id==question_id).first()
    if question is None:
        raise HTTPException(status_code=404,detail="Question not found.")


    tag_ids =  db.query(Question_tag).filter(Question_tag.question_id==question_id).all()
    tags = []
    for tag in tag_ids:
        tags.append((db.query(Tag).filter(Tag.id==tag.tag_id).first()).tag_name)
    
    response_question = question.__dict__  
    response_question["tags"] = response_question.get("tags", []) + tags

    return response_question



# Getting questions of listed IDs
@router.post("/questions-by-ids")
async def get_questions_by_ids(db:db_dependency,question_ids: list[int] = Body(...)):
    questions = db.query(Question).filter(Question.id.in_(question_ids)).all()
    

    questions_list = [ {
        'question_id': question.id,
    'text': question.text,
    'option1': question.option1,
    'option2': question.option2,
    'option3': question.option3,
    'option4': question.option4,
    'correct_answer': question.correct_answer
} for question in questions]
    
    return questions_list




# creating new multiple Questions with its Tags
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_questions(db:db_dependency,questions:List[QuestionRequest]):
    try:
        # Inserting new Question
        created_questions = []
        for question_request in questions:
            tags = question_request.tags
            question_data = question_request.dict(exclude={"tags"})
            question_model = Question(**question_data)
            db.add(question_model)
            db.flush()
            new_question_id =  question_model.id
            

            # Inserting new tags and taking IDs of all
            new_tag_ids = []
            for tag in tags:
                existing_tag = db.query(Tag).filter(Tag.tag_name == tag).first()
                if existing_tag:
                    new_tag_ids.append(existing_tag.id)
                else:
                    new_tag = Tag(tag_name=tag)
                    db.add(new_tag)
                    db.flush()  # flush to get the new tag's ID
                    new_tag_ids.append(new_tag.id)



            # here in question_tag table inserting the question ID and its all tag Ids
            question_tag_models = []
            for tag_id in new_tag_ids:
                question_tag_data = {"question_id": new_question_id, "tag_id": tag_id}
                question_tag_model = Question_tag(**question_tag_data)
                question_tag_models.append(question_tag_model)
            db.add_all(question_tag_models)
            created_questions.append(new_question_id)
        db.commit()  # commiting the entire transaction
        print(created_questions)
        return {"message": "Question created successfully","question_ids": created_questions}
    
    except IntegrityError as e:
        # handle DB integrity errors (which occur when unique constraints, foreign key constraints, or other database-level constraints are violated.)
        db.rollback()
        return {"error": "An error occurred while creating the question. Transaction rolled back.(Integrity Error)"}
    
    except Exception as e:
        # Handle other exceptions
        db.rollback()
        return {"error": "An error occurred while creating the question. Transaction rolled back."}





# updating the existing question using Question Id
@router.put("/{question_id}")
async def update_question(db:db_dependency ,question_request:QuestionRequest,  question_id:int = Path(gt=0)):
    
    # checking if the question exits
    question_model = db.query(Question).filter(Question.id == question_id).first()
    if question_model is None:
        raise HTTPException(status_code=404,detail="Question not found!")
        
    try:
        # Updating question
        question_model.text = question_request.text
        question_model.option1 = question_request.option1
        question_model.option2 = question_request.option2
        question_model.option3 = question_request.option3
        question_model.option4 = question_request.option4
        question_model.correct_answer = question_request.correct_answer
        db.add(question_model)


        question_request_tags = question_request.tags  # tags from request

        tag_names = db.query(Tag.tag_name).filter(Tag.id == Question_tag.tag_id, Question_tag.question_id == question_id).all()
        tag_names_list = [tag_name[0] for tag_name in tag_names] # tags from db

        if not tag_names_list == question_request_tags:
            # firstly deleting all rows qestion_tag table where question_id 
            db.query(Question_tag).filter(Question_tag.question_id == question_id).delete()

            # Inserting new tags and taking IDs of all
            new_tag_ids = []
            for tag in question_request_tags:
                existing_tag = db.query(Tag).filter(Tag.tag_name == tag).first()
                if existing_tag:
                    new_tag_ids.append(existing_tag.id)
                else:
                    new_tag = Tag(tag_name=tag)
                    db.add(new_tag)
                    db.flush()  # flush to get the new tag's ID
                    new_tag_ids.append(new_tag.id)

            # now updating tags for the question
            question_tag_models = []
            for tag_id in new_tag_ids:
                question_tag_data = {"question_id": question_id, "tag_id": tag_id}
                question_tag_model = Question_tag(**question_tag_data)
                question_tag_models.append(question_tag_model)
            db.add_all(question_tag_models)

        db.commit()

        return {"message":"update successful."}
        
    except IntegrityError as e:
        db.rollback()
        return {"error": "An error occurred while Updating the Question. Transaction rolled back. (Integrity Error)"}
    
    except Exception as e:
        db.rollback()
        return {"error": "An error occurred while Updating the Question. Transaction rolled back."}






# Delete the existing question using Question Id
@router.delete("/{question_id}")
async def delete_questions(db:db_dependency ,  question_ids: List[int] = Body(...)):
    try:
        # Check if all the questions exist
        questions = db.query(Question).filter(Question.id.in_(question_ids)).all()
        
        if len(questions) != len(question_ids):
            raise HTTPException(status_code=404, detail="One or more questions not found!")

        # deleting all the related rows in question_tag table
        db.query(Question_tag).filter(Question_tag.question_id.in_(question_ids)).delete(synchronize_session=False)

        # then delete the questions
        db.query(Question).filter(Question.id.in_(question_ids)).delete(synchronize_session=False)

        db.commit()
            
    except Exception as e:
        db.rollback()
        return {"status":status.HTTP_500_INTERNAL_SERVER_ERROR,"message": "An error occurred while deleting the question. Transaction rolled back.","error":e}

    return {"detail": "Questions deleted successfully"}



    