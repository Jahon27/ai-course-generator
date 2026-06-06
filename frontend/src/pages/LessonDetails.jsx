import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import api from "../api/api";
import toast from "react-hot-toast";

export default function LessonDetails() {
  const { id, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setQuiz(null);
    setSelectedAnswers({});
    fetchLesson();
    fetchLessons();
  }, [lessonId]);


  async function fetchLesson() {
      const response = await api.get(`/lessons/${lessonId}`);
      setLesson(response.data);
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

  async function generateQuiz() {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      return;
    }

    setLoading(true);
    setQuiz(null);
    setSelectedAnswers({});

    try {
      const response = await api.post(
        "/ai/generate-quiz",
        { lecture_text: lesson.content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQuiz(response.data);
  } catch (error) {
      toast.error("Quiz generation failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(index, option) {
    setSelectedAnswers({
      ...selectedAnswers,
      [index]: option,
    });
  }

  function getScore() {
    if (!quiz) return 0;

    return quiz.questions.filter(
      (q, index) => selectedAnswers[index] === q.answer
    ).length;
  }

  const score = getScore();
  const quizCompleted =
    quiz && Object.keys(selectedAnswers).length === quiz.questions.length;

  async function completeLesson() {
      const token = localStorage.getItem("token");

      await api.post(
        `/lessons/${lessonId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchLessons();
    }

  if (!lesson) {
    return <div className="card">Loading lesson...</div>;
  }

  const currentLessonIndex = lessons.findIndex(
      (item) => item.id === Number(lessonId)
    );

    const nextLesson = lessons[currentLessonIndex + 1];

  return (
    <div>
      <Link to={`/courses/${id}`}>
        <button style={{ marginBottom: "24px" }}>← Back to Course</button>
      </Link>

      <div className="card" style={{ marginBottom: "32px" }}>
        <span className="badge">Lesson {lesson.order_number}</span>
        <h1>{lesson.title}</h1>

       <div className="lesson-content">
          <ReactMarkdown>{lesson.content}</ReactMarkdown>
        </div>

        <button onClick={generateQuiz} disabled={loading}>
          {loading ? "Generating..." : "Test Your Knowledge"}
        </button>
      </div>

      {quiz && (
        <div>
          <div className="card" style={{ marginBottom: "24px" }}>
            <h2>Quiz Score</h2>
            <p>
              {score} / {quiz.questions.length} correct
            </p>

            {quizCompleted && score >= 4 && (
              <div>
                <h3>🎉 Congratulations!</h3>
                <p>You passed this lesson quiz.</p>

                {nextLesson ? (
                  <button
                    onClick={async () => {
                      await completeLesson();
                      navigate(`/courses/${id}/lessons/${nextLesson.id}`);
                    }}
                  >
                    Unlock & Go to Next Lesson
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      await completeLesson();
                      navigate(`/courses/${id}`);
                    }}
                  >
                    Finish Course
                  </button>
                )}
              </div>
            )}

            {quizCompleted && score < 4 && (
              <div>
                <h3>Try again</h3>
                <p>You need at least 4/5 to pass.</p>
                <button onClick={generateQuiz}>Retake Quiz</button>
              </div>
            )}
          </div>

          <div className="card-grid">
            {quiz.questions.map((q, index) => (
              <div key={index} className="card">
                <h3>Question {index + 1}</h3>
                <p>{q.question}</p>

                <div style={{ display: "grid", gap: "10px" }}>
                  {q.options.map((option, i) => {
                    const selected = selectedAnswers[index];
                    const answered = selected !== undefined;
                    const isCorrect = option === q.answer;
                    const isSelected = selected === option;

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
                        disabled={answered}
                        onClick={() => selectAnswer(index, option)}
                        style={{
                          textAlign: "left",
                          background,
                          border,
                          color: "white",
                        }}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}