import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { debounce } from "../utils/debounce"; // keep your debounce util

const API_URL = import.meta.env.VITE_API_URL || "https://api.freepare.com";
const BASE_URL = `${API_URL}/api`;

const EXAMS_PER_PAGE = 12;

export default function UploadedTests() {
  const [exams, setExams] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState("A-Z"); // "A-Z" | "Z-A"
  const [loading, setLoading] = useState(true);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mutation states
  const [mutationLoadingId, setMutationLoadingId] = useState(null); // exam _id or null

  // Dialogs
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameExam, setRenameExam] = useState(null);
  const [newName, setNewName] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteExam, setDeleteExam] = useState(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewExam, setPreviewExam] = useState(null);

  // Toast
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 4500);
  };

  const fetchExams = useCallback(async () => {
    setPaginationLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${BASE_URL}/exams`, {
        params: {
          page,
          limit: EXAMS_PER_PAGE,
          searchQuery: debouncedSearch,
          sortOrder: sort,
        },
      });

      setExams(res.data.exams || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      setError("Failed to load exams. Please try again.");
      setExams([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  }, [page, debouncedSearch, sort]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // Debounce search
  const debouncedSearchFn = useMemo(
    () =>
      debounce((value) => {
        setDebouncedSearch(value.trim().toLowerCase());
        setPage(1);
      }, 450),
    []
  );

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    debouncedSearchFn(val);
  };

  const clearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
  };

  const renameExamFn = async () => {
    if (!newName.trim()) {
      showToast("Name cannot be empty", "error");
      return;
    }

    setMutationLoadingId(renameExam._id);

    try {
      await axios.put(`${BASE_URL}/exams/${renameExam._id}`, {
        examName: newName.trim(),
      });

      setExams((prev) =>
        prev.map((ex) =>
          ex._id === renameExam._id ? { ...ex, examName: newName.trim() } : ex
        )
      );

      showToast("Exam renamed successfully");
      setRenameOpen(false);
      setRenameExam(null);
      setNewName("");
    } catch (err) {
      console.error(err);
      showToast("Failed to rename exam", "error");
    } finally {
      setMutationLoadingId(null);
    }
  };

  const deleteExamFn = async () => {
    setMutationLoadingId(deleteExam._id);

    try {
      await axios.delete(`${BASE_URL}/exams/${deleteExam._id}`);

      setExams((prev) => prev.filter((ex) => ex._id !== deleteExam._id));
      setTotal((t) => Math.max(0, t - 1));

      showToast("Exam deleted successfully");
      setDeleteOpen(false);
      setDeleteExam(null);
    } catch (err) {
      console.error(err);
      showToast("Failed to delete exam", "error");
    } finally {
      setMutationLoadingId(null);
    }
  };

  const totalPages = Math.ceil(total / EXAMS_PER_PAGE) || 1;

  if (loading && !exams.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-[#066C98]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header + Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#066C98] to-[#2CACE3] bg-clip-text text-transparent">
              Uploaded Tests
            </h1>
            <p className="mt-1 text-gray-600">
              Total: <strong>{total}</strong> exams
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Sort */}
            <div className="min-w-[160px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort by
              </label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#066C98] focus:ring-1 focus:ring-[#066C98] outline-none"
              >
                <option value="A-Z">A-Z</option>
                <option value="Z-A">Z-A</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-[280px]">
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by name or exam ID..."
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:border-[#066C98] focus:ring-1 focus:ring-[#066C98] outline-none transition"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              {search && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <div className="flex-1">{error}</div>
            <button
              onClick={() => {
                setError(null);
                fetchExams();
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Grid */}
        {exams.length === 0 && !error ? (
          <div className="text-center py-16 text-gray-500">
            No exams found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {exams.map((exam) => {
              const isMutating = mutationLoadingId === exam._id;

              return (
                <div
                  key={exam._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 truncate">
                          {exam.examName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          ID: <span className="font-mono">{exam.examId}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setPreviewExam(exam);
                            setPreviewOpen(true);
                          }}
                          className="p-2 text-gray-600 hover:text-[#066C98] rounded-lg hover:bg-[#066C98]/10 transition"
                          title="Preview"
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => {
                            setRenameExam(exam);
                            setNewName(exam.examName);
                            setRenameOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition"
                          title="Rename"
                          disabled={isMutating}
                        >
                          {isMutating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Pencil className="w-5 h-5" />
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setDeleteExam(exam);
                            setDeleteOpen(true);
                          }}
                          className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 transition"
                          title="Delete"
                          disabled={isMutating}
                        >
                          {isMutating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {total > EXAMS_PER_PAGE && (
          <div className="flex justify-center mt-10">
            {paginationLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-[#066C98]" />
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || paginationLoading}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  Previous
                </button>

                <span className="px-4 py-2 font-medium">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || paginationLoading}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      {renameOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-5">Rename Exam</h2>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#066C98]"
              placeholder="New exam name"
            />
            <div className="mt-8 flex gap-4 justify-end">
              <button
                onClick={() => setRenameOpen(false)}
                className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={renameExamFn}
                disabled={!newName.trim() || mutationLoadingId}
                className="px-6 py-3 bg-[#066C98] hover:bg-[#055a80] text-white rounded-xl disabled:opacity-60 transition flex items-center gap-2"
              >
                {mutationLoadingId && <Loader2 className="w-5 h-5 animate-spin" />}
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-4 text-red-700">Delete Exam?</h2>
            <p className="text-gray-600 mb-8">
              This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setDeleteOpen(false)}
                className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={deleteExamFn}
                disabled={mutationLoadingId}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl disabled:opacity-60 transition flex items-center gap-2"
              >
                {mutationLoadingId && <Loader2 className="w-5 h-5 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      {previewOpen && previewExam && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                Preview: {previewExam.examName}
              </h2>
              <button
                onClick={() => setPreviewOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {previewExam.questions?.length ? (
                previewExam.questions.map((q, idx) => (
                  <div key={idx} className="mb-10 last:mb-0">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#066C98]/10 text-[#066C98] font-bold flex items-center justify-center shrink-0">
                        {q.questionNo}
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-medium">{q.questionText}</p>
                        {q.questionImage && (
                          <img
                            src={q.questionImage}
                            alt="Question"
                            className="mt-3 max-h-48 object-contain rounded border"
                          />
                        )}

                        <div className="mt-6 space-y-4 pl-4 border-l-2 border-gray-200">
                          {["A", "B", "C", "D"].map((opt) => {
                            const key = `option${opt}`;
                            const imgKey = `option${opt}Image`;
                            return (
                              <div key={opt} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-medium shrink-0">
                                  {opt}
                                </div>
                                <div className="flex-1">
                                  <p>{q[key]}</p>
                                  {q[imgKey] && (
                                    <img
                                      src={q[imgKey]}
                                      alt={`Option ${opt}`}
                                      className="mt-2 max-h-32 object-contain rounded border"
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-12">
                  No questions available in this exam.
                </p>
              )}
            </div>

            <div className="p-5 border-t flex justify-end">
              <button
                onClick={() => setPreviewOpen(false)}
                className="px-8 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div
            className={`px-6 py-4 rounded-xl shadow-2xl text-white flex items-center gap-4 min-w-[320px] ${
              toast.type === "error" ? "bg-red-600" : "bg-emerald-600"
            }`}
          >
            {toast.type === "error" && <AlertCircle className="w-6 h-6" />}
            <span className="flex-1">{toast.msg}</span>
          </div>
        </div>
      )}
    </div>
  );
}