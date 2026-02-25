import { CheckCircle2, CircleAlert, CircleX, Info } from "lucide-react";

const toneMap = {
  success: {
    wrap: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Icon: CheckCircle2,
  },
  error: {
    wrap: "border-rose-200 bg-rose-50 text-rose-700",
    Icon: CircleX,
  },
  warning: {
    wrap: "border-amber-200 bg-amber-50 text-amber-700",
    Icon: CircleAlert,
  },
  info: {
    wrap: "border-sky-200 bg-sky-50 text-sky-700",
    Icon: Info,
  },
};

const Toast = ({ open, message, severity = "info", onClose }) => {
  if (!open || !message) return null;
  const tone = toneMap[severity] || toneMap.info;
  const Icon = tone.Icon;

  return (
    <div className="fixed right-4 top-4 z-[1500]">
      <div
        className={`flex max-w-sm items-start gap-2 rounded-xl border px-4 py-3 shadow-lg ${tone.wrap}`}
        role="alert"
      >
        <Icon size={18} className="mt-0.5 shrink-0" />
        <p className="text-sm font-medium">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="ml-1 rounded p-0.5 opacity-70 transition hover:bg-white/50 hover:opacity-100"
          aria-label="Close notification"
        >
          <CircleX size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;

