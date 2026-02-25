import { useState, useEffect, useRef, useCallback } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, Phone, UserRound } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import PasswordStrengthBar from "react-password-strength-bar";
import img from "../../Assets/Freepare_LogIn.png";
import ForgotPasswordDialog from "./ForgetPasswordDialog";
import Toast from "../../components/ui/Toast";

const API_URL = import.meta.env.VITE_API_URL || "https://api.freepare.com";
const BASE_URL = `${API_URL}`;

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-11 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#066C98] focus:ring-2 focus:ring-sky-100";

const AuthForm = ({ type }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotPasswordDialogOpen, setForgotPasswordDialogOpen] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const firstInputRef = useRef(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (type === "signup" && password && confirmPassword) {
      setPasswordError(password === confirmPassword ? "" : "Passwords do not match");
    }
  }, [password, confirmPassword, type]);

  const validateEmail = useCallback((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).toLowerCase()), []);
  const validatePhone = useCallback((value) => /^[0-9]{10}$/.test(value), []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError("");
      setEmailError("");
      setPhoneError("");
      setPasswordError("");

      if (!validateEmail(email)) {
        setEmailError("Invalid email format");
        return;
      }
      if (type === "signup" && !validatePhone(phone)) {
        setPhoneError("Phone must be exactly 10 digits");
        return;
      }
      if (type === "signup" && password !== confirmPassword) {
        setPasswordError("Passwords do not match");
        return;
      }

      setIsLoading(true);
      let success = false;

      try {
        const payload = {
          email,
          password,
          ...(type === "signup" && { firstName, lastName, phone }),
        };
        const response = await fetch(`${BASE_URL}/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Something went wrong");
        }

        const data = await response.json();
        if (!data.success) throw new Error(data.message || "Authentication failed");

        localStorage.setItem("jwtToken", data.token);
        success = true;
        setSnackbarMessage(type === "signup" ? "Account created successfully" : "Logged in successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        if (window.opener) {
          window.opener.postMessage("AUTH_SUCCESS", window.location.origin);
        }
        window.close();
      } catch (err) {
        const msg = err.message || "An error occurred. Please try again.";
        setError(msg);
        setSnackbarMessage(msg);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setIsLoading(false);
        if (success && type === "signup") {
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setFirstName("");
          setLastName("");
          setPhone("");
        }
      }
    },
    [email, password, confirmPassword, firstName, lastName, phone, type, validateEmail, validatePhone]
  );

  const inputWithIcon = (Icon, field, props = {}) => (
    <div className="relative">
      <Icon size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      {field}
      {props.end}
    </div>
  );

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white to-sky-100">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:28px_28px]" />

        <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-6 px-4 py-6 lg:grid-cols-2">
          <div className="hidden h-[72vh] overflow-hidden rounded-3xl border border-white/60 bg-white/40 shadow-2xl lg:block">
            <img src={img} alt="Freepare login visual" className="h-full w-full object-cover" />
          </div>

          <div className="mx-auto w-full max-w-xl rounded-3xl border border-white/70 bg-white/95 p-5 shadow-2xl sm:p-8">
            <h1 className="text-center text-3xl font-bold text-[#066C98]">
              {type === "signup" ? "Create an Account" : "Welcome Back"}
            </h1>
            <p className="mt-2 text-center text-sm text-slate-500">
              {type === "signup"
                ? "Join Freepare and start practicing smarter."
                : "Login and continue your exam preparation journey."}
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                {error}
              </div>
            )}

            <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
              {type === "signup" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {inputWithIcon(
                    UserRound,
                    <input
                      ref={firstInputRef}
                      className={inputClass}
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  )}
                  {inputWithIcon(
                    UserRound,
                    <input
                      className={inputClass}
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  )}
                </div>
              )}

              {type === "signup" &&
                inputWithIcon(
                  Phone,
                  <input
                    className={inputClass}
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setPhoneError("");
                    }}
                    required
                  />
                )}
              {phoneError && <p className="text-xs font-medium text-rose-600">{phoneError}</p>}

              {inputWithIcon(
                Mail,
                <input
                  ref={type === "login" ? firstInputRef : undefined}
                  className={inputClass}
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(validateEmail(e.target.value) ? "" : "Invalid email format");
                  }}
                  required
                  type="email"
                />
              )}
              {emailError && <p className="text-xs font-medium text-rose-600">{emailError}</p>}

              {inputWithIcon(
                Lock,
                <input
                  className={`${inputClass} pr-10`}
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />,
                {
                  end: (
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  ),
                }
              )}

              {type === "signup" && (
                <>
                  <PasswordStrengthBar password={password} onChangeScore={(score) => setPasswordStrength(score)} />
                  <p className="text-xs text-slate-500">Password strength score: {passwordStrength}/4</p>

                  {inputWithIcon(
                    Lock,
                    <input
                      className={`${inputClass} pr-10`}
                      placeholder="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />,
                    {
                      end: (
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
                          aria-label="Toggle confirm password visibility"
                        >
                          {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      ),
                    }
                  )}
                  {passwordError && <p className="text-xs font-medium text-rose-600">{passwordError}</p>}
                </>
              )}

              <button
                type="submit"
                className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#066C98] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#045472] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isLoading}
              >
                {isLoading && <Loader2 size={17} className="animate-spin" />}
                {type === "signup" ? "Sign Up" : "Log In"}
              </button>
            </form>

            {type === "login" && (
              <div className="mt-4 space-y-2 text-center text-sm">
                <p className="text-slate-600">
                  Don&apos;t have an account?{" "}
                  <RouterLink className="font-semibold text-[#066C98] hover:underline" to="/signup">
                    Sign up now
                  </RouterLink>
                </p>
                <button
                  type="button"
                  onClick={() => setForgotPasswordDialogOpen(true)}
                  className="font-semibold text-[#066C98] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {type === "signup" && (
              <p className="mt-4 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <RouterLink className="font-semibold text-[#066C98] hover:underline" to="/login">
                  Click here to login
                </RouterLink>
              </p>
            )}
          </div>
        </div>
      </div>

      <ForgotPasswordDialog open={forgotPasswordDialogOpen} onClose={() => setForgotPasswordDialogOpen(false)} />
      <Toast
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />
    </>
  );
};

export default AuthForm;

