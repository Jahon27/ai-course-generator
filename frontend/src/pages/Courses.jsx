import { useEffect, useState } from "react";
import api from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
    fetchEnrolledCourses();
  }, []);

  async function fetchEnrolledCourses() {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const response = await api.get("/me/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setEnrolledCourseIds(response.data.map((item) => item.course_id));
      } catch (error) {
        console.error(error);
      }
    }

  async function fetchCourses() {
      try {
        const response = await api.get("/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    }

  async function enroll(courseId) {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      setTimeout(() => {
        navigate("/login");
      }, 1500);

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

      toast.success("Enrolled successfully!");
      setEnrolledCourseIds([...enrolledCourseIds, courseId]);
    } catch (error) {
      toast.error("Enrollment failed");
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

            <div className="course-actions">
              <Link to={`/courses/${course.id}`}>
                <button>View Lessons</button>
              </Link>

              {enrolledCourseIds.includes(course.id) ? (
                <button className="enrolled-badge">✓ Enrolled</button>
              ) : (
                <button onClick={() => enroll(course.id)}>
                  Enroll Course
                </button>
              )}
            </div>
        </div>
      ))}
    </div>
  </div>
);
}