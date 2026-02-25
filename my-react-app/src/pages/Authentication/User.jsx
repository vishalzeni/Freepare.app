import { useEffect, useMemo, useState } from "react";
import {
  CircleUserRound,
  Info,
  Loader2,
  LogOut,
  Pencil,
  UserPlus,
} from "lucide-react";
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import AdditionalInfoDialog from "./AdditionalInfoDialog";
import Modal from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";

const API_URL = import.meta.env.VITE_API_URL || "https://api.freepare.com";
const BASE_URL = `${API_URL}`;

const avatarOptions = [
  "https://images.unsplash.com/photo-1541534401786-2077eed87a72?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1542204625-de293a06df37?auto=format&fit=crop&w=120&q=80",
];

const User = ({ open, onClose, onUpdateImage }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarSelectionOpen, setAvatarSelectionOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [additionalInfoDialog, setAdditionalInfoDialog] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState({
    institutionType: "",
    class: "",
    institutionName: "",
    degreeName: "",
    passingYear: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
          setError("Please log in to view user details.");
          return;
        }

        const decodedToken = jwtDecode(token);
        const { exp, userId } = decodedToken;

        if (Date.now() >= exp * 1000) {
          setError("Your session has expired. Please log in again.");
          return;
        }

        const response = await fetch(`${BASE_URL}/users/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setUserData(data);
        onUpdateImage(data.profileImageUrl || null, data.firstName);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Log in to your Freepare account to access your information.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [open, onUpdateImage]);

  const isSixDaysOld = useMemo(() => {
    if (!userData?.createdAt) return false;
    return (Date.now() - new Date(userData.createdAt).getTime()) / (1000 * 60 * 60 * 24) >= 6;
  }, [userData]);

  const notify = (message, severity = "info") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleAvatarClick = async (imageUrl) => {
    const newImageUrl = imageUrl === "none" ? null : imageUrl;
    onUpdateImage(newImageUrl, userData?.firstName);
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) return notify("JWT token is missing.", "error");

      const response = await fetch(`${BASE_URL}/users/update-avatar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profileImageUrl: newImageUrl }),
      });

      if (!response.ok) throw new Error("Failed to update avatar");

      setUserData((prev) => ({ ...prev, profileImageUrl: newImageUrl }));
      setAvatarSelectionOpen(false);
      notify(newImageUrl ? "Avatar updated successfully!" : "Avatar removed successfully!", "success");
      onClose();
    } catch (err) {
      console.error("Error updating avatar:", err);
      notify("Failed to update avatar.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    notify("Logged out successfully!", "info");
    onClose();
    navigate("/");
    window.location.reload();
  };

  const handleOpenLogin = () => {
    window.open("/login", "_blank");
    notify("Login page opened.", "info");
  };

  const handleOpenSignup = () => {
    window.open("/signup", "_blank");
    notify("Signup page opened.", "info");
  };

  const handleAddInfoSubmit = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) return notify("You need to log in to update information.", "error");

      const decodedToken = jwtDecode(token);
      const updatedAdditionalInfo = { ...additionalInfo, userId: decodedToken.userId };

      const response = await fetch(`${BASE_URL}/users/add-info`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedAdditionalInfo),
      });

      if (!response.ok) throw new Error("Failed to update additional info.");

      const data = await response.json();
      setUserData((prev) => ({ ...prev, ...data }));
      notify("Information updated successfully!", "success");
      setAdditionalInfoDialog(false);
    } catch (err) {
      console.error("Error updating additional info:", err);
      notify("Failed to update information.", "error");
    }
  };

  const handleSaveName = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) return notify("You need to log in to update information.", "error");

      const decodedToken = jwtDecode(token);
      const response = await fetch(`${BASE_URL}/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...userData, userId: decodedToken.userId }),
      });

      if (!response.ok) throw new Error("Failed to update user data.");

      const data = await response.json();
      setUserData(data);
      onUpdateImage(data.profileImageUrl || null, data.firstName);
      setIsEditingName(false);
      notify("Information updated successfully!", "success");
    } catch (err) {
      console.error("Error updating user data:", err);
      notify("Failed to update information.", "error");
    }
  };

  const actionButtons = () => {
    if (error === "Please log in to view user details.") {
      return (
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleOpenLogin}
            className="inline-flex items-center gap-1 rounded-lg bg-[#066C98] px-3 py-2 text-sm font-semibold text-white hover:bg-[#045472]"
          >
            <UserPlus size={16} />
            Login
          </button>
          <button
            type="button"
            onClick={handleOpenSignup}
            className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
          >
            <UserPlus size={16} />
            Sign Up
          </button>
        </div>
      );
    }

    if (error === "Your session has expired. Please log in again.") {
      return (
        <button
          type="button"
          onClick={handleOpenLogin}
          className="inline-flex items-center gap-1 rounded-lg bg-[#066C98] px-3 py-2 text-sm font-semibold text-white hover:bg-[#045472]"
        >
          <UserPlus size={16} />
          Login
        </button>
      );
    }

    if (!error && userData) {
      return (
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          {isSixDaysOld && userData.institutionType == null && (
            <button
              type="button"
              onClick={() => setAdditionalInfoDialog(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"
            >
              <Info size={16} />
              Complete Profile
            </button>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title="User Information" size="md" footer={actionButtons()}>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="animate-spin text-[#066C98]" />
          </div>
        ) : error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-medium text-rose-700">
            {error}
          </p>
        ) : (
          userData && (
            <div className="space-y-3 text-sm text-slate-700">
              <button
                type="button"
                title="Change avatar"
                className="mx-auto block rounded-full"
                onClick={() => setAvatarSelectionOpen(true)}
              >
                {userData.profileImageUrl ? (
                  <div className="rounded-full bg-gradient-to-tr from-pink-500 via-orange-400 to-indigo-500 p-1">
                    <img
                      src={userData.profileImageUrl}
                      alt="Profile"
                      className="h-20 w-20 rounded-full bg-white object-cover"
                    />
                  </div>
                ) : (
                  <CircleUserRound className="mx-auto h-20 w-20 text-[#066C98]" />
                )}
              </button>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Name</p>
                {isEditingName ? (
                  <div className="space-y-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#066C98] focus:ring-2 focus:ring-sky-100"
                        value={userData.firstName || ""}
                        onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                      />
                      <input
                        className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#066C98] focus:ring-2 focus:ring-sky-100"
                        value={userData.lastName || ""}
                        onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingName(false)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveName}
                        className="rounded-lg bg-[#066C98] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#045472]"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800">
                      {userData.firstName || "No first name"} {userData.lastName || ""}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(true)}
                      className="rounded-md p-1 text-[#066C98] hover:bg-sky-50"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2">
                <p>
                  <span className="font-semibold">Email:</span> {userData.email}
                </p>
                {userData.phone && (
                  <p>
                    <span className="font-semibold">Phone:</span> {userData.phone}
                  </p>
                )}
                {userData.institutionName && (
                  <p>
                    <span className="font-semibold">Institution:</span> {userData.institutionName}
                  </p>
                )}
                {userData.class && (
                  <p>
                    <span className="font-semibold">Class:</span> {userData.class}
                  </p>
                )}
                {userData.degreeName && (
                  <p>
                    <span className="font-semibold">Degree:</span> {userData.degreeName}
                  </p>
                )}
                {userData.passingYear && (
                  <p>
                    <span className="font-semibold">Passing Year:</span> {userData.passingYear}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs italic text-slate-500">
                <p>Account Created: {new Date(userData.createdAt).toLocaleDateString("en-GB")}</p>
                <p>Last Updated: {new Date(userData.updatedAt).toLocaleDateString("en-GB")}</p>
              </div>
            </div>
          )
        )}
      </Modal>

      <Modal
        open={avatarSelectionOpen}
        onClose={() => setAvatarSelectionOpen(false)}
        title="Select Avatar"
        size="sm"
        footer={
          <button
            type="button"
            onClick={() => setAvatarSelectionOpen(false)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        }
      >
        <div className="grid grid-cols-3 gap-3">
          {[...avatarOptions, ...(userData?.profileImageUrl ? ["none"] : [])].map((avatar, index) =>
            avatar === "none" ? (
              <button
                key={`none-${index}`}
                type="button"
                onClick={() => handleAvatarClick("none")}
                className="flex h-14 items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-xs font-semibold text-slate-500 transition hover:border-rose-300 hover:text-rose-600"
              >
                None
              </button>
            ) : (
              <button key={`${avatar}-${index}`} type="button" onClick={() => handleAvatarClick(avatar)}>
                <img
                  src={avatar}
                  alt={`Avatar ${index + 1}`}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-transparent transition hover:ring-sky-300"
                />
              </button>
            )
          )}
        </div>
      </Modal>

      <AdditionalInfoDialog
        open={additionalInfoDialog}
        onClose={() => setAdditionalInfoDialog(false)}
        additionalInfo={additionalInfo}
        handleAdditionalInfoChange={(event) =>
          setAdditionalInfo((prev) => ({
            ...prev,
            [event.target.name]: event.target.value,
          }))
        }
        handleAddInfoSubmit={handleAddInfoSubmit}
      />

      <Toast
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />
    </>
  );
};

export default User;

