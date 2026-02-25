import { AlertTriangle, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../Assets/Freepare_Logo.png";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-sky-100 px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-sky-100 bg-white p-6 text-center shadow-xl sm:p-10">
        <img
          src={Logo}
          alt="FREEPARE"
          className="mx-auto mb-5 w-full max-w-xs object-contain"
        />

        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle size={42} />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Oops! Something went wrong.
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
          The page you are looking for does not exist, or an unexpected error occurred.
        </p>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mx-auto mt-6 inline-flex items-center gap-2 rounded-xl bg-[#066C98] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#045472]"
        >
          <Home size={16} />
          Go Back Home
        </button>
      </div>
    </section>
  );
};

export default ErrorPage;
