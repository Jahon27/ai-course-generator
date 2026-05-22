import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

export default function CourseDetails() {
  const { id } = useParams();
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    fetchLessons();
  }, [id]);

  async function fetchLessons() {
    const response = await api.get(`/courses/${id}/lessons`);
    setLessons(response.data);
  }

  return (
    <div>
      <h1 className="page-title">Course Lessons</h1>
      <p className="page-subtitle">
        Explore lessons and learning materials for this course.
      </p>

      <div className="card-grid">
        {lessons.length === 0 ? (
          <div className="card">
            <h3>No lessons yet</h3>
            <p>This course does not have lessons added yet.</p>
          </div>
        ) : (
          lessons.map((lesson) => (
            <div key={lesson.id} className="card">
              <span className="badge">Lesson {lesson.order_number}</span>

              <h2>{lesson.title}</h2>
              <p>{lesson.content}</p>

              <button>Mark as Complete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}