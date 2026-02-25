import { useEffect, useMemo, useState } from "react";
import {
  ChartColumnBig,
  Database,
  FileCode2,
  FolderTree,
  KeyRound,
  ShieldAlert,
  Upload,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://api.freepare.com";

const adminTools = [
  {
    title: "Uploaded Tests",
    icon: ChartColumnBig,
    path: "/admin/uploaded-tests",
  },
  {
    title: "Panel",
    icon: FolderTree,
    path: "/admin/panel",
  },
  {
    title: "Upload",
    icon: Upload,
    path: "/admin/upload",
  },
  {
    title: "Users Data",
    icon: Database,
    path: "/admin/users",
  },
  {
    title: "Admin Code",
    icon: KeyRound,
    path: "/admin/code",
  },
  {
    title: "System",
    icon: FileCode2,
    description: "Module under migration to Tailwind UI",
    disabled: true,
  },
];

const Admin = () => {
  const navigate = useNavigate();

  const [serverAdminCode, setServerAdminCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const fetchAdminCode = async () => {
      try {
        setLoading(true);
        setError("");
        
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const res = await fetch(`${API_URL}/api/adminCode`, {
          signal: controller.signal,
          credentials: "include", // if using cookies/sessions
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            throw new Error("Unauthorized – please check your session");
          }
          throw new Error(`Server responded with ${res.status}`);
        }

        const data = await res.json();

        if (isMounted) {
          if (data?.adminCode) {
            setServerAdminCode(data.adminCode);
          } else {
            setError("Admin code not received from server");
          }
        }
      } catch (err) {
        if (isMounted) {
          if (err.name === "AbortError") {
            setError("Request timed out – server may be slow or down");
          } else if (err.message.includes("Network")) {
            setError("Cannot reach server. Check your internet connection.");
          } else {
            setError(err.message || "Failed to load admin configuration");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAdminCode();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!serverAdminCode) {
      setError("Admin code not available. Cannot verify.");
      return;
    }

    if (codeInput.trim() === serverAdminCode) {
      setIsAuthorized(true);
      setSuccessMsg("Access granted");
      setCodeInput("");
    } else {
      setError("Invalid admin code");
    }
  };

  const messageClass = useMemo(() => {
    if (error) return "border-red-300 bg-red-50 text-red-800";
    if (successMsg) return "border-emerald-300 bg-emerald-50 text-emerald-800";
    return "border-blue-200 bg-blue-50 text-blue-800";
  }, [error, successMsg]);

  const handleToolClick = (tool) => {
    if (tool.disabled) return;
    if (tool.path) {
      navigate(tool.path);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm border border-sky-100">
            <h1 className="text-3xl font-bold text-slate-800">Admin Console</h1>
            <p className="mt-2 text-slate-600">
              Secure access • Tools • Monitoring
            </p>
          </div>

          {/* Loading / Error / Form / Dashboard */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-[#066C98]" />
              <p className="mt-4 text-slate-600">Verifying admin access...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Messages */}
              {(error || successMsg) && (
                <div className={`rounded-xl border p-4 ${messageClass} flex items-start gap-3`}>
                  {error ? <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" /> : null}
                  <p className="text-sm font-medium">{error || successMsg}</p>
                </div>
              )}

              {!isAuthorized ? (
                /* Login Form */
                <div className="rounded-2xl border bg-white p-6 shadow-sm max-w-md mx-auto">
                  <h2 className="mb-5 text-xl font-semibold text-slate-800">Admin Verification</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Admin Code
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="password"
                          value={codeInput}
                          onChange={(e) => setCodeInput(e.target.value)}
                          placeholder="••••••••"
                          autoFocus
                          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#066C98] focus:ring-1 focus:ring-[#066C98] outline-none transition"
                        />
                        <button
                          type="submit"
                          className="rounded-lg bg-[#066C98] px-6 py-2.5 font-medium text-white hover:bg-[#055a80] transition disabled:opacity-60"
                          disabled={!codeInput.trim()}
                        >
                          Unlock
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                /* Authorized Dashboard */
                <>
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 text-amber-800">
                    <div className="flex gap-3">
                      <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" />
                      <p className="text-sm">
                        Admin panel is under active migration to Tailwind. Some modules may be incomplete.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {adminTools.map((tool) => {
                      const Icon = tool.icon;
                      const isDisabled = !!tool.disabled;

                      return (
                        <div
                          key={tool.title}
                          onClick={() => handleToolClick(tool)}
                          className={`
                            group relative rounded-2xl border bg-white p-6 shadow-sm transition-all
                            ${isDisabled 
                              ? "opacity-60 cursor-not-allowed" 
                              : "hover:shadow-md hover:border-[#066C98]/40 cursor-pointer"}
                          `}
                        >
                          <div className="mb-4 inline-flex rounded-xl bg-sky-50/80 p-3 text-[#066C98] transition group-hover:bg-sky-100">
                            <Icon size={22} />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-800">{tool.title}</h3>
                          <p className="mt-2 text-sm text-slate-600 leading-6">
                            {tool.description || "Manage related settings and data"}
                          </p>
                          {isDisabled && (
                            <div className="absolute top-3 right-3 text-xs font-medium text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                              Migrating
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Admin;