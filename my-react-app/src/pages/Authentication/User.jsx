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

const BASE_URL = "http://82.112.236.241:5000";

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
        if (data.profileImageUrl) {
          onUpdateImage(data.profileImageUrl, data.firstName);
        }
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
    onUpdateImage(imageUrl);

    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        console.error("JWT token is missing.");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/users/update-avatar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ profileImageUrl: imageUrl }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update avatar");
      }
      setAvatarSelectionOpen(false);
      setSnackbarMessage("Avatar updated successfully!");
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
        <DialogTitle sx={{color: "#066C98", fontSize: "1.4rem"}}> {/* Custom styles */}
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
<Typography variant="body1" sx={{ display: "flex", alignItems: "center", textTransform: "capitalize" }}>
  <strong style={{marginRight: "5px"}}>Name:</strong>
  {editableFields.firstName ? (
    <>
      <input
        type="text"
        value={userData.firstName}
        onChange={(e) =>
          setUserData({ ...userData, firstName: e.target.value })
        }
        style={{ marginRight: "8px" }}
      />
      <input
        type="text"
        value={userData.lastName}
        onChange={(e) =>
          setUserData({ ...userData, lastName: e.target.value })
        }
        style={{ marginRight: "8px" }}
      />
    </>
  ) : (
    <>
      {userData.firstName} {userData.lastName}
    </>
  )}
  {!editableFields.firstName && (
  <IconButton
  onClick={() => handleEditClick("firstName")}
  sx={{
    color: "#066C98", // Change to a more prominent color if needed
    fontSize: "1.4rem", // Adjusted font size
    padding: "4px", // Reduced padding for a smaller button
    "&:hover": {
      backgroundColor: "rgba(6, 108, 152, 0.1)", // Light hover effect
    },
    marginLeft: 1,
  }}
  size="small" // This reduces the overall size of the button
>
  <EditIcon fontSize="inherit" /> {/* Inherits font size from IconButton */}
</IconButton>

  )}

  {editableFields.firstName && (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <IconButton
  onClick={handleCancelEdit}
  sx={{
    color: "#FF0000", // Red for cancel action
    fontSize: "1.4rem", // Adjusted font size
    padding: "4px", // Reduced padding for a smaller button
    "&:hover": {
      backgroundColor: "rgba(255, 0, 0, 0.1)",
    },
  }}
  size="small" // This reduces the overall size of the button
>
  <CloseIcon fontSize="inherit" /> 
</IconButton>

      <Button
        onClick={handleSave}
        variant="contained"
        color="primary"
        sx={{
          marginLeft: 1, // Space between Edit and Done button
          "&:hover": {
            backgroundColor: "#004a73", // Darker hover effect for better visual
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
                }}
              >
                <Typography variant="body1" sx={{ mt: 2 }}>
                  <strong style={{ color: "grey", fontStyle: "italic", fontWeight: 500 }}>
                    Account Created at:
                  </strong>{" "}
                  {new Date(userData.createdAt).toLocaleDateString("en-GB")}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  <strong style={{ color: "grey", fontStyle: "italic", fontWeight: 500 }}>
                    Last Updated at:
                  </strong>{" "}
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
              <Tooltip title="Select Avatar">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => setAvatarSelectionOpen(true)}
                >
                  <AvatarIcon sx={{ margin: 1, color: "#066C98" }} />
                  <Typography variant="body2" sx={{ color: "#066C98" }}>
                    Avatar
                  </Typography>
                </Box>
              </Tooltip>

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
              "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001882.png",
              "https://img.lovepik.com/element/40145/1025.png_1200.png",
              "/avatars/avatar3.png",
              "/avatars/avatar4.png",
              "/avatars/avatar5.png",
            ].map((avatar, index) => (
              <Grid item xs={4} sm={2} key={index}>
                <Avatar
                  src={avatar}
                  alt={`Avatar ${index + 1}`}
                  sx={{ width: 56, height: 56, cursor: "pointer", mx: "auto" }}
                  onClick={() => handleAvatarClick(avatar)}
                />
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
