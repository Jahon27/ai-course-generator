import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero-section">
          <h1 className="hero-title">
            Welcome to AIDA
          </h1>

          <p className="hero-subtitle">
            AI-driven Instructional Design Assistant
          </p>

          <p className="hero-description">
            AIDA helps learners explore certified courses, understand complex topics
            through clear lessons, and strengthen knowledge with AI-generated quizzes
            after each module.
          </p>

          <Link to="/courses">
            <button className="hero-button">
              Get Started
            </button>
          </Link>
        </section>

      <section className="card-grid">
        <div className="card">
          <h2>🎓 Certified Learning</h2>

          <p>
            Complete high-quality courses with clear lesson structures,
            practical examples, and progress tracking. Earn certificates upon
            successful course completion.
          </p>
        </div>

        <div className="card">
          <h2>🧠 Interactive Quizzes</h2>

          <p>
            Test your knowledge after each lesson using AI-generated quizzes
            designed to reinforce key concepts and improve retention.
          </p>
        </div>

        <div className="card">
          <h2>📈 Track Progress</h2>

          <p>
            Monitor your learning journey with dashboards, completion tracking,
            lesson progress indicators, and course certificates.
          </p>
        </div>
      </section>

      <section style={{ marginTop: "80px" }}>
        <h1 className="page-title">
          AI Learning Tools
        </h1>

        <p className="page-subtitle">
          Enhance your studies with intelligent tools powered by artificial
          intelligence.
        </p>

        <div className="card-grid">
          <div className="card">
            <h2>📄 Quiz Generator</h2>

            <p>
              Upload your study material and automatically generate quizzes
              tailored to the content.
            </p>
          </div>

          <div className="card">
            <h2>🤖 AI Assistance</h2>

            <p>
              Generate learning questions, summaries, and practice exercises
              instantly using AI.
            </p>
          </div>

          <div className="card">
            <h2>⚡ Faster Learning</h2>

            <p>
              Spend less time preparing study materials and more time actually
              learning.
            </p>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "48px" }}>
          <Link to="/ai-tools">
            <button style={{ fontSize: "18px", padding: "16px 32px" }}>
              Start Learning Today
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}