import { useState, useCallback, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Snackbar,
  Alert,
  AlertTitle,
} from "@mui/material";
import {
  ArrowBack,
  Dashboard as DashboardIcon,
  Settings as PanelIcon,
  CloudUpload as UploadIcon,
  List as ExamListIcon,
  VpnKey as AdminCodeIcon,
} from "@mui/icons-material";
import Panel from "../Panel/Panel";
import Dashboard from "../Dashboard";
import Navbar from "../../components/Navbar";
import Upload from "../Upload";
import ExamList from "../ExamsList";
import AdminCode from "../Admin/AdminCode";
import axios from "axios";

axios.defaults.baseURL = "http://82.112.236.241:5000"; // Add your base URL here

const Admin = () => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [adminCode, setAdminCode] = useState("");
  const [isCodeCorrect, setIsCodeCorrect] = useState(false);
  const [openCodeDialog, setOpenCodeDialog] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const [serverAdminCode, setServerAdminCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAdminCode = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/adminCode");
        setServerAdminCode(response.data.adminCode);
        setSnackbarMessage("Admin panel fetched successfully.");
        setSnackbarSeverity("success");
      } catch (error) {
        console.error("Error fetching admin code:", error);
        setSnackbarMessage("Error fetching admin code.");
        setSnackbarSeverity("error");
      } finally {
        setLoading(false);
        setSnackbarOpen(true);
      }
    };

    fetchAdminCode();
  }, []);

  const handleCodeSubmit = useCallback(() => {
    if (adminCode === serverAdminCode) {
      setIsCodeCorrect(true);
      setAdminCode("");
      setOpenCodeDialog(false);
      setSnackbarMessage("Admin code correct.");
      setSnackbarSeverity("success");
    } else {
      setSnackbarMessage("Invalid Admin Code. Please try again.");
      setSnackbarSeverity("error");
    }
    setSnackbarOpen(true);
  }, [adminCode, serverAdminCode]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter") {
        handleCodeSubmit();
      }
    },
    [handleCodeSubmit]
  );

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  const renderContent = () => {
    if (!isCodeCorrect) return null;
    switch (selectedComponent) {
      case "Users Data":
        return <Dashboard />;
      case "Panel":
        return <Panel />;
      case "Upload":
        return <Upload />;
      case "Uploaded Tests":
        return <ExamList />;
      case "Admin Code":
        return <AdminCode />;
      default:
        return null;
    }
  };

  const cardData = [
    {
      title: "Uploaded Tests",
      description:
        "View, preview, edit, and delete uploaded tests with unique IDs.",
      icon: <DashboardIcon sx={{ color: "#D32F2F", fontSize: 44 }} />, // Dark Red
    },
    {
      title: "Panel",
      description:
        "Create, update, and delete entities with relationships in a tree structure.",
      icon: <PanelIcon sx={{ color: "#008B8B", fontSize: 44 }} />, // Dark Cyan
    },
    {
      title: "Upload",
      description:
        "Upload Excel files, preview data, generate IDs, and save to the database.",
      icon: <UploadIcon sx={{ color: "#D4A017", fontSize: 44 }} />, // Deep Gold
    },
    {
      title: "Users Data",
      description:
        "View and manage user details in a list format. Export as an Excel file.",
      icon: <ExamListIcon sx={{ color: "#0056B3", fontSize: 44 }} />, // Dark Blue
    },
    {
      title: "Admin Code",
      description:
        "Manage admin codes for secure access to the admin panel and features.",
      icon: <AdminCodeIcon sx={{ color: "#7B1FA2", fontSize: 44 }} />, // Dark Purple
    },
  ];
  
  

  return (
    <Box
      sx={{
        display: "flex",
        background: "linear-gradient(to bottom, #ffffff, #e3f2fd)",
        minHeight: "100vh",
        overflowY: "auto",
      }}
    >
      <Box sx={{ flexGrow: 1, width: "100%" }}>
        <Navbar />
        <Box sx={{ width: "100%", padding: 2 }}>
          <Dialog open={openCodeDialog}>
            <DialogTitle>Enter Admin Code</DialogTitle>
            <DialogContent>
              <TextField
                label="Admin Code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                onKeyDown={handleKeyDown}
                fullWidth
                autoFocus
                margin="normal"
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCodeSubmit}
                color="primary"
                variant="contained"
              >
                Submit
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
              <AlertTitle>
                {snackbarSeverity === "error" ? "Error" : "Success"}
              </AlertTitle>
              {snackbarMessage}
            </Alert>
          </Snackbar>

          {loading && (
            <Typography variant="h6" align="center" sx={{ mt: 2 }}>
              Loading...
            </Typography>
          )}

          {!selectedComponent && isCodeCorrect && !loading && (
            <Box sx={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
              <Typography
                variant="h1"
                align="center"
                sx={{
                  mb: 4,
                  background: "linear-gradient(90deg, #066C98, #2CACE3)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: "500",
                  fontSize: "2.5rem",
                }}
              >
                Admin
              </Typography>
              <Grid container spacing={3} justifyContent="center">
                {cardData.map(({ title, description, icon }, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      onClick={() => setSelectedComponent(title)}
                      sx={{
                        cursor: "pointer",
                        transition: "transform 0.3s",
                        "&:hover": { transform: "scale(1.05)" },
                        boxShadow: 3,
                        borderRadius: 2,
                        padding: "20px",
                      }}
                      aria-label={title}
                    >
                      <CardContent
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        {icon}
                        <Typography
                          variant="h2"
                          align="center"
                          sx={{
                            color: "#066C98",
                            fontWeight: "400",
                            fontSize: "1.6rem",
                            mt: 1,
                          }}
                        >
                          {title}
                        </Typography>
                        <Typography
                          variant="body2"
                          align="center"
                          sx={{
                            color: "grey",
                            fontWeight: "regular",
                            fontSize: "1rem",
                          }}
                        >
                          {description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {selectedComponent && !loading && (
            <Box sx={{ width: "100%", padding: 2 }}>
              <IconButton
                onClick={() => setSelectedComponent(null)}
                sx={{
                  position: "absolute",
                  top: 80,
                  left: 40,
                  backgroundColor: "white",
                  boxShadow: 3,
                  "&:hover": { boxShadow: 6 },
                }}
              >
                <ArrowBack />
              </IconButton>
              {renderContent()}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Admin;
