import { useEffect, useState } from "react";
import api from "../api/api";

export default function Dashboard() {
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    fetchDashboard();
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

  return (
  <div>
    <h1 className="page-title">My Learning Dashboard</h1>
    <p className="page-subtitle">
      Track your enrolled courses, learning progress and streak.
    </p>

    <div className="card" style={{ marginBottom: "24px" }}>
      <h2>🔥 Current Streak: 3 days</h2>
      <p>Keep learning daily to grow your streak.</p>
    </div>

    <div className="card-grid">
      {progress.length === 0 ? (
        <div className="card">No enrolled courses yet.</div>
      ) : (
        progress.map((item) => (
          <div key={item.id} className="card">
            <h3>Course #{item.course_id}</h3>
            <p><strong>Completed lessons:</strong> {item.completed_lessons}</p>
            <p><strong>Progress:</strong> {item.progress_percent}%</p>

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
  </div>
);
}