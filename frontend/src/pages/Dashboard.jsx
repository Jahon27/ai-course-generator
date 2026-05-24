import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function Dashboard() {
  const [progress, setProgress] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [user, setUser] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
      first_name: "",
      last_name: "",
      avatar: "",
      occupation: "",
      interests: "",
    });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
  });
  const avatarOptions = [
      "/avatars/avatar1.jpg",
      "/avatars/avatar2.jpg",
      "/avatars/avatar3.jpg",
      "/avatars/avatar4.jpg",
      "/avatars/avatar5.jpg",
      "/avatars/avatar6.jpg",
      "/avatars/avatar7.jpg",
      "/avatars/avatar8.jpg",
      "/avatars/avatar9.jpg",
      "/avatars/avatar10.jpg",
    ];

  useEffect(() => {
    fetchDashboard();
    fetchQuizzes();
    fetchUser();
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

  async function fetchUser() {
      const token = localStorage.getItem("token");

      try {
        const response = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
        setProfileForm({
          first_name: response.data.first_name || "",
          last_name: response.data.last_name || "",
          avatar: response.data.avatar || "",
          occupation: response.data.occupation || "",
          interests: response.data.interests || "",
        });
      } catch (error) {
        console.error(error);
      }
    }

  async function updateProfile() {
      const token = localStorage.getItem("token");

      const response = await api.put("/auth/profile", profileForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
      setShowEditProfile(false);
      alert("Profile updated!");
    }

    async function changePassword() {
      const token = localStorage.getItem("token");

      await api.put("/auth/change-password", passwordForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPasswordForm({
        current_password: "",
        new_password: "",
      });

      alert("Password changed!");
    }

  return (
    <div>
      <h1 className="page-title">My Learning Dashboard</h1>
      <p className="page-subtitle">
        Track your progress, quiz results and learning activity.
      </p>

      {user && (
          <div className="card" style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div
                style={{
                  width: "82px",
                  height: "82px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  fontWeight: "800",
                }}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    style={{
                      width: "82px",
                      height: "82px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`
                )}
              </div>

              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0 }}>
                  Welcome back, {user.first_name || user.email.split("@")[0]}
                </h2>

                <p style={{ color: "rgba(255,255,255,0.65)" }}>
                  {user.occupation || "Add occupation"} ·{" "}
                  {user.interests || "Add interests"}
                </p>
              </div>

              <button onClick={() => setShowEditProfile(!showEditProfile)}>
                Edit Profile
              </button>
            </div>
          </div>
        )}

      {showEditProfile && (
      <div className="card" style={{ marginBottom: "32px" }}>
        <h2>Edit Profile</h2>

       <label>First Name</label>
        <input
          value={profileForm.first_name}
          onChange={(e) =>
            setProfileForm({ ...profileForm, first_name: e.target.value })
          }
          placeholder="Your First Name"
        />

        <label>Last Name</label>
        <input
          value={profileForm.last_name}
          onChange={(e) =>
            setProfileForm({ ...profileForm, last_name: e.target.value })
          }
          placeholder="Your Last Name"
        />

        <label>Choose Avatar</label>

        <div style={{ display: "flex", gap: "12px", margin: "12px 0 20px", flexWrap: "wrap" }}>
          {avatarOptions.map((avatar) => (
            <button
              key={avatar}
              onClick={() => setProfileForm({ ...profileForm, avatar })}
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                padding: "3px",
                background:
                  profileForm.avatar === avatar
                    ? "linear-gradient(135deg, #6366f1, #a855f7)"
                    : "rgba(255,255,255,0.06)",
              }}
            >
              <img
                src={avatar}
                alt="avatar"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            </button>
          ))}
        </div>

        <label>Occupation</label>
        <input
          value={profileForm.occupation}
          onChange={(e) =>
            setProfileForm({ ...profileForm, occupation: e.target.value })
          }
          placeholder="Student, Developer, Designer..."
        />

        <label>Interests</label>
        <input
          value={profileForm.interests}
          onChange={(e) =>
            setProfileForm({ ...profileForm, interests: e.target.value })
          }
          placeholder="AI, Cloud, DevOps..."
        />

        <button onClick={updateProfile}>Save Profile</button>

        <hr style={{ margin: "32px 0", borderColor: "rgba(255,255,255,0.08)" }} />

        <h2>Change Password</h2>

        <input
          type="password"
          placeholder="Current password"
          value={passwordForm.current_password}
          onChange={(e) =>
            setPasswordForm({
              ...passwordForm,
              current_password: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="New password"
          value={passwordForm.new_password}
          onChange={(e) =>
            setPasswordForm({
              ...passwordForm,
              new_password: e.target.value,
            })
          }
        />

        <button onClick={changePassword}>Change Password</button>
      </div>
    )}

      <div className="card-grid" style={{ marginBottom: "32px" }}>
          <div className="card">
            <h2>📚 Courses In Progress</h2>

            <p style={{ fontSize: "32px", fontWeight: "800" }}>
              {progress.length}
            </p>

            <p style={{ color: "rgba(255,255,255,0.6)" }}>
              Active enrolled courses
            </p>
          </div>

          <div className="card">
            <h2>🧠 Completed Quizzes</h2>

            <p style={{ fontSize: "32px", fontWeight: "800" }}>
              {completedQuizzes}
            </p>

            <p style={{ color: "rgba(255,255,255,0.6)" }}>
              AI quizzes completed
            </p>
          </div>

          <div className="card">
            <h2>📊 Average Score</h2>

            <p style={{ fontSize: "32px", fontWeight: "800" }}>
              {averageScore}%
            </p>

            <p style={{ color: "rgba(255,255,255,0.6)" }}>
              Across all quiz attempts
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
              <h3>{item.course_title}</h3>
              <p>
                  <strong>Completed lessons:</strong> {item.completed_lessons} / {item.total_lessons}
                </p>
                <p>
                  <strong>Progress:</strong> {item.progress_percent}%
                </p>

              <Link to={`/courses/${item.course_id}`}>
                <button>Continue Course</button>
              </Link>

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