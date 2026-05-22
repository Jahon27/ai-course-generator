import { useState } from "react";
import api from "../api/api";

export default function AITools() {
  const [lectureText, setLectureText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});

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
      setSelectedAnswers({});
    } catch (error) {
      alert("AI generation failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function generateQuizFromPdf() {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        return;
      }

      if (!pdfFile) {
        alert("Please choose a PDF file");
        return;
      }

      const formData = new FormData();
      formData.append("file", pdfFile);

      setLoading(true);
      setResult(null);

      try {
        const response = await api.post(
          "/ai/generate-quiz-from-pdf",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setResult(response.data);
      } catch (error) {
        alert("PDF generation failed");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    function selectAnswer(questionIndex, option) {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionIndex]: option,
      });
    }

    function getScore() {
      if (!result) return 0;

      return result.questions.filter(
        (q, index) => selectedAnswers[index] === q.answer
      ).length;
    }

    async function saveQuizResult() {
      const token = localStorage.getItem("token");

      if (!result) return;

      try {
        await api.post(
          "/quizzes/save",
          {
            summary: result.summary,
            questions: result.questions,
            score: getScore(),
            total_questions: result.questions.length,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("Quiz result saved!");
      } catch (error) {
        alert("Failed to save quiz result");
        console.error(error);
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

        <hr style={{ margin: "32px 0", borderColor: "rgba(255,255,255,0.08)" }} />

        <div>
          <h2>Upload PDF Lecture</h2>
          <p style={{ color: "rgba(255,255,255,0.65)" }}>
            Upload a PDF lecture and generate a summary with quiz questions.
          </p>

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files[0])}
          />

          <button onClick={generateQuizFromPdf} disabled={loading || !pdfFile}>
            {loading ? "Generating..." : "Generate From PDF"}
          </button>
        </div>
      </div>

      {result && (
        <div style={{ marginTop: "32px" }}>
          <div className="card" style={{ marginBottom: "24px" }}>
            <h2>Summary</h2>
            <p>{result.summary}</p>
          </div>
            <div className="card" style={{ marginBottom: "24px" }}>
              <h2>Quiz Score</h2>
              <p>
                {getScore()} / {result.questions.length} correct
              </p>
              <button onClick={saveQuizResult}>
                  Save Quiz Result
                </button>
            </div>
          <div className="card-grid">
            {result.questions.map((q, index) => (
              <div key={index} className="card">
                <h3>
                  Question {index + 1}
                </h3>

                <p>{q.question}</p>

                <div style={{ display: "grid", gap: "10px", marginTop: "16px" }}>
                  {q.options.map((option, i) => {
                    const selected = selectedAnswers[index];
                    const isSelected = selected === option;
                    const isCorrect = option === q.answer;
                    const answered = selected !== undefined;

                    let background = "rgba(255,255,255,0.04)";
                    let border = "1px solid rgba(255,255,255,0.08)";

                    if (answered && isCorrect) {
                      background = "rgba(34,197,94,0.18)";
                      border = "1px solid rgba(34,197,94,0.55)";
                    }

                    if (answered && isSelected && !isCorrect) {
                      background = "rgba(239,68,68,0.18)";
                      border = "1px solid rgba(239,68,68,0.55)";
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => selectAnswer(index, option)}
                        disabled={answered}
                        style={{
                          textAlign: "left",
                          background,
                          border,
                          color: "white",
                          width: "100%",
                        }}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {selectedAnswers[index] && (
                  <p style={{ marginTop: "14px" }}>
                    {selectedAnswers[index] === q.answer
                      ? "✅ Correct!"
                      : `❌ Wrong. Correct answer: ${q.answer}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}