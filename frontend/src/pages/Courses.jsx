import { useEffect, useState } from "react";
import api from "../api/api";
import { Link } from "react-router-dom";

export default function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
      try {
        const response = await api.get("/courses");
        console.log("Courses from backend:", response.data);
        setCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    }

  async function enroll(courseId) {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      await api.post(
        "/courses/enroll",
        {
          course_id: courseId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Enrolled successfully!");
    } catch (error) {
      alert("Enrollment failed");
    }
  }

  return (
  <div>
    <h1 className="page-title">Explore AI-Powered Courses</h1>
    <p className="page-subtitle">
      Learn faster with courses, generated quizzes, flashcards and progress tracking.
    </p>

    <div className="card-grid">
      {courses.map((course) => (
        <div key={course.id} className="card">
          <span className="badge">{course.category}</span>
          <span className="badge">{course.level}</span>

          <h2>{course.title}</h2>
          <p>{course.description}</p>
          <p><strong>Duration:</strong> {course.duration}</p>

            <Link to={`/courses/${course.id}`}>
              <button>View Lessons</button>
            </Link>
          <button onClick={() => enroll(course.id)}>Enroll Course</button>
        </div>
      ))}
    </div>
  </div>
);
}