import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Save,
  X,
  Lock,
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || "https://api.freepare.com";

function AdminCode() {
  const [adminCode, setAdminCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "info",
  });

  // =============================
  // Fetch Admin Code
  // =============================
  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/adminCode")
      .then((res) => {
        if (res.data.adminCode) {
          setAdminCode(res.data.adminCode);
        }
      })
      .catch(() => {
        showSnackbar("Failed to fetch admin code", "error");
      })
      .finally(() => setLoading(false));
  }, []);

  const showSnackbar = (message, type = "info") => {
    setSnackbar({ open: true, message, type });
  };

  const toggleVisibility = () => setShowCode((prev) => !prev);

  // =============================
  // Create
  // =============================
  const handleCreate = async () => {
    if (newCode.trim().length < 4) return;

    setLoading(true);
    try {
      await axios.post("/api/adminCode", {
        adminCode: newCode.trim(),
      });
      setAdminCode(newCode.trim());
      setNewCode("");
      showSnackbar("Admin code created successfully!", "success");
    } catch {
      showSnackbar("Failed to create admin code.", "error");
    }
    setLoading(false);
  };

  // =============================
  // Edit
  // =============================
  const handleEdit = () => {
    setNewCode(adminCode);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (newCode.trim().length < 4) return;

    setLoading(true);
    try {
      await axios.put("/api/adminCode", {
        adminCode: newCode.trim(),
      });
      setAdminCode(newCode.trim());
      setIsEditing(false);
      showSnackbar("Admin code updated successfully!", "success");
    } catch {
      showSnackbar("Failed to update admin code.", "error");
    }
    setLoading(false);
  };

  // =============================
  // Delete
  // =============================
  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete("/api/adminCode");
      setAdminCode("");
      setDeleteConfirmOpen(false);
      showSnackbar("Admin code deleted successfully!", "success");
    } catch {
      showSnackbar("Failed to delete admin code.", "error");
    }
    setLoading(false);
  };

  // =============================
  // Snackbar Component
  // =============================
  const Snackbar = () => {
    if (!snackbar.open) return null;

    const icon =
      snackbar.type === "success" ? (
        <CheckCircle size={18} />
      ) : snackbar.type === "error" ? (
        <AlertCircle size={18} />
      ) : (
        <Info size={18} />
      );

    return (
      <div className="fixed bottom-6 right-6 bg-slate-800 border border-slate-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
        {icon}
        <span>{snackbar.message}</span>
        <X
          size={16}
          className="cursor-pointer"
          onClick={() => setSnackbar({ ...snackbar, open: false })}
        />
      </div>
    );
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] p-6 bg-slate-950 text-white">
      <div className="w-full max-w-lg bg-slate-900 rounded-2xl p-8 shadow-xl border border-slate-800 relative">

        {/* Header */}
        <div className="text-center mb-6">
          <Lock className="mx-auto mb-2 text-cyan-400" size={36} />
          <h2 className="text-2xl font-semibold">Admin Security Code</h2>
          <p className="text-sm text-gray-400 mt-2">
            {adminCode
              ? "Manage your secure admin access code"
              : "Create a new admin access code"}
          </p>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-cyan-400" />
          </div>
        ) : adminCode ? (
          isEditing ? (
            <div className="space-y-4">
              <div className="relative">
                <Shield className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                  placeholder="New Admin Code"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={newCode.trim().length < 4}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 py-2 rounded-lg"
                >
                  <Save size={16} />
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 py-2 rounded-lg"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Shield className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  type={showCode ? "text" : "password"}
                  value={adminCode}
                  readOnly
                  className="w-full pl-9 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                />
                <button
                  onClick={toggleVisibility}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                >
                  {showCode ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                onClick={handleEdit}
                className="text-cyan-400 hover:text-cyan-300"
              >
                <Edit size={18} />
              </button>

              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="text-red-500 hover:text-red-400"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Shield className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                placeholder="Enter Admin Code"
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={newCode.trim().length < 4}
              className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 py-2 rounded-lg"
            >
              <Save size={16} />
              Create Code
            </button>
          </div>
        )}

        {/* Delete Modal */}
        {deleteConfirmOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
            <div className="bg-slate-900 p-6 rounded-xl w-96 border border-slate-800">
              <h3 className="text-lg mb-4">Confirm Deletion</h3>
              <p className="text-sm text-gray-400 mb-6">
                Are you sure you want to delete the admin code? This cannot be undone.
              </p>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-4 py-2 bg-slate-700 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <Snackbar />
      </div>
    </div>
  );
}

export default AdminCode;