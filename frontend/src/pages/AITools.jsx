import { useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AITools() {
  const [lectureText, setLectureText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const navigate = useNavigate();

  async function generateQuiz() {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

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
      toast.error("AI generation failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function generateQuizFromPdf() {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login first");

        setTimeout(() => {
            navigate("/login");
          }, 1500);

        return;
      }

      if (!pdfFile) {
        toast.error("Please choose a PDF file");
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
        toast.error("PDF generation failed");
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

        toast.success("Quiz result saved!");
      } catch (error) {
        toast.error("Failed to save quiz result");
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
          className="ai-textarea"
          placeholder="Paste lecture text here..."
          value={lectureText}
          onChange={(e) => setLectureText(e.target.value)}
        />

        <button onClick={generateQuiz} disabled={loading || !lectureText}>
          {loading ? "Generating..." : "Generate Quiz"}
        </button>

       <hr className="section-divider" />

        <div>
          <h2>Upload PDF Lecture</h2>
          <p className="muted-text">
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

                    let optionClass = "quiz-option";

                    if (answered && isCorrect) {
                      optionClass = "quiz-option correct";
                    }

                    if (answered && isSelected && !isCorrect) {
                      optionClass = "quiz-option wrong";
                    }

                    return (
                      <button
                      key={i}
                      onClick={() => selectAnswer(index, option)}
                      disabled={answered}
                      className={optionClass}
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