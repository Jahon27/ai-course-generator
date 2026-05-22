import { useState } from "react";
import api from "../api/api";

export default function AITools() {
  const [lectureText, setLectureText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generateQuiz() {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await api.post(
        "/ai/generate-quiz",
        { lecture_text: lectureText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(response.data);
    } catch (error) {
      alert("AI generation failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">AI Learning Tools</h1>
      <p className="page-subtitle">
        Paste a lecture and generate a summary with quiz questions.
      </p>

      <div className="card">
        <textarea
          placeholder="Paste lecture text here..."
          value={lectureText}
          onChange={(e) => setLectureText(e.target.value)}
          style={{
            width: "100%",
            minHeight: "220px",
            borderRadius: "18px",
            padding: "18px",
            background: "rgba(255,255,255,0.04)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: "16px",
          }}
        />

        <button onClick={generateQuiz} disabled={loading || !lectureText}>
          {loading ? "Generating..." : "Generate Quiz"}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: "32px" }}>
          <div className="card" style={{ marginBottom: "24px" }}>
            <h2>Summary</h2>
            <p>{result.summary}</p>
          </div>

          <div className="card-grid">
            {result.questions.map((q, index) => (
              <div key={index} className="card">
                <h3>
                  Question {index + 1}
                </h3>

                <p>{q.question}</p>

                <ul>
                  {q.options.map((option, i) => (
                    <li key={i}>{option}</li>
                  ))}
                </ul>

                <p>
                  <strong>Answer:</strong> {q.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}