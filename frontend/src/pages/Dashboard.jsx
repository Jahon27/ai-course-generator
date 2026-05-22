import { useEffect, useState } from "react";
import api from "../api/api";

export default function Dashboard() {
  const [progress, setProgress] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetchDashboard();
    fetchQuizzes();
  }, []);

  async function fetchDashboard() {
    const token = localStorage.getItem("token");

    try {
      const response = await api.get("/me/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProgress(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchQuizzes() {
    const token = localStorage.getItem("token");

    try {
      const response = await api.get("/me/quizzes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setQuizzes(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  const completedQuizzes = quizzes.length;

  const averageScore =
    quizzes.length === 0
      ? 0
      : Math.round(
          quizzes.reduce(
            (sum, quiz) => sum + (quiz.score / quiz.total_questions) * 100,
            0
          ) / quizzes.length
        );

  return (
    <div>
      <h1 className="page-title">My Learning Dashboard</h1>
      <p className="page-subtitle">
        Track your progress, quiz results and learning activity.
      </p>

      <div className="card-grid" style={{ marginBottom: "32px" }}>
        <div className="card">
          <h2>🔥 Current Streak</h2>
          <p style={{ fontSize: "32px", fontWeight: "800" }}>3 days</p>
        </div>

        <div className="card">
          <h2>🧠 Completed Quizzes</h2>
          <p style={{ fontSize: "32px", fontWeight: "800" }}>
            {completedQuizzes}
          </p>
        </div>

        <div className="card">
          <h2>📊 Average Score</h2>
          <p style={{ fontSize: "32px", fontWeight: "800" }}>
            {averageScore}%
          </p>
        </div>
      </div>

      <h2>Enrolled Courses</h2>

      <div className="card-grid" style={{ marginBottom: "40px" }}>
        {progress.length === 0 ? (
          <div className="card">No enrolled courses yet.</div>
        ) : (
          progress.map((item) => (
            <div key={item.id} className="card">
              <h3>Course #{item.course_id}</h3>
              <p>
                <strong>Completed lessons:</strong> {item.completed_lessons}
              </p>
              <p>
                <strong>Progress:</strong> {item.progress_percent}%
              </p>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${item.progress_percent}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <h2>Recent Quiz Results</h2>

      <div className="card-grid">
        {quizzes.length === 0 ? (
          <div className="card">No quiz results saved yet.</div>
        ) : (
          quizzes.slice(0, 6).map((quiz) => (
            <div key={quiz.id} className="card">
              <span className="badge">
                {quiz.score}/{quiz.total_questions}
              </span>

              <h3>Saved AI Quiz</h3>
              <p>{quiz.summary}</p>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.round(
                      (quiz.score / quiz.total_questions) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}