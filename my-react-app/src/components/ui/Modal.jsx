import { useEffect } from "react";
import { X } from "lucide-react";

const widthMap = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
};

const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  children,
  footer,
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const onEsc = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1400] flex items-center justify-center bg-slate-900/55 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        className={`w-full ${widthMap[size] || widthMap.md} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`}
      >
        {(title || subtitle) && (
          <div className="border-b border-slate-200 px-5 py-4">
            {title && (
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
        )}
        <div className="max-h-[78vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

