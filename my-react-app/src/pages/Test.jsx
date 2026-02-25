import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import SessionExpireDialog from "../SessionExpireCheck/SessionExpireDialog";
import DisableCopy from "../Disable/DisableCopy";
import DisableCapture from "../Disable/DisableCapture";

const API_URL = import.meta.env.VITE_API_URL || "https://api.freepare.com";
const OPTION_KEYS = ["A", "B", "C", "D"];

const processData = (text) => {
  if (!text || typeof text !== "string") {
    return "";
  }
  return text
    .replace(/\\n/g, "<br />")
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\$(.*?)\$/g, "<i>$1</i>")
    .replace(/~(.*?)~/g, "<u>$1</u>");
};

const TestPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const examId = queryParams.get("examId");
  const testName = queryParams.get("testName");

  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!examId) {
      return;
    }

    let isMounted = true;
    const fetchExam = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_URL}/api/exams/${examId}`);
        if (!response.ok) {
          throw new Error(`Unable to load exam (${response.status})`);
        }
        const data = await response.json();
        if (!isMounted) {
          return;
        }
        const normalized = {
          ...data,
          questions: Array.isArray(data.questions)
            ? data.questions.map((question) => ({
                ...question,
                questionText: processData(question.questionText),
                explanation: processData(question.explanation),
              }))
            : [],
        };
        setExamData(normalized);
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message || "Failed to load test.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchExam();
    return () => {
      isMounted = false;
    };
  }, [examId]);

  const stats = useMemo(() => {
    if (!examData?.questions?.length) {
      return { correct: 0, wrong: 0, unattempted: 0, total: 0 };
    }

    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    examData.questions.forEach((question) => {
      const selected = selectedAnswers[question.questionNo];
      if (!selected) {
        unattempted += 1;
      } else if (selected === question.correctAnswer) {
        correct += 1;
      } else {
        wrong += 1;
      }
    });

    return {
      correct,
      wrong,
      unattempted,
      total: examData.questions.length,
    };
  }, [examData, selectedAnswers]);

  const handleSelect = (questionNo, selectedOption) => {
    if (isSubmitted) {
      return;
    }
    setSelectedAnswers((prev) => {
      if (prev[questionNo] === selectedOption) {
        const { [questionNo]: ignored, ...rest } = prev;
        return rest;
      }
      return { ...prev, [questionNo]: selectedOption };
    });
  };

  const handleSubmit = () => {
    if (!examData?.questions?.length) {
      return;
    }

    const submittedTest = {
      answers: selectedAnswers,
      examId,
      testName,
      totalScore: `${stats.correct}/${stats.total}`,
    };

    if (window.opener) {
      window.opener.postMessage({ type: "TEST_COMPLETED", submittedTest }, window.location.origin);
    }

    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scorePercent = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <>
      <DisableCopy />
      <DisableCapture />
      <Navbar />

      <section className="min-h-screen bg-gradient-to-b from-sky-100 to-slate-100 px-4 py-6 sm:px-6">
        <div className="mx-auto w-full max-w-6xl">
          {!examId && (
            <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-medium text-amber-800">
              No exam ID provided. Please open test from hierarchy.
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-white p-8 text-slate-600 shadow-sm">
              <Loader2 size={18} className="animate-spin" />
              Loading test...
            </div>
          )}

          {!loading && error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {!loading && examData && (
            <>
              <header className="mb-5 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm sm:p-6">
                <h1 className="text-2xl font-bold text-[#066C98] sm:text-3xl">
                  {testName || examData.examName || "Freepare Test"}
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  Total Questions: {stats.total}
                </p>

                {isSubmitted && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-xs font-semibold uppercase text-emerald-700">Correct</p>
                      <p className="text-xl font-bold text-emerald-800">{stats.correct}</p>
                    </div>
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                      <p className="text-xs font-semibold uppercase text-red-700">Wrong</p>
                      <p className="text-xl font-bold text-red-800">{stats.wrong}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase text-slate-600">Unattempted</p>
                      <p className="text-xl font-bold text-slate-800">{stats.unattempted}</p>
                    </div>
                  </div>
                )}

                {isSubmitted && (
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-sm font-semibold text-slate-700">
                      <span>Score</span>
                      <span>
                        {stats.correct}/{stats.total}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[#066C98]"
                        style={{ width: `${scorePercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </header>

              <div className="space-y-4">
                {examData.questions?.length ? (
                  examData.questions.map((question, index) => {
                    const selected = selectedAnswers[question.questionNo];
                    const isCorrect = selected && selected === question.correctAnswer;
                    const isWrong = selected && selected !== question.correctAnswer;

                    return (
                      <article
                        key={`${question.questionNo}-${index}`}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                      >
                        <div className="mb-4">
                          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                            Q{question.questionNo || index + 1}
                          </h2>
                          {question.questionText && (
                            <div
                              className="mt-2 text-sm leading-6 text-slate-700"
                              dangerouslySetInnerHTML={{ __html: question.questionText }}
                            />
                          )}
                          {question.questionImage && (
                            <img
                              src={question.questionImage}
                              alt={`Question ${question.questionNo}`}
                              className="mt-3 w-full max-h-96 rounded-xl border border-slate-200 object-contain"
                            />
                          )}
                        </div>

                        <div className="space-y-2">
                          {OPTION_KEYS.map((option) => {
                            const isSelected = selected === option;
                            const showCorrect = isSubmitted && question.correctAnswer === option;
                            const showWrong = isSubmitted && isSelected && question.correctAnswer !== option;
                            const optionText = question[`option${option}`];
                            const optionImage = question[`option${option}Image`];

                            return (
                              <label
                                key={`${question.questionNo}-${option}`}
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                                  showCorrect
                                    ? "border-emerald-300 bg-emerald-50"
                                    : showWrong
                                      ? "border-red-300 bg-red-50"
                                      : isSelected
                                        ? "border-sky-300 bg-sky-50"
                                        : "border-slate-200 bg-white hover:border-slate-300"
                                } ${isSubmitted ? "cursor-not-allowed" : ""}`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${question.questionNo}`}
                                  value={option}
                                  checked={isSelected}
                                  onChange={() => handleSelect(question.questionNo, option)}
                                  disabled={isSubmitted}
                                  className="mt-1 h-4 w-4 accent-[#066C98]"
                                />
                                <div className="min-w-0 flex-1 text-sm text-slate-700">
                                  <p>
                                    <span className="mr-2 font-semibold text-slate-900">{option}.</span>
                                    {optionText}
                                  </p>
                                  {optionImage && (
                                    <img
                                      src={optionImage}
                                      alt={`Option ${option}`}
                                      className="mt-2 max-h-24 rounded border border-slate-200 object-contain"
                                    />
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>

                        {isSubmitted && (
                          <div className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-sm font-semibold text-slate-700">
                              Correct Answer:{" "}
                              <span className="text-emerald-700">{question.correctAnswer}</span>
                            </p>
                            {question.explanation && (
                              <div
                                className="text-sm leading-6 text-slate-600"
                                dangerouslySetInnerHTML={{ __html: question.explanation }}
                              />
                            )}
                            {question.explanationImage && (
                              <img
                                src={question.explanationImage}
                                alt={`Explanation ${question.questionNo}`}
                                className="w-full max-h-64 rounded border border-slate-200 object-contain"
                              />
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                    No questions available for this exam.
                  </div>
                )}
              </div>

              {!isSubmitted && examData.questions?.length > 0 && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="rounded-xl bg-[#066C98] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#045472]"
                  >
                    Submit Test
                  </button>
                </div>
              )}

              {isSubmitted && (
                <div className="mt-5 flex flex-wrap items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-sm">
                  <span className="inline-flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 size={16} />
                    Correct: {stats.correct}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-red-700">
                    <XCircle size={16} />
                    Wrong: {stats.wrong}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-slate-600">
                    <AlertTriangle size={16} />
                    Unattempted: {stats.unattempted}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <SessionExpireDialog />
    </>
  );
};

export default TestPage;
