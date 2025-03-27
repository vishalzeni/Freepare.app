import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Box,
  CircularProgress,
  Typography,
  Grid,
  Avatar,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import LogoutIcon from "@mui/icons-material/ExitToApp";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AvatarIcon from "@mui/icons-material/AccountCircle";
import AdditionalInfoDialog from "./AdditionalInfoDialog";

const BASE_URL = "https://82.112.236.241:5000";

const User = ({ open, onClose, onUpdateImage }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarSelectionOpen, setAvatarSelectionOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [additionalInfoDialog, setAdditionalInfoDialog] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState({
    institutionType: "",
    class: "",
    institutionName: "",
    degreeName: "",
    passingYear: "",
  });
  const [editableFields, setEditableFields] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    institutionName: false,
    class: false,
    degreeName: false,
    passingYear: false,
    universityName: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
          setError("Please log in to view user details.");
          setLoading(false);
          return;
        }

        const decodedToken = jwtDecode(token);
        const { exp, userId } = decodedToken;

        if (Date.now() >= exp * 1000) {
          setError("Your session has expired. Please log in again.");
          setLoading(false);
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
  }, [onUpdateImage]);

  const handleAvatarClick = async (imageUrl) => {
    const newImageUrl = imageUrl === "none" ? null : imageUrl;
    onUpdateImage(newImageUrl, userData?.firstName);
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        console.error("JWT token is missing.");
        setSnackbarMessage("JWT token is missing.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      const response = await fetch(`${BASE_URL}/users/update-avatar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profileImageUrl: newImageUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to update avatar");
      }

      setUserData((prev) => ({ ...prev, profileImageUrl: newImageUrl }));
      setAvatarSelectionOpen(false);
      setSnackbarMessage(
        newImageUrl
          ? "Avatar updated successfully!"
          : "Avatar removed successfully!"
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      onClose();
    } catch (err) {
      console.error("Error updating avatar:", err);
      setSnackbarMessage("Failed to update avatar.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleLogout = () => {
    localStorage.setItem("jwtToken", " ");
    setSnackbarMessage("Logged out successfully!");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
    navigate("/");
    onClose();
    window.location.reload();
  };

  const handleOpenLogin = () => {
    window.open("/login", "_blank");
    setSnackbarMessage("Login page opened.");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  const handleOpenSignup = () => {
    window.open("/signup", "_blank");
    setSnackbarMessage("Signup page opened.");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  const handleAddInfoOpen = () => {
    setAdditionalInfoDialog(true);
  };

  const handleAddInfoClose = () => {
    setAdditionalInfoDialog(false);
  };
  const handleAdditionalInfoChange = (e) => {
    setAdditionalInfo({
      ...additionalInfo,
      [e.target.name]: e.target.value,
    });
  };
  const handleAddInfoSubmit = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        setSnackbarMessage("You need to log in to update information.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      // Decode the JWT token to get the userId
      const decodedToken = jwtDecode(token);
      const { userId } = decodedToken;

      // Add userId to the additionalInfo object
      const updatedAdditionalInfo = {
        ...additionalInfo,
        userId: userId, // Add userId here
      };

      const response = await fetch(`${BASE_URL}/users/add-info`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedAdditionalInfo), // Send updated info with userId
      });

      if (!response.ok) {
        throw new Error("Failed to update additional info.");
      }

      const data = await response.json();
      console.log("Response data:", data); // Log the response data for debugging

      setUserData((prev) => ({ ...prev, ...data }));
      setSnackbarMessage("Information updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleAddInfoClose();
    } catch (err) {
      console.error("Error updating additional info:", err);
      setSnackbarMessage("Failed to update information.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const isSixDaysOld = userData
    ? (Date.now() - new Date(userData.createdAt).getTime()) /
        (1000 * 60 * 60 * 24) >=
      6
    : false;

  const handleEditClick = (field) => {
    setEditableFields((prev) => ({
      ...prev,
      [field]: !prev[field], // Toggle edit mode
    }));
  };

  const handleCancelEdit = () => {
    setEditableFields({}); // Reset editable state
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        setSnackbarMessage("You need to log in to update information.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      const decodedToken = jwtDecode(token);
      const { userId } = decodedToken;
      console.log("User ID from JWT:", userId);

      const updatedUserData = {
        ...userData,
        userId: userId, // Add userId here
      };

      const response = await fetch(`${BASE_URL}/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUserData), // Send updated user data
      });

      if (!response.ok) {
        throw new Error("Failed to update user data.");
      }

      const data = await response.json();
      setUserData(data); // Update the state with the new data
      setSnackbarMessage("Information updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setEditableFields({}); // Reset editable state
      // Reload the window after successful update
      window.location.reload();
    } catch (err) {
      console.error("Error updating user data:", err);
      setSnackbarMessage("Failed to update information.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{ color: "#066C98", fontSize: "1.4rem", textAlign: "center" }}
        >
          User Information
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {!error && userData && (
            <Tooltip title="Select Avatar">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  justifyContent: "center",
                  mb: 2,
                }}
                onClick={() => setAvatarSelectionOpen(true)}
              >
                {userData.profileImageUrl ? (
                  <Box
                    sx={{
                      position: "relative",
                      display: "inline-block",
                      padding: "4px", // Space for border effect
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)", // Instagram gradient
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: "#fff", // Inner white border
                        borderRadius: "50%",
                        padding: "1px", // Creates a thin inner border effect
                      }}
                    >
                      <Avatar
                        src={userData.profileImageUrl}
                        alt="Profile Picture"
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                        }}
                      />
                    </Box>
                  </Box>
                ) : (
                  <AvatarIcon
                    sx={{ margin: 1, color: "#066C98", fontSize: 80 }}
                  />
                )}
              </Box>
            </Tooltip>
          )}
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="150px"
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" textAlign="center">
              {error}
            </Typography>
          ) : userData ? (
            <Box>
              <Typography
                variant="body1"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  textTransform: "capitalize",
                  mb: 2,
                }}
              >
                <strong style={{ marginRight: "5px" }}>Name:</strong>
                {editableFields.firstName ? (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="text"
                      value={userData.firstName}
                      onChange={(e) =>
                        setUserData({ ...userData, firstName: e.target.value })
                      }
                      style={{
                        marginRight: "8px",
                        padding: "4px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                      }}
                    />
                    <input
                      type="text"
                      value={userData.lastName}
                      onChange={(e) =>
                        setUserData({ ...userData, lastName: e.target.value })
                      }
                      style={{
                        marginRight: "8px",
                        padding: "4px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                      }}
                    />
                  </Box>
                ) : (
                  <>
                    {userData.firstName || "No first name provided"}{" "}
                    {userData.lastName || ""}{" "}
                  </>
                )}
                {!editableFields.firstName && (
                  <IconButton
                    onClick={() => handleEditClick("firstName")}
                    sx={{
                      color: "#066C98",
                      fontSize: "1.2rem",
                      padding: "4px",
                      "&:hover": {
                        backgroundColor: "rgba(6, 108, 152, 0.1)",
                      },
                      marginLeft: 1,
                    }}
                    size="small"
                  >
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                )}

                {editableFields.firstName && (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton
                      onClick={handleCancelEdit}
                      sx={{
                        color: "#FF0000",
                        fontSize: "1.4rem",
                        padding: "4px",
                        "&:hover": {
                          backgroundColor: "rgba(255, 0, 0, 0.1)",
                        },
                      }}
                      size="small"
                    >
                      <CloseIcon fontSize="inherit" />
                    </IconButton>

                    <Button
                      onClick={handleSave}
                      variant="contained"
                      color="primary"
                      sx={{
                        marginLeft: 1,
                        "&:hover": {
                          backgroundColor: "#004a73",
                        },
                      }}
                    >
                      Done
                    </Button>
                  </Box>
                )}
              </Typography>

              <Typography variant="body1" sx={{ mt: 2 }}>
                <strong>Email:</strong> {userData.email}
              </Typography>
              {userData.phone && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  <strong>Phone:</strong> {userData.phone}
                </Typography>
              )}
              {userData.institutionName && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  <strong>Institution Name:</strong> {userData.institutionName}
                </Typography>
              )}
              {userData.class && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  <strong>Class:</strong> {userData.class}
                </Typography>
              )}
              {userData.degreeName && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  <strong>Degree Name:</strong> {userData.degreeName}
                </Typography>
              )}
              {userData.passingYear && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  <strong>Passing Year:</strong> {userData.passingYear}
                </Typography>
              )}
              {userData.universityName && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  <strong>University Name:</strong> {userData.universityName}
                </Typography>
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexDirection: { xs: "column", md: "row" },
                  mt: 4,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "grey", fontStyle: "italic" }}
                >
                  Account Created at:{" "}
                  {new Date(userData.createdAt).toLocaleDateString("en-GB")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "grey", fontStyle: "italic"}}
                >
                  Last Updated at:{" "}
                  {new Date(userData.updatedAt).toLocaleDateString("en-GB")}
                </Typography>
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions
          sx={{ justifyContent: "space-between", flexWrap: "wrap" }}
        >
          {error === "Please log in to view user details." && (
            <>
              <Tooltip title="Login">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={handleOpenLogin}
                >
                  <PersonAddIcon sx={{ margin: 1, color: "#066C98" }} />
                  <Typography variant="body2" sx={{ color: "#066C98" }}>
                    Login
                  </Typography>
                </Box>
              </Tooltip>
              <Tooltip title="Sign Up">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={handleOpenSignup}
                >
                  <PersonAddIcon sx={{ margin: 1, color: "#d32f2f" }} />
                  <Typography variant="body2" sx={{ color: "#d32f2f" }}>
                    Sign Up
                  </Typography>
                </Box>
              </Tooltip>
            </>
          )}

          {error === "Your session has expired. Please log in again." && (
            <Tooltip title="Login">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={handleOpenLogin}
              >
                <PersonAddIcon sx={{ margin: 1, color: "#066C98" }} />
                <Typography variant="body2" sx={{ color: "#066C98" }}>
                  Login
                </Typography>
              </Box>
            </Tooltip>
          )}

          {!error && userData && (
            <>
              {isSixDaysOld && userData.institutionType === null && (
                <Tooltip title="Add Info">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={handleAddInfoOpen}
                  >
                    <InfoIcon sx={{ margin: 1, color: "#FF8C00" }} />
                    <Typography variant="body2" sx={{ color: "#FF8C00" }}>
                      Complete your Profile
                    </Typography>
                  </Box>
                </Tooltip>
              )}

              <Tooltip title="Logout">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={handleLogout}
                >
                  <LogoutIcon sx={{ margin: 1, color: "#d32f2f" }} />
                  <Typography variant="body2" sx={{ color: "#d32f2f" }}>
                    Logout
                  </Typography>
                </Box>
              </Tooltip>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Avatar Selection Dialog */}
      <Dialog
        open={avatarSelectionOpen}
        onClose={() => setAvatarSelectionOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle>Select Your Avatar</DialogTitle>
        <DialogContent>
          <Grid container display="flex" justifyContent="center" spacing={2}>
            {[
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThm_sNap5JDlWIBTFj4sfaTiP7c1SoAC41M5KRZ57yS6oFRHIc_kgugzTb-uRvF1o_5lw&usqp=CAU",
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR48W8lUbwx01SmJ762lWbAi7QFnE7jNVzN9w&s",
              "data:image/jpeg;base64,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",
              "data:image/jpeg;base64,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",
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR52fGSGUZRTrda86_5qbnfHBqjf-DeShta6g&s",
              ...(userData?.profileImageUrl ? ["none"] : []),
            ].map((avatar, index) => (
              <Grid item xs={4} sm={2} key={index}>
                {avatar === "none" ? (
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px dashed #ccc",
                      cursor: "pointer",
                      mx: "auto",
                      borderRadius: "50%",
                    }}
                    onClick={() => handleAvatarClick(avatar)}
                  >
                    <Typography variant="body2">None</Typography>
                  </Box>
                ) : (
                  <Avatar
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    sx={{
                      width: 56,
                      height: 56,
                      cursor: "pointer",
                      mx: "auto",
                    }}
                    onClick={() => handleAvatarClick(avatar)}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <IconButton
            onClick={() => setAvatarSelectionOpen(false)}
            color="primary"
          >
            <CloseIcon />
          </IconButton>
        </DialogActions>
      </Dialog>

      <AdditionalInfoDialog
        open={additionalInfoDialog}
        onClose={handleAddInfoClose}
        additionalInfo={additionalInfo}
        handleAdditionalInfoChange={handleAdditionalInfoChange}
        handleAddInfoSubmit={handleAddInfoSubmit}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default User;
