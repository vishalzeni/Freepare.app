import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";

const API_URL = import.meta.env.VITE_API_URL || "https://api.freepare.com";
const BASE_URL = `${API_URL}`;

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#066C98] focus:ring-2 focus:ring-sky-100";

const ForgotPasswordDialog = ({ open, onClose }) => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setNewPassword("");
    setConfirmNewPassword("");
    setError("");
    setSnackbarOpen(false);
  }, [open]);

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).toLowerCase());

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email) return setError("Please enter your email address.");
    if (!validateEmail(email)) return setError("Invalid email format.");
    if (!newPassword || !confirmNewPassword)
      return setError("Please enter and confirm your new password.");
    if (newPassword !== confirmNewPassword) return setError("Passwords do not match.");

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reset password.");
      }

      const data = await response.json();
      setSnackbarMessage(data.message || "Password reset successfully.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      onClose();
    } catch (err) {
      const msg = err.message || "An error occurred. Please try again.";
      setError(msg);
      setSnackbarMessage(msg);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Reset Password"
        subtitle="Enter your registered email and set a new password."
        footer={
          <>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="reset-password-form"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#066C98] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#045472] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        }
      >
        <form id="reset-password-form" onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email Address</label>
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">New Password</label>
            <input
              className={inputClass}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
            <input
              className={inputClass}
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
        </form>
      </Modal>

      <Toast
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />
    </>
  );
};

export default ForgotPasswordDialog;

