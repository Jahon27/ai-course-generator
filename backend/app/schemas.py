from pydantic import BaseModel, EmailStr
from typing import List

class UserRegister(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True


class CourseCreate(BaseModel):
    title: str
    description: str
    category: str
    level: str
    duration: str


class CourseResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    level: str
    duration: str

    class Config:
        from_attributes = True


class EnrollRequest(BaseModel):
    course_id: int


class ProgressResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    progress_percent: int
    completed_lessons: int

    class Config:
        from_attributes = True


class GenerateQuizRequest(BaseModel):
    lecture_text: str


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    answer: str


class GenerateQuizResponse(BaseModel):
    summary: str
    questions: List[QuizQuestion]