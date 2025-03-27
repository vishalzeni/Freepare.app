import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

const BASE_URL = "https://82.112.236.241:5000"; // Define BASE_URL here

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
    if (open) {
      setEmail("");
      setNewPassword("");
      setConfirmNewPassword("");
      setError("");
      setSnackbarOpen(false);
    }
  }, [open]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Invalid email format.");
      return;
    }

    if (!newPassword || !confirmNewPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/reset-password`, { // Use BASE_URL here
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
      setError(err.message || "An error occurred. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Forgot Password</DialogTitle>
        <DialogContent>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              margin="normal"
              variant="outlined"
              error={!!error && error.includes("email")}
              helperText={error.includes("email") ? error : ""}
              aria-label="Email Address"
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              margin="normal"
              variant="outlined"
              error={!!error && error.includes("password")}
              helperText={error.includes("password") ? error : ""}
              aria-label="New Password"
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              margin="normal"
              variant="outlined"
              error={!!error && error.includes("password")}
              helperText={error.includes("password") ? error : ""}
              aria-label="Confirm New Password"
            />
            <DialogActions>
              <Button onClick={onClose} color="primary" disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" color="primary" disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : "Reset Password"}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ForgotPasswordDialog;