import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";
import {
  Search,
  Trash2,
  UserCircle2,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { debounce } from "../utils/debounce";

const API_URL = import.meta.env.VITE_API_URL || "https://api.freepare.com";
const BASE_URL = `${API_URL}`;

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [searchTerm, setSearchTerm] = useState("");
  const [institutionTypeFilter, setInstitutionTypeFilter] = useState("");

  const [deleteModal, setDeleteModal] = useState(false);
  const [exportModal, setExportModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [nameInput, setNameInput] = useState("");

  const [isSearching, setIsSearching] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "info",
  });

  // ==============================
  // Fetch with Retry
  // ==============================
  useEffect(() => {
    const fetchUsers = async (retries = 3) => {
      try {
        const res = await axios.get(`${BASE_URL}/users-data`);
        setUsers(res.data);
        setLoading(false);
      } catch (err) {
        if (retries > 0) {
          setTimeout(() => fetchUsers(retries - 1), 1000);
        } else {
          setError("Failed to fetch users.");
          setSnackbar({
            open: true,
            message: "Failed to fetch users.",
            type: "error",
          });
          setLoading(false);
        }
      }
    };

    fetchUsers();
  }, []);

  // ==============================
  // Debounced Search
  // ==============================
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setIsSearching(false);
    }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = (e) => {
    setIsSearching(true);
    debouncedSearch(e.target.value);
  };

  // ==============================
  // Filtering
  // ==============================
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const search = searchTerm.toLowerCase();
      return (
        (user.firstName?.toLowerCase().includes(search) ||
          user.lastName?.toLowerCase().includes(search) ||
          user.email?.toLowerCase().includes(search)) &&
        (institutionTypeFilter === "" ||
          user.institutionType?.toLowerCase() ===
            institutionTypeFilter.toLowerCase())
      );
    });
  }, [users, searchTerm, institutionTypeFilter]);

  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredUsers, page, rowsPerPage]);

  // ==============================
  // Delete
  // ==============================
  const handleDeleteConfirm = async () => {
    if (nameInput !== userToDelete.firstName) {
      setSnackbar({
        open: true,
        message: "Name does not match.",
        type: "error",
      });
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/users-data/${userToDelete._id}`);
      setUsers((prev) =>
        prev.filter((u) => u._id !== userToDelete._id)
      );
      setSnackbar({
        open: true,
        message: "User deleted successfully.",
        type: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Delete failed.",
        type: "error",
      });
    }

    setDeleteModal(false);
    setUserToDelete(null);
    setNameInput("");
  };

  // ==============================
  // CSV Export Filter
  // ==============================
  const filterUserDataForExport = (users) => {
    return users.map(
      ({
        profileImageUrl,
        _id,
        password,
        updatedAt,
        __v,
        completedTests,
        submittedTest,
        ...rest
      }) => rest
    );
  };

  // ==============================
  // Snackbar Component
  // ==============================
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
    <div className="p-8 bg-slate-950 min-h-screen text-white">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Users Data
        </h1>

        <div className="flex flex-wrap gap-4 items-center">
          {/* SEARCH */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              onChange={handleSearchChange}
              className="pl-10 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-cyan-400" />
            )}
          </div>

          {/* FILTER */}
          <select
            className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg"
            onChange={(e) => setInstitutionTypeFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="school">School</option>
            <option value="college">College</option>
          </select>

          {/* EXPORT */}
          <button
            onClick={() => setExportModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-gray-400">
            <tr>
              <th className="p-3 text-left">User</th>
              <th>Email</th>
              <th>Institution</th>
              <th>Type</th>
              <th>Year</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, i) => (
                <tr key={i} className="animate-pulse border-t border-slate-800">
                  <td className="p-4 bg-slate-800/40" colSpan="6"></td>
                </tr>
              ))
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-6">
                  No users found.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr
                  key={user._id}
                  className="border-t border-slate-800 hover:bg-slate-900 transition"
                >
                  <td className="p-3 flex items-center gap-3">
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <UserCircle2 className="w-10 h-10 text-cyan-400" />
                    )}
                    {user.firstName} {user.lastName}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.institutionName || "N/A"}</td>
                  <td>{user.institutionType || "N/A"}</td>
                  <td>{user.passingYear || "N/A"}</td>
                  <td>
                    <button
                      onClick={() => {
                        setUserToDelete(user);
                        setDeleteModal(true);
                      }}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-6">
        <div>
          Rows:
          <select
            className="ml-2 bg-slate-800 px-2 py-1 rounded"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
          >
            {[5, 10, 25].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="flex items-center gap-2 disabled:opacity-40"
          >
            <ChevronLeft size={16} /> Prev
          </button>

          <button
            disabled={(page + 1) * rowsPerPage >= filteredUsers.length}
            onClick={() => setPage(page + 1)}
            className="flex items-center gap-2 disabled:opacity-40"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-slate-900 p-6 rounded-xl w-96">
            <h2 className="text-lg font-semibold mb-4">Delete User</h2>
            <p className="mb-3 text-sm">
              Type <b>{userToDelete?.firstName}</b> to confirm.
            </p>

            <input
              className="w-full bg-slate-800 p-2 rounded mb-4"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteModal(false)}
                className="px-4 py-2 bg-slate-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      {exportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-slate-900 p-6 rounded-xl w-96">
            <h2 className="text-lg mb-4">Export Users?</h2>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setExportModal(false)}
                className="px-4 py-2 bg-slate-700 rounded"
              >
                Cancel
              </button>
              <CSVLink
                data={filterUserDataForExport(filteredUsers)}
                filename="users.csv"
                className="px-4 py-2 bg-emerald-600 rounded"
              >
                Confirm
              </CSVLink>
            </div>
          </div>
        </div>
      )}

      <Snackbar />
    </div>
  );
};

export default Dashboard;