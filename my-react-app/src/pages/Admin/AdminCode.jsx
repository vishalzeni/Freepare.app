import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
  Paper,
  InputAdornment,
  Divider,
  Tooltip,
  Fade,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Edit,
  Delete,
  Save,
  Cancel,
  Lock,
  Security,
} from "@mui/icons-material";

// Set the base URL for axios
axios.defaults.baseURL = "https://82.112.236.241:5000";

function AdminCode() {
  const [adminCode, setAdminCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/adminCode")
      .then((response) => {
        if (response.data.adminCode) {
          setAdminCode(response.data.adminCode);
        }
      })
      .catch((error) => {
        setSnackbarMessage("Failed to fetch admin code");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  const toggleVisibility = useCallback(
    () => setShowCode(!showCode),
    [showCode]
  );

  const handleCreate = useCallback(() => {
    if (newCode.trim().length >= 4) {
      setLoading(true);
      axios
        .post("/api/adminCode", { adminCode: newCode.trim() })
        .then(() => {
          setAdminCode(newCode.trim());
          setNewCode("");
          setSnackbarMessage("Admin code created successfully!");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        })
        .catch((error) => {
          console.error("Error creating admin code:", error);
          setSnackbarMessage("Failed to create admin code.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [newCode]);

  const handleEdit = useCallback(() => {
    setNewCode(adminCode);
    setIsEditing(true);
  }, [adminCode]);

  const handleSave = useCallback(() => {
    if (newCode.trim().length >= 4) {
      setLoading(true);
      axios
        .put("/api/adminCode", { adminCode: newCode.trim() })
        .then(() => {
          setAdminCode(newCode.trim());
          setIsEditing(false);
          setSnackbarMessage("Admin code updated successfully!");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        })
        .catch((error) => {
          console.error("Error updating admin code:", error);
          setSnackbarMessage("Failed to update admin code.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [newCode]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleDelete = useCallback(() => {
    setLoading(true);
    axios
      .delete("/api/adminCode")
      .then(() => {
        setAdminCode("");
        setDeleteConfirmOpen(false);
        setSnackbarMessage("Admin code deleted successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error("Error deleting admin code:", error);
        setSnackbarMessage("Failed to delete admin code.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh",
        p: { xs: 2, sm: 4, md: 6 },
      }}
    >
      <Paper
        sx={{
          p: { xs: 2, sm: 4 },
          width: "100%",
          maxWidth: { xs: 400, sm: 500, md: 600 },
          textAlign: "center",
          borderRadius: "16px",
          boxShadow: 4,
          background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
          position: "relative",
          overflow: "hidden",
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #2196f3 0%, #4caf50 100%)",
          },
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Lock sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
          <Typography
            variant="h4"
            fontWeight="bold"
            color="text.primary"
            gutterBottom
          >
            Admin Security Code
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary">
            {adminCode
              ? "Manage your secure admin access code"
              : "Create a new admin access code"}
          </Typography>
        </Box>

        <Fade in timeout={300}>
          <Box>
            {loading ? (
              <CircularProgress />
            ) : adminCode ? (
              isEditing ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    alignItems: "center",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <TextField
                    fullWidth
                    label="New Admin Code"
                    variant="outlined"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    autoFocus
                    helperText="Minimum 4 characters required"
                    error={newCode.trim().length < 4}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Security color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ flex: 1, minWidth: { xs: "100%", sm: "250px" } }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 2,
                      width: "100%",
                    }}
                  >
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleSave}
                      startIcon={<Save />}
                      disabled={newCode.trim().length < 4}
                      sx={{
                        flex: 1,
                        minWidth: "auto",
                        width: { xs: "100%", sm: "auto" },
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={handleCancel}
                      startIcon={<Cancel />}
                      sx={{
                        flex: 1,
                        minWidth: "auto",
                        width: { xs: "100%", sm: "auto" },
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    alignItems: "center",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <TextField
                    fullWidth
                    variant="outlined"
                    type={showCode ? "text" : "password"}
                    value={adminCode}
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Security color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title={showCode ? "Hide Code" : "Show Code"}>
                            <IconButton
                              onClick={toggleVisibility}
                              aria-label={showCode ? "Hide Code" : "Show Code"}
                            >
                              {showCode ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ flex: 1, minWidth: { xs: "100%", sm: "250px" } }}
                  />
                  <Tooltip title="Edit Code">
                    <IconButton
                      color="primary"
                      onClick={handleEdit}
                      aria-label="Edit Code"
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Code">
                    <IconButton
                      color="error"
                      onClick={() => setDeleteConfirmOpen(true)}
                      aria-label="Delete Code"
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              )
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <TextField
                  fullWidth
                  label="Enter Admin Code"
                  variant="outlined"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  helperText="A secure 4-digit code is recommended"
                  error={newCode.trim().length > 0 && newCode.trim().length < 4}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Security color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flex: 1, minWidth: { xs: "100%", sm: "250px" } }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreate}
                  disabled={newCode.trim().length < 4}
                  startIcon={<Save />}
                  sx={{
                    height: 56,
                    flex: 1,
                    minWidth: { xs: "100%", sm: "auto" },
                    mb: { xs: 2, sm: 0 },
                  }}
                >
                  Create Code
                </Button>
              </Box>
            )}
          </Box>
        </Fade>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          aria-labelledby="delete-confirmation-dialog"
        >
          <DialogTitle id="delete-confirmation-dialog">
            Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the admin code? This action cannot
              be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteConfirmOpen(false)}
              color="inherit"
              sx={{ mb: { xs: 2, sm: 0 } }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              color="error"
              variant="contained"
              startIcon={<Delete />}
              sx={{ mb: { xs: 2, sm: 0 } }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}

AdminCode.propTypes = {
  adminCode: PropTypes.string,
  showCode: PropTypes.bool,
  isEditing: PropTypes.bool,
  newCode: PropTypes.string,
  deleteConfirmOpen: PropTypes.bool,
  snackbarOpen: PropTypes.bool,
  snackbarMessage: PropTypes.string,
  snackbarSeverity: PropTypes.oneOf(["success", "error", "warning", "info"]),
  loading: PropTypes.bool,
};

export default AdminCode;
