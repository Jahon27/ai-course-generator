import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/Courses";
import Dashboard from "./pages/Dashboard";
import AITools from "./pages/AITools";
import CourseDetails from "./pages/CourseDetails";
import LessonDetails from "./pages/LessonDetails";
import { useState } from "react";
import "./App.css";
import { Toaster } from "react-hot-toast";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
    const [menuOpen, setMenuOpen] = useState(false);
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <Link className="logo" to="/">AI Course Generator</Link>

          <div className="nav-links">
              <Link to="/">Courses</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/ai-tools">AI Tools</Link>

              {isLoggedIn ? (
                <button
                  className="nav-button"
                  onClick={() => {
                    localStorage.removeItem("token");
                    setIsLoggedIn(false);
                    window.location.href = "/";
                  }}
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login">Login</Link>

                  <Link className="nav-button" to="/register">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            <div className="mobile-nav">
              <button
                className="hamburger"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                ☰
              </button>

              {menuOpen && (
                <div className="mobile-menu">
                  <Link to="/">Courses</Link>
                  <Link to="/dashboard">Dashboard</Link>
                  <Link to="/ai-tools">AI Tools</Link>
                </div>
              )}
            </div>
        </nav>

        <main className="main">
          <Routes>
            <Route path="/" element={<Courses />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ai-tools" element={<AITools />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/courses/:id/lessons/:lessonId" element={<LessonDetails />} />
          </Routes>
        </main>
      </div>
      <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#2b3024",
              color: "#ecdfcc",
              border: "1px solid rgba(236,223,204,0.12)",
              borderRadius: "16px",
              padding: "16px 20px",
              fontWeight: "600",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            },
            success: {
              iconTheme: {
                primary: "#8a9a7b",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#dc2626",
                secondary: "#ffffff",
              },
            },
          }}
        />
    </BrowserRouter>
  );
}

export default App;