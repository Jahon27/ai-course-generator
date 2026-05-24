from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File
from pypdf import PdfReader
import io
from sqlalchemy.orm import Session
from jose import jwt, JWTError
import os
import json

from .database import Base, engine, get_db
from .models import User, Course, UserCourseProgress, Lesson, GeneratedQuiz, LessonProgress
from .ai_service import generate_quiz_from_text
from .schemas import (
    UserRegister,
    UserLogin,
    UserResponse,
    CourseCreate,
    CourseResponse,
    EnrollRequest,
    ProgressResponse,
    GenerateQuizRequest,
    GenerateQuizResponse,
    LessonCreate,
    LessonResponse,
    SaveQuizResultRequest,
    SavedQuizResponse,
    UserProfileUpdate,
    ChangePasswordRequest
)
from .auth import hash_password, verify_password, create_access_token

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Course Generator API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
        "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            os.getenv("SECRET_KEY"),
            algorithms=[os.getenv("ALGORITHM")]
        )
        email = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

@app.get("/")
def root():
    return {"message": "AI Course Generator API is running"}


@app.post("/auth/register", response_model=UserResponse)
def register(user: UserRegister, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password_hash=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.post("/auth/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()

    if not existing_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(user.password, existing_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": existing_user.email}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.post("/courses", response_model=CourseResponse)
def create_course(course: CourseCreate, db: Session = Depends(get_db)):

    new_course = Course(
        title=course.title,
        description=course.description,
        category=course.category,
        level=course.level,
        duration=course.duration
    )

    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    return new_course


@app.get("/courses", response_model=list[CourseResponse])
def get_courses(db: Session = Depends(get_db)):

    courses = db.query(Course).all()

    return courses

@app.post("/courses/enroll", response_model=ProgressResponse)
def enroll_course(
    request: EnrollRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == request.course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    existing_progress = db.query(UserCourseProgress).filter(
        UserCourseProgress.user_id == current_user.id,
        UserCourseProgress.course_id == request.course_id
    ).first()

    if existing_progress:
        return existing_progress

    progress = UserCourseProgress(
        user_id=current_user.id,
        course_id=request.course_id,
        progress_percent=0,
        completed_lessons=0
    )

    db.add(progress)
    db.commit()
    db.refresh(progress)

    return progress


@app.get("/me/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    progress_items = db.query(UserCourseProgress).filter(
        UserCourseProgress.user_id == current_user.id
    ).all()

    result = []

    for item in progress_items:
        course = db.query(Course).filter(Course.id == item.course_id).first()

        total_lessons = db.query(Lesson).filter(
            Lesson.course_id == item.course_id
        ).count()

        completed_lessons = db.query(LessonProgress).join(Lesson).filter(
            LessonProgress.user_id == current_user.id,
            LessonProgress.completed == True,
            Lesson.course_id == item.course_id
        ).count()

        progress_percent = 0

        if total_lessons > 0:
            progress_percent = round((completed_lessons / total_lessons) * 100)

        result.append({
            "id": item.id,
            "course_id": item.course_id,
            "course_title": course.title if course else "Unknown Course",
            "completed_lessons": completed_lessons,
            "total_lessons": total_lessons,
            "progress_percent": progress_percent
        })

    return result

@app.post("/ai/generate-quiz", response_model=GenerateQuizResponse)
def generate_quiz(
    request: GenerateQuizRequest,
    current_user: User = Depends(get_current_user)
):
    result = generate_quiz_from_text(request.lecture_text)
    return result

@app.post("/ai/generate-quiz-from-pdf")
async def generate_quiz_from_pdf(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    pdf_bytes = await file.read()

    pdf_reader = PdfReader(io.BytesIO(pdf_bytes))

    lecture_text = ""

    for page in pdf_reader.pages[:3]:
        text = page.extract_text()

        if text:
            lecture_text += text + "\n"

    if not lecture_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from PDF"
        )

    result = generate_quiz_from_text(lecture_text)

    return result

@app.post("/lessons", response_model=LessonResponse)
def create_lesson(
    lesson: LessonCreate,
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == lesson.course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    new_lesson = Lesson(
        course_id=lesson.course_id,
        title=lesson.title,
        content=lesson.content,
        order_number=lesson.order_number
    )

    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)

    return new_lesson


@app.get("/courses/{course_id}/lessons")
def get_course_lessons(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lessons = db.query(Lesson).filter(
        Lesson.course_id == course_id
    ).order_by(Lesson.order_number).all()

    result = []

    for index, lesson in enumerate(lessons):

        if index == 0:
            unlocked = True
        else:
            previous_lesson = lessons[index - 1]

            completed = db.query(LessonProgress).filter(
                LessonProgress.user_id == current_user.id,
                LessonProgress.lesson_id == previous_lesson.id,
                LessonProgress.completed == True
            ).first()

            unlocked = completed is not None

        lesson_data = {
            "id": lesson.id,
            "title": lesson.title,
            "content": lesson.content,
            "order_number": lesson.order_number,
            "course_id": lesson.course_id,
            "unlocked": unlocked
        }

        result.append(lesson_data)

    return result

@app.post("/quizzes/save", response_model=SavedQuizResponse)
def save_quiz_result(
    request: SaveQuizResultRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    saved_quiz = GeneratedQuiz(
        user_id=current_user.id,
        summary=request.summary,
        questions_json=json.dumps([q.model_dump() for q in request.questions]),
        score=request.score,
        total_questions=request.total_questions
    )

    db.add(saved_quiz)
    db.commit()
    db.refresh(saved_quiz)

    return saved_quiz


@app.get("/me/quizzes", response_model=list[SavedQuizResponse])
def get_my_quizzes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(GeneratedQuiz).filter(
        GeneratedQuiz.user_id == current_user.id
    ).order_by(GeneratedQuiz.created_at.desc()).all()

@app.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.put("/auth/profile", response_model=UserResponse)
def update_profile(
    profile: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if profile.first_name is not None:
        current_user.first_name = profile.first_name

    if profile.last_name is not None:
        current_user.last_name = profile.last_name

    if profile.avatar is not None:
        current_user.avatar = profile.avatar

    if profile.occupation is not None:
        current_user.occupation = profile.occupation

    if profile.interests is not None:
        current_user.interests = profile.interests

    db.commit()
    db.refresh(current_user)

    return current_user


@app.put("/auth/change-password")
def change_password(
    request: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.password_hash = hash_password(request.new_password)

    db.commit()

    return {"message": "Password changed successfully"}

@app.get("/courses/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: int,
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    return course

@app.get("/lessons/{lesson_id}", response_model=LessonResponse)
def get_lesson(
    lesson_id: int,
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    return lesson

@app.post("/lessons/{lesson_id}/complete")
def complete_lesson(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id,
        LessonProgress.lesson_id == lesson_id
    ).first()

    if existing:
        existing.completed = True
    else:
        progress = LessonProgress(
            user_id=current_user.id,
            lesson_id=lesson_id,
            completed=True
        )

        db.add(progress)

    db.commit()

    return {"message": "Lesson completed"}

@app.get("/courses/{course_id}/enrollment")
def check_enrollment(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    enrollment = db.query(UserCourseProgress).filter(
        UserCourseProgress.user_id == current_user.id,
        UserCourseProgress.course_id == course_id
    ).first()

    return {
        "enrolled": enrollment is not None
    }