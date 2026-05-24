import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/api";

export default function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    fetchCourse();
    fetchLessons();
    checkEnrollment();
  }, [id]);

  async function fetchCourse() {
    const response = await api.get(`/courses/${id}`);
    setCourse(response.data);
  }

  async function fetchLessons() {
    const token = localStorage.getItem("token");

    const response = await api.get(`/courses/${id}/lessons`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setLessons(response.data);
  }

  async function enrollCourse() {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    await api.post(
      "/courses/enroll",
      { course_id: Number(id) },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Enrolled successfully!");
    setEnrolled(true);
  }

  async function checkEnrollment() {
      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await api.get(
        `/courses/${id}/enrollment`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEnrolled(response.data.enrolled);
    }

  if (!course) {
    return <div className="card">Loading course...</div>;
  }

  console.log("Lessons:", lessons);
  return (
    <div>
      <div className="card" style={{ marginBottom: "32px" }}>
        <span className="badge">{course.category}</span>
        <span className="badge">{course.level}</span>

        <h1 style={{ fontSize: "48px", marginBottom: "16px" }}>
          {course.title}
        </h1>

        <p style={{ fontSize: "20px", color: "rgba(255,255,255,0.72)" }}>
          {course.description}
        </p>

        <p>
          <strong>Duration:</strong> {course.duration}
        </p>

        <div style={{ display: "flex", gap: "14px", marginTop: "24px" }}>
          {enrolled ? (
              <button
                style={{
                  background: "rgba(34,197,94,0.2)",
                  border: "1px solid rgba(34,197,94,0.5)"
                }}
              >
                ✓ Enrolled
              </button>
            ) : (
              <button onClick={enrollCourse}>
                Enroll Course
              </button>
            )}

          {lessons.length > 0 && (
            <Link to={`/courses/${id}/lessons/${lessons[0].id}`}>
              <button>Start First Lesson</button>
            </Link>
          )}
        </div>
      </div>

      <h2>Course Lessons</h2>

      <div className="card-grid">
          {lessons.length === 0 ? (
            <div className="card">
              <h3>No lessons yet</h3>
              <p>This course does not have lessons added yet.</p>
            </div>
          ) : (
            lessons.map((lesson, index) => {
              const unlocked =
                  index === 0 ||
                  lesson.unlocked === true ||
                  lesson.unlocked === "true";

              console.log(
                  "Lesson unlock check:",
                  lesson.title,
                  lesson.unlocked,
                  unlocked
                );

              return (
                <div key={lesson.id} className="card">
                  <span className="badge">Lesson {lesson.order_number}</span>

                  <h2>{lesson.title}</h2>

                  {unlocked ? (
                    <>
                      <p style={{ color: "rgba(255,255,255,0.65)" }}>
                        Ready to start this lesson.
                      </p>

                      <Link to={`/courses/${id}/lessons/${lesson.id}`}>
                        <button>Open Lesson</button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <p style={{ color: "rgba(255,255,255,0.45)" }}>
                        🔒 Complete previous lesson first
                      </p>

                      <button disabled>Locked</button>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
    </div>
  );
}