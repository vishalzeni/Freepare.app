import { CircleCheckBig, CircleHelp, CircleX, Trophy } from "lucide-react";
import Modal from "./ui/Modal";

const generatePieSlice = (radius, startAngle, endAngle) => {
  const startX = radius + radius * Math.cos((startAngle * Math.PI) / 180);
  const startY = radius + radius * Math.sin((startAngle * Math.PI) / 180);
  const endX = radius + radius * Math.cos((endAngle * Math.PI) / 180);
  const endY = radius + radius * Math.sin((endAngle * Math.PI) / 180);

  return `M ${radius} ${radius} L ${startX} ${startY} A ${radius} ${radius} 0 ${
    endAngle - startAngle > 180 ? 1 : 0
  } 1 ${endX} ${endY} Z`;
};

const statCard =
  "flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold";

const ResultsDialog = ({
  open,
  onClose,
  totalQuestions,
  correctAnswers,
  wrongAnswers,
  unattemptedAnswers,
  testName,
}) => {
  const correctPercentage = (correctAnswers / totalQuestions) * 100 || 0;
  const wrongPercentage = (wrongAnswers / totalQuestions) * 100 || 0;
  const unattemptedPercentage = (unattemptedAnswers / totalQuestions) * 100 || 0;

  const correctAngle = (correctPercentage / 100) * 360;
  const wrongAngle = (wrongPercentage / 100) * 360;

  const correctSlice = generatePieSlice(100, 0, correctAngle);
  const wrongSlice = generatePieSlice(100, correctAngle, correctAngle + wrongAngle);
  const unattemptedSlice = generatePieSlice(100, correctAngle + wrongAngle, 360);

  const handleClose = () => {
    onClose();
    if (window.opener) {
      window.opener.postMessage("TEST_COMPLETED", window.location.origin);
      window.close();
    } else {
      window.history.back();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Test Result"
      subtitle={`${testName || "Freepare Test"} · Total Questions: ${totalQuestions}`}
      size="lg"
      footer={
        <button
          type="button"
          onClick={handleClose}
          className="w-full rounded-lg bg-[#066C98] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#045472]"
        >
          Close
        </button>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className={`${statCard} text-emerald-700`}>
            <CircleCheckBig size={18} />
            Correct: {correctAnswers} ({correctPercentage.toFixed(1)}%)
          </div>
          <div className={`${statCard} text-rose-700`}>
            <CircleX size={18} />
            Wrong: {wrongAnswers} ({wrongPercentage.toFixed(1)}%)
          </div>
          <div className={`${statCard} text-amber-700`}>
            <CircleHelp size={18} />
            Unattempted: {unattemptedAnswers} ({unattemptedPercentage.toFixed(1)}%)
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-3">
            <svg width="220" height="220" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="white" stroke="lightgray" strokeWidth="1" />
              <path d={correctSlice} fill="#22c55e" />
              <path d={wrongSlice} fill="#ef4444" />
              <path d={unattemptedSlice} fill="#f59e0b" />
              <circle cx="100" cy="100" r="50" fill="white" stroke="lightgray" strokeWidth="1" />
              <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(0, 0, 0, 0.1)" strokeWidth="10" />
            </svg>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-[#066C98]">
              <Trophy size={20} />
            </div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Total Score</p>
            <p
              className={`mt-2 text-4xl font-extrabold ${
                correctAnswers / totalQuestions >= 0.8 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {correctAnswers}/{totalQuestions}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              ({((correctAnswers / totalQuestions) * 100).toFixed(1)}%)
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ResultsDialog;

