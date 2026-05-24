from pydantic import BaseModel, EmailStr
from typing import List

class UserRegister(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    avatar: str | None = None
    occupation: str | None = None
    interests: str | None = None

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

class LessonCreate(BaseModel):
    course_id: int
    title: str
    content: str
    order_number: int


class LessonResponse(BaseModel):
    id: int
    course_id: int
    title: str
    content: str
    order_number: int

    class Config:
        from_attributes = True


class SaveQuizResultRequest(BaseModel):
    summary: str
    questions: list[QuizQuestion]
    score: int
    total_questions: int


class SavedQuizResponse(BaseModel):
    id: int
    user_id: int
    summary: str
    questions_json: str
    score: int
    total_questions: int

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    avatar: str | None = None
    occupation: str | None = None
    interests: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str