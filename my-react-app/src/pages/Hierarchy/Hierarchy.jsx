import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  Card,
  Typography,
  IconButton,
  CircularProgress,
  TextField,
  Button,
  LinearProgress,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import YouTubeIcon from "@mui/icons-material/YouTube";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { ArrowBack } from "@mui/icons-material";
import axios from "axios";
import jwt_decode from "jwt-decode";
import AdditionalInfoDialog from "../Authentication/AdditionalInfoDialog";
import { Snackbar, Alert } from "@mui/material";
import { COLORS, STYLES } from "./HierarchyStyles";
import { processData } from "./processData";
import DisableCopy from "../../Disable/DisableCopy";

// const flattenEntities = (entities) => {
//   const result = {};
//   entities.forEach((entity) => {
//     result[entity.id] = entity;
//     if (entity.children) {
//       Object.assign(result, flattenEntities(entity.children)); // Merge child entities
//     }
//   });
//   return result;
// };
const Hierarchy = () => {
  const [data, setData] = useState([]);
  const [path, setPath] = useState([]);
  const [currentLevel, setCurrentLevel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [examData, setExamData] = useState([]); // Store fetched exam data
  const [testCompleted, setTestCompleted] = useState({}); // Track completion for each test
  const [userData, setUserData] = useState(null);
  const [openDialog, setOpenDialog] = useState(false); // To control the dialog visibility
  const [additionalInfo, setAdditionalInfo] = useState({
    institutionType: "",
    class: "",
    institutionName: "",
    degreeName: "",
    passingYear: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userCreatedAt, setUserCreatedAt] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [institutionType, setInstitutionType] = useState(null);

  const BASE_URL = "http://82.112.236.241:5000";

  useEffect(() => {
    const fetchData = async (retries = 3) => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/api/entities`);
        setData(response.data);
        setCurrentLevel(response.data);
      } catch (error) {
        if (retries > 0) {
          setTimeout(() => fetchData(retries - 1), 1000);
        } else {
          let errorMessage = "Failed to fetch data. Please try again later.";
          if (error.response) {
            switch (error.response.status) {
              case 404:
                errorMessage = "Data not found.";
                break;
              case 500:
                errorMessage = "Server error. Please try again later.";
                break;
              default:
                errorMessage = "An unexpected error occurred.";
            }
          } else if (error.request) {
            errorMessage =
              "Network Error: Please check your internet connection.";
          }
          setSnackbarMessage(errorMessage);
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          setData([]);
          setCurrentLevel([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const handleToggleSearch = () => {
      setShowSearch((prev) => !prev);
    };
    window.addEventListener("toggleSearch", handleToggleSearch);
    return () => {
      window.removeEventListener("toggleSearch", handleToggleSearch);
    };
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredEntities = searchQuery
    ? currentLevel.filter((entity) =>
        entity.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentLevel;

  const handleBackClick = useCallback(() => {
    if (path.length > 0) {
      const updatedPath = path.slice(0, -1);
      setPath(updatedPath);

      if (updatedPath.length === 0) {
        setCurrentLevel(data);
      } else {
        const lastEntity = updatedPath[updatedPath.length - 1];
        setCurrentLevel(lastEntity.children || []);
      }
    }
  }, [path, data]);

  const navigateTo = (entity) => {
    setPath((prevPath) => [...prevPath, entity]);
    setCurrentLevel(entity.children);
  };

  const currentEntity = path.length > 0 ? path[path.length - 1] : null;

  useEffect(() => {
    if (
      currentEntity &&
      currentEntity.type === "topic" &&
      currentEntity.children
    ) {
      currentEntity.children.forEach((paper) => {
        fetchExamData(paper.name); // Treat paper.name as examId
      });
    }
  }, [currentEntity]);

  const fetchExamData = async (examId, retries = 3) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/exams/${examId}`);
      setExamData((prevData) => ({
        ...prevData,
        [examId]: response.data,
      }));
    } catch (error) {
      if (retries > 0) {
        setTimeout(() => fetchExamData(examId, retries - 1), 1000);
      } else {
        let errorMessage = "Error fetching exam data. Please try again later.";
        if (error.response) {
          switch (error.response.status) {
            case 404:
              errorMessage = "Exam data not found.";
              break;
            case 500:
              errorMessage = "Server error. Please try again later.";
              break;
            default:
              errorMessage = "An unexpected error occurred.";
          }
        } else if (error.request) {
          errorMessage =
            "Network Error: Please check your internet connection.";
        }
        setSnackbarMessage(errorMessage);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedTests = async (retries = 3) => {
    setLoading(true);
    const jwtToken = localStorage.getItem("jwtToken");

    if (!jwtToken) {
      console.error("User is not logged in.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${BASE_URL}/api/tests/getCompletedTests`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`, // Include JWT in headers
          },
        }
      );

      if (response.status === 200) {
        const completedTestsMap = response.data.completedTests.reduce(
          (acc, testName) => {
            acc[testName] = true;
            return acc;
          },
          {}
        );
        setTestCompleted(completedTestsMap);
      } else {
        console.error(
          "Failed to fetch completed tests:",
          response.data.message
        );
      }
    } catch (error) {
      if (retries > 0) {
        setTimeout(() => fetchCompletedTests(retries - 1), 1000);
      } else {
        let errorMessage =
          "Error fetching completed tests. Please try again later.";
        if (error.response) {
          switch (error.response.status) {
            case 404:
              errorMessage = "Completed tests data not found.";
              break;
            case 500:
              errorMessage = "Server error. Please try again later.";
              break;
            default:
              errorMessage = "An unexpected error occurred.";
          }
        } else if (error.request) {
          errorMessage =
            "Network Error: Please check your internet connection.";
        }
        setSnackbarMessage(errorMessage);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedTests();
  }, []);

  const fetchUserData = async (retries = 3) => {
    setLoading(true);
    const jwtToken = localStorage.getItem("jwtToken");
    if (!jwtToken) {
      setLoading(false);
      return;
    }
    try {
      const decodedToken = jwt_decode(jwtToken);
      const userId = decodedToken.userId;
      if (!userId) {
        setLoading(false);
        return;
      }
      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!response.ok) {
        setLoading(false);
        return;
      }
      const data = await response.json();
      setUserCreatedAt(data.createdAt);
      setInstitutionType(data.institutionType);
    } catch (error) {
      if (retries > 0) {
        setTimeout(() => fetchUserData(retries - 1), 1000);
      } else {
        let errorMessage = "Error fetching user data. Please try again later.";
        if (error.response) {
          switch (error.response.status) {
            case 404:
              errorMessage = "User data not found.";
              break;
            case 500:
              errorMessage = "Server error. Please try again later.";
              break;
            default:
              errorMessage = "An unexpected error occurred.";
          }
        } else if (error.request) {
          errorMessage =
            "Network Error: Please check your internet connection.";
        }
        setSnackbarMessage(errorMessage);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const isSixDaysPassed = (createdAt) => {
    if (!createdAt) return false;
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const diffTime = currentDate - createdDate;
    const diffDays = diffTime / (1000 * 3600 * 24);
    return diffDays >= 6;
  };

  const handleStartTestClick = (examId, testName) => {
    if (
      userCreatedAt &&
      institutionType === null &&
      isSixDaysPassed(userCreatedAt)
    ) {
      setIsDialogOpen(true);
    } else {
      navigateToTestPage(examId, testName);
    }
  };

  const handleAddInfoSubmit = async () => {
    setLoading(true);
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        setSnackbarMessage("You need to log in to update information.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }
      const decodedToken = jwt_decode(jwtToken);
      const { userId } = decodedToken;
      const updatedAdditionalInfo = {
        ...additionalInfo,
        userId: userId,
      };

      const response = await fetch(`${BASE_URL}/users/add-info`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(updatedAdditionalInfo),
      });

      if (!response.ok) {
        throw new Error("Failed to update additional info.");
      }

      const data = await response.json();
      setUserData((prev) => ({ ...prev, ...data }));
      setIsDialogOpen(false);
      // Show success message
      setSnackbarMessage("Additional information updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      window.location.reload();
    } catch (err) {
      if (err.response) {
        setSnackbarMessage(
          "Failed to update additional information. Please try again."
        );
      } else if (err.request) {
        setSnackbarMessage(
          "Network Error: Please check your internet connection."
        );
      } else {
        setSnackbarMessage(
          "An unexpected error occurred. Please try again later."
        );
      }
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const navigateToTestPage = (examId, testName) => {
    const jwtToken = localStorage.getItem("jwtToken");

    if (jwtToken) {
      try {
        const decodedToken = jwt_decode(jwtToken);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          alert("Session expired. Please log in again.");
          window.open("/login", "_blank");
          return;
        }
        const url = `/test?examId=${examId}&testName=${testName}`;
        const testWindow = window.open(url, "_blank");
        const handleTestCompletion = async (event) => {
          if (event.origin === window.location.origin) {
            if (event.data.type === "TEST_COMPLETED") {
              const { submittedTest } = event.data;
              setTestCompleted((prevState) => ({
                ...prevState,
                [testName]: true,
              }));
              // Show success message
              setSnackbarMessage("Test completed successfully!");
              setSnackbarSeverity("success");
              setSnackbarOpen(true);
              try {
                const response = await fetch(
                  `${BASE_URL}/api/tests/markCompleted`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${jwtToken}`,
                    },
                    body: JSON.stringify({
                      email: decodedToken.email,
                      testName,
                      submittedTest,
                    }),
                  }
                ); 
                
                if (!response.ok) {
                  throw new Error("Failed to mark test as completed.");
                }

              } catch (error) {
                console.error("Error during API call:", error);
              }
            }
          }
        };
        window.addEventListener("message", handleTestCompletion);
        const interval = setInterval(() => {
          if (testWindow.closed) {
            clearInterval(interval);
            window.removeEventListener("message", handleTestCompletion);
          }
        }, 1000);
      } catch (error) {
        console.error("Error decoding token:", error);
        alert("You are not logged in. Please log in to continue.");
        window.open("/login", "_blank");
      }
    } else {
      const signupWindow = window.open("/signup", "_blank");
      signupWindow.examId = examId;
      signupWindow.testName = testName;
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (
        event.origin === window.location.origin &&
        event.data === "AUTH_SUCCESS"
      ) {
        window.location.reload();
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleVisibilityClick = async (examId, testName) => {
    setLoading(true);
    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        const decodedToken = jwt_decode(token);
        const userEmail = decodedToken.email;
        const userResponse = await fetch(
          `${BASE_URL}/users?email=${userEmail}&examId=${examId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!userResponse.ok) {
          throw new Error(
            `User Data Fetch Error! Status: ${userResponse.status}`
          );
        }
        const userData = await userResponse.json();
        const examResponse = await fetch(`${BASE_URL}/api/exams/${examId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!examResponse.ok) {
          throw new Error(
            `Exam Data Fetch Error! Status: ${examResponse.status}`
          );
        }
        const examData = await examResponse.json();
        const combinedData = {
          user: userData,
          exam: examData,
          testName: testName, // Add testName to combinedData
        };
        setUserData(combinedData);
        setOpenDialog(true);
      } catch (error) {
        if (error.response) {
          setSnackbarMessage("Error fetching data. Please try again later.");
        } else if (error.request) {
          setSnackbarMessage(
            "Network Error: Please check your internet connection."
          );
        } else {
          setSnackbarMessage(
            "An unexpected error occurred. Please try again later."
          );
        }
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        console.error("Error fetching data:", error);
        if (error instanceof SyntaxError) {
          alert(
            "The server response is not valid JSON. Please check the server."
          );
        }
      } finally {
        setLoading(false);
      }
    } else {
      console.log("Token not found in localStorage");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 3 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ marginTop: "15px" }}>
          Loading...
        </Typography>
      </Box>
    );
  }
  if (!data.length) {
    return (
      <Typography
        variant="body2"
        sx={{
          marginTop: "20px",
          color: COLORS.grey,
          fontSize: { xs: "14px", sm: "16px", md: "18px" }, // Responsive font size
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        ⏳ Server is busy. Please come back later.
      </Typography>
    );
  }

  return (
    <>
    <DisableCopy/>
    <Grid
      sx={{
        maxWidth: "lg",
        margin: "0 auto",
      }}
    >
      <Box
        sx={{
          padding: "30px",
          height: "auto",
          position: "relative",
        }}
      >
        {path.length > 0 && (
          <IconButton
            onClick={handleBackClick}
            disabled={path.length === 0}
            sx={STYLES.iconButton}
            aria-label="Go back to the previous level"
          >
            <ArrowBack style={{ fontSize: "1.8rem" }} />
          </IconButton>
        )}
        {path.length === 0 && (
          <Typography
            variant="h1"
            align="center"
            sx={{
              mb: 3,
              background: `linear-gradient(90deg,rgb(240, 82, 161) 30%, #FFD700 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              padding: "10px",
              borderRadius: "8px",
              fontWeight: "500",
              fontSize: {
                xs: "1.6rem", // For extra small screens (phones)
                sm: "1.8rem", // For small screens (tablets)
                md: "2.2rem", // For medium screens (laptops)
              },
            }}
          >
            Welcome to <span style={{ fontWeight: "550" }}>FREEPARE </span> –
            Your Gateway to Free Exam Preparation
          </Typography>
        )}
        {currentEntity && (
          <Typography
            variant="h2"
            sx={{
              fontWeight: "500",
              background: `linear-gradient(90deg,rgb(240, 82, 161) 30%, #FFD700 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 4,
              textAlign: "center",
              padding: "10px",
              borderRadius: "8px",
              fontSize: {
                xs: "1.6rem",
                sm: "1.8rem",
                md: "2.2rem",
              },
            }}
          >
            {currentEntity.name}
          </Typography>
        )}

        {showSearch && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <TextField
              label="Search"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={STYLES.searchBox}
              InputLabelProps={{
                shrink: true,
              }}
              aria-label="Search"
              placeholder="Search here..."
            />
          </Box>
        )}

        {searchQuery && filteredEntities.length === 0 && (
          <Typography
            variant="h6"
            sx={{ color: COLORS.grey, textAlign: "center" }}
          >
            No results found for "{searchQuery}".
          </Typography>
        )}

        {currentEntity &&
          currentEntity.type === "topic" &&
          currentEntity.children && (
            <Box sx={{ mt: 4 }}>
              {currentEntity.children.map((paper, index) => (
                <Box
                  key={paper.id}
                  sx={{ mb: 2, display: "flex", alignItems: "center" }}
                >
                  {/* Serial Number */}
                  <Box sx={STYLES.serialNumberBox}>
                    <Typography variant="h3" sx={STYLES.serialNumberTypography}>
                      {index + 1}.
                    </Typography>
                  </Box>

                  {examData[paper.name] && (
                    <Card
                      sx={{
                        width: "100%", // Make the card full width
                        padding: 2,
                        boxShadow: 2,
                        borderRadius: 2,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: testCompleted[paper.testName]
                          ? COLORS.green
                          : COLORS.white, // Green background for completed

                        "@media (max-width:600px)": {
                          flexDirection: "column",
                          gap: 1,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        {/* Test Name */}
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: "500",
                            color: testCompleted[paper.testName]
                              ? COLORS.white
                              : COLORS.black, // Text color changes
                            overflow: "hidden", // Required for ellipsis
                            textOverflow: "ellipsis", // Adds the ellipsis when text overflows
                            whiteSpace: "nowrap", // Prevents wrapping of text
                            textTransform: "capitalize",
                            fontSize: {
                              xs: "0.875rem",
                              sm: "1rem",
                              md: "1.25rem",
                            }, // Responsive font sizes

                            // Ensure consistent behavior
                            maxWidth: "50ch", // Limit text to around 50 characters on larger screens
                            "@media (max-width:600px)": {
                              maxWidth: "30ch", // Limit text to 30 characters on smaller screens
                            },
                          }}
                        >
                          {paper.testName}
                        </Typography>
                      </Box>

                      {!testCompleted[paper.testName] ? (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() =>
                            handleStartTestClick(
                              examData[paper.name].examId,
                              paper.testName
                            )
                          }
                          disabled={testCompleted[paper.testName]} // Disable button for completed tests
                          sx={STYLES.button}
                        >
                          Start Test
                        </Button>
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: { xs: 1, sm: 2 },
                            flexDirection: { xs: "column", sm: "row" },
                          }}
                        >
                          <Box>
                            {paper.videoLink && (
                              <Button
                                variant="contained"
                                component="a"
                                href={paper.videoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={
                                  <YouTubeIcon sx={{ color: COLORS.red }} />
                                }
                                sx={STYLES.solutionButton}
                              >
                                Solution
                              </Button>
                            )}
                          </Box>
                          <Button
                            variant="contained"
                            onClick={() => handleVisibilityClick(paper.name, paper.testName)}
                            startIcon={
                              <VisibilityIcon
                                sx={{
                                  color: "inherit",
                                }}
                              />
                            }
                            sx={STYLES.previewButton}
                          >
                            PREVIEW
                          </Button>
                        </Box>
                      )}
                      <Dialog
                        open={openDialog}
                        onClose={() => setOpenDialog(false)}
                        BackdropProps={{
                          style: {
                            backgroundColor: "rgba(28, 28, 28, 0.4)", // Backdrop ka color aur transparency
                          },
                        }}
                        maxWidth="lg"
                      >
                        <DialogTitle sx={STYLES.dialogTitle}>
                          Submitted Response
                        </DialogTitle>
                        <DialogContent sx={STYLES.dialogContent}>
                          {loading ? (
                            <CircularProgress size={24} />
                          ) : (
                            <>
                              {/* Display Test Name */}
                              <Typography
                                sx={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  fontWeight: 500,
                                  color: COLORS.primary,
                                  fontSize: "1.2rem",
                                  marginBottom: "1rem",
                                  textAlign: "center",
                                }}
                              >
                                {userData?.testName || "Test name not available"}
                              </Typography>
                              <Typography
                                sx={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  fontWeight: 500,
                                  color: COLORS.primary,
                                  fontSize: "1.2rem",
                                  marginBottom: "1rem",
                                }}
                              >
                               Your Total Score: {userData?.user?.totalScore || "Exam name not available"}
                              </Typography>
                              {/* Exam Questions Section */}
                              {userData?.exam?.questions?.length > 0 ? (
                                <Grid container spacing={2}>
                                  {userData.exam.questions.map(
                                    (question, index) => {
                                      const questionKey =
                                        question.questionNo.replace("QQ", ""); // This removes the "QQ" part from questionNo
                                      const userAnswer =
                                        userData.user.answers[questionKey]; // Use the generated questionKey to fetch the user answer

                                      return (
                                        <Grid item xs={12} key={index}>
                                          <Card
                                            sx={{
                                              padding: "1.5rem",
                                              marginBottom: "1.5rem",
                                              borderRadius: "12px",
                                              border: "1px solid #ddd",
                                              backgroundColor: COLORS.white,
                                              boxShadow: 3,

                                              transition: "all 0.3s ease",
                                            }}
                                          >
                                            <Typography
                                              variant="h3"
                                              sx={{
                                                fontWeight: "500",
                                                color: COLORS.black,
                                                marginBottom: "1rem",
                                                display: "flex",
                                              }}
                                            >
                                              <strong>
                                                {question.questionNo}:
                                              </strong>
                                              {question.questionText && (
                                                <span
                                                  style={{
                                                    marginBottom:
                                                      question.questionImage
                                                        ? "4rem"
                                                        : "0", // Conditional margin
                                                    flexGrow: 1,
                                                    marginLeft: "1rem",
                                                    marginRight: "1rem",
                                                  }}
                                                  dangerouslySetInnerHTML={{
                                                    __html: processData(
                                                      question.questionText
                                                    ),
                                                  }}
                                                />
                                              )}
                                            </Typography>

                                            {/* Conditionally render the question image if available */}
                                            {question.questionImage && (
                                              <Box
                                                sx={{ marginBottom: "1rem" }}
                                              >
                                                <img
                                                  src={question.questionImage}
                                                  alt={`Question ${question.questionNo}`}
                                                  style={{
                                                    width: "80%",
                                                    maxHeight: "300px",
                                                    objectFit: "contain",
                                                    display: "block",
                                                    margin: "0 40px",
                                                    marginTop: "-40px",
                                                  }}
                                                />
                                              </Box>
                                            )}

                                            {/* Render the options */}
                                            <FormControl
                                              component="fieldset"
                                              sx={{ marginTop: "1rem" }}
                                            >
                                              <RadioGroup>
                                                {["A", "B", "C", "D"].map(
                                                  (option, i) => {
                                                    const optionKey = `option${option}`; // e.g., optionA, optionB, etc.
                                                    const isSelected =
                                                      userAnswer === option; // Check if this option matches the user's answer
                                                    const isDisabled =
                                                      userAnswer ? true : false; // Disable all options once selected

                                                    return (
                                                      <FormControlLabel
                                                        key={i}
                                                        value={option}
                                                        control={
                                                          <Radio
                                                            disabled={
                                                              isDisabled
                                                            } // Disable all options once selected
                                                            checked={isSelected} // Mark the selected option as checked
                                                          />
                                                        }
                                                        label={
                                                          <Box
                                                            sx={{
                                                              display: "flex",
                                                              alignItems:
                                                                "center",
                                                              justifyContent:
                                                                "space-between",
                                                              width: "100%",
                                                              padding: "10px 0",
                                                            }}
                                                          >
                                                            <Typography
                                                              sx={{
                                                                marginRight:
                                                                  "10px",
                                                                marginLeft:
                                                                  "0px",
                                                                flexGrow: 1,
                                                                fontWeight:
                                                                  "600",
                                                              }}
                                                            >
                                                              {option}:
                                                            </Typography>

                                                            <Typography
                                                              sx={{
                                                                color:
                                                                  COLORS.darkGrey,
                                                              }}
                                                            >
                                                              {
                                                                question[
                                                                  optionKey
                                                                ]
                                                              }{" "}
                                                              {/* Display the option text */}
                                                            </Typography>

                                                            {/* Conditionally render the option image if available */}
                                                            {question[
                                                              `option${option}Image`
                                                            ] && (
                                                              <Box>
                                                                <img
                                                                  src={
                                                                    question[
                                                                      `option${option}Image`
                                                                    ]
                                                                  }
                                                                  alt={`Option ${option}`}
                                                                  onLoad={(
                                                                    e
                                                                  ) => {
                                                                    const img =
                                                                      e.target;
                                                                    if (
                                                                      img.naturalWidth >
                                                                        50 ||
                                                                      img.naturalHeight >
                                                                        50
                                                                    ) {
                                                                      img.style.width = `${Math.max(
                                                                        img.naturalWidth,
                                                                        50
                                                                      )}px`;
                                                                    }
                                                                  }}
                                                                  style={{
                                                                    maxWidth:
                                                                      "80px", // Max size limit
                                                                    objectFit:
                                                                      "contain",
                                                                  }}
                                                                />
                                                              </Box>
                                                            )}
                                                          </Box>
                                                        }
                                                      />
                                                    );
                                                  }
                                                )}
                                              </RadioGroup>
                                            </FormControl>
                                            {question.correctAnswer && (
                                              <Typography
                                                sx={{
                                                  marginTop: "1rem",
                                                  color: COLORS.success,
                                                  fontStyle: "italic",
                                                }}
                                              >
                                                Correct Answer:{" "}
                                                <strong>
                                                  {question.correctAnswer}
                                                </strong>
                                              </Typography>
                                            )}

                                            {(question.explanation ||
                                              question.explanationImage) && (
                                              <Box
                                                sx={{
                                                  marginTop: "1rem",
                                                  display: "flex",
                                                }}
                                              >
                                                <>
                                                  <Typography
                                                    sx={{
                                                      fontWeight: "600",
                                                      color: "grey",
                                                    }}
                                                  >
                                                    Explanation:
                                                  </Typography>
                                                  {question.explanation && (
                                                    <Typography
                                                      sx={{
                                                        fontStyle: "italic",
                                                        color: COLORS.darkGrey,
                                                        marginBottom: "0.5rem",
                                                        marginLeft: "0.5rem",
                                                      }}
                                                      dangerouslySetInnerHTML={{
                                                        __html: processData(
                                                          question.explanation
                                                        ),
                                                      }}
                                                    />
                                                  )}
                                                </>

                                                {question.explanationImage && (
                                                  <Box>
                                                    <img
                                                      src={
                                                        question.explanationImage
                                                      }
                                                      alt={`Explanation for ${question.questionNo}`}
                                                      style={{
                                                        width: "100%",
                                                        maxHeight: "300px",
                                                        objectFit: "contain",
                                                      }}
                                                    />
                                                  </Box>
                                                )}
                                              </Box>
                                            )}
                                          </Card>
                                        </Grid>
                                      );
                                    }
                                  )}
                                </Grid>
                              ) : (
                                <Typography
                                  variant="body2"
                                  sx={{ color: COLORS.darkGrey }}
                                >
                                  No questions available for this exam.
                                </Typography>
                              )}
                            </>
                          )}
                        </DialogContent>
                        <DialogActions>
                          <Button
                            onClick={() => setOpenDialog(false)}
                            color="primary"
                          >
                            Close
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </Card>
                  )}
                </Box>
              ))}
              {/* Additional Info Dialog */}
              <AdditionalInfoDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                additionalInfo={additionalInfo}
                handleAdditionalInfoChange={(e) =>
                  setAdditionalInfo({
                    ...additionalInfo,
                    [e.target.name]: e.target.value,
                  })
                }
                handleAddInfoSubmit={handleAddInfoSubmit}
              />
            </Box>
          )}

        {/* Render cards only when the current entity is not a topic */}
        {!(currentEntity && currentEntity.type === "topic") && (
          <Grid container spacing={3}>
            {filteredEntities.map((entity) => (
              <Grid item key={entity.id} xs={12} sm={6} md={6} lg={4}>
                <Card
                  sx={STYLES.card}
                  onClick={() => navigateTo(entity)}
                  aria-label={`Navigate to ${entity.name}`}
                >
                  <Typography
                    variant="h3"
                    sx={STYLES.typography}
                    onClick={() => navigateTo(entity)}
                  >
                    {entity.name}
                  </Typography>

                  {!(currentEntity && currentEntity.type === "subject") &&
                    !(
                      currentEntity &&
                      currentEntity.children?.some(
                        (child) => child.type === "topic"
                      )
                    ) &&
                    entity.children && (
                      <Box
                        sx={{
                          mt:
                            entity.children.length === 1
                              ? "-75px"
                              : entity.children.length === 2
                              ? "-50px"
                              : entity.children.length === 3
                              ? "-20px"
                              : "10px",
                        }}
                      >
                        {entity.children.slice(0, 4).map((child) => (
                          <Typography
                            key={child.id}
                            variant="h4"
                            sx={{
                              color: COLORS.darkGrey,
                              mb: 1,
                              fontWeight: "500",
                            }}
                          >
                            • {child.name}
                          </Typography>
                        ))}
                      </Box>
                    )}

                  {/* Only show points under the Exam and subjects */}
                  {!(currentEntity && currentEntity.type === "subject") &&
                    entity.children && (
                      <Box sx={{ mt: 2 }}>
                        {!(currentEntity && currentEntity.type === "exam") && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end", // Align to the right
                            }}
                          >
                            <Typography
                              variant="button"
                              component="span"
                              sx={STYLES.viewMoreTypography}
                              onClick={() => navigateTo(entity)}
                            >
                              ...View More
                            </Typography>
                          </Box>
                        )}
                        {/* totalTests */}
                        {!(currentEntity && currentEntity.type === "exam") &&
                          entity.totalTests && (
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                marginTop: "-30px",
                              }}
                            >
                              <Typography
                                variant="body1"
                                sx={{
                                  color: COLORS.black,
                                  fontWeight: 600,
                                  whiteSpace: "nowrap", // Prevent text from wrapping to the next line
                                  overflow: "hidden", // Hide overflowed text
                                  textOverflow: "ellipsis", // Show ellipsis when text overflows
                                  width: "100%", // Default width to take full space
                                  // Apply 40px width and ellipsis on small screens only
                                  "@media (max-width: 820px)": {
                                    width: "180px", // Set the width to 40px for small screens
                                  },
                                  "@media (max-width: 770px)": {
                                    width: "160px", // Set the width to 40px for small screens
                                  },
                                  "@media (max-width: 700px)": {
                                    width: "140px", // Set the width to 40px for small screens
                                  },
                                }}
                              >
                                {entity.totalTests}
                              </Typography>
                            </Box>
                          )}
                        {currentEntity && currentEntity.type === "exam" && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end", // Align to the right
                              marginTop: "-30px",
                            }}
                          >
                            <Typography
                              variant="button"
                              component="span"
                              sx={{
                                textTransform: "none",
                                fontWeight: "600",
                                borderRadius: "8px",
                                textAlign: "right",
                                color: COLORS.primary,
                                cursor: "pointer",
                              }}
                              onClick={() => navigateTo(entity)}
                            >
                              ...View More
                            </Typography>
                          </Box>
                        )}

                        <Box>
                          {currentEntity && currentEntity.type === "exam" && (
                            <Box sx={{ mt: 2 }}>
                              {/* Out of line and Percentage inline */}
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  mb: 1, // Space between the line and progress bar
                                }}
                              >
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <Typography
                                    variant="h4"
                                    sx={STYLES.completedTestsTypography}
                                  >
                                    {/* Total completed tests */}
                                    {entity.children
                                      ? entity.children.reduce(
                                          (completed, subject) =>
                                            completed +
                                            (subject.children
                                              ? subject.children.filter(
                                                  (test) =>
                                                    testCompleted[test.testName]
                                                ).length
                                              : 0),
                                          0
                                        )
                                      : "0"}
                                  </Typography>
                                  <Typography
                                    variant="h4"
                                    sx={{
                                      color: COLORS.black,
                                      fontWeight: "bold",
                                      mx: 1,
                                    }} // margin between the text
                                  >
                                    out of
                                  </Typography>
                                  <Typography
                                    variant="h4"
                                    sx={STYLES.totalTestsTypography}
                                  >
                                    {/* Total tests */}
                                    {entity.children
                                      ? entity.children.reduce(
                                          (total, subject) =>
                                            total +
                                            (subject.children
                                              ? subject.children.length
                                              : 0),
                                          0
                                        )
                                      : "0"}{" "}
                                    Tests
                                  </Typography>
                                </Box>

                                <Typography
                                  variant="h5"
                                  sx={STYLES.percentageTypography}
                                >
                                  {/* Calculate percentage */}
                                  {entity.children
                                    ? Math.round(
                                        (entity.children.reduce(
                                          (completed, subject) =>
                                            completed +
                                            (subject.children
                                              ? subject.children.filter(
                                                  (test) =>
                                                    testCompleted[test.testName]
                                                ).length
                                              : 0),
                                        0
                                      ) /
                                        entity.children.reduce(
                                          (total, subject) =>
                                            total +
                                            (subject.children
                                              ? subject.children.length
                                              : 0),
                                          0
                                        )) *
                                      100
                                    )
                                    : 0}
                                  %
                                </Typography>
                              </Box>

                              {/* Progress Bar */}
                              <LinearProgress
                                variant="determinate"
                                value={
                                  entity.children
                                    ? (entity.children.reduce(
                                        (completed, subject) =>
                                          completed +
                                          (subject.children
                                            ? subject.children.filter(
                                                (test) =>
                                                  testCompleted[test.testName]
                                              ).length
                                            : 0),
                                        0
                                      ) /
                                        entity.children.reduce(
                                          (total, subject) =>
                                            total +
                                            (subject.children
                                              ? subject.children.length
                                              : 0),
                                          0
                                        )) *
                                      100
                                    : 0
                                }
                                sx={STYLES.linearProgress}
                              />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    )}

                  {/* description for topics */}
                  {currentEntity &&
                    (currentEntity.type === "subject" ||
                      currentEntity.type === "exam") &&
                    entity.description && (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="body1"
                          sx={STYLES.descriptionTypography}
                        >
                          {entity.description}
                        </Typography>
                      </Box>
                    )}

                  {/* Completed and Total Tests for topics */}
                  {currentEntity && currentEntity.type === "subject" && (
                    <Box sx={{ mt: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          // Adjust gap as needed
                          mb: 1, // Margin for spacing between the inline elements and progress bar
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            variant="h4"
                            sx={STYLES.completedTestsTypography}
                          >
                            {entity.children
                              ? entity.children.filter(
                                  (paper) =>
                                    testCompleted[paper.testName] === true
                                ).length
                              : 0}
                          </Typography>{" "}
                          out of{" "}
                          <Typography
                            variant="h4"
                            sx={STYLES.totalTestsTypography}
                          >
                            {entity.children ? entity.children.length : "0"}{" "}
                            Tests
                          </Typography>
                        </Box>

                        <Typography
                          variant="h5"
                          sx={STYLES.percentageTypography}
                        >
                          {/* Percentage */}
                          {entity.children
                            ? `${Math.round(
                                (entity.children.filter(
                                  (paper) =>
                                    testCompleted[paper.testName] === true
                                ).length /
                                  entity.children.length) *
                                  100
                              )}%`
                            : "0%"}
                        </Typography>
                      </Box>

                      {/* Progress Bar */}
                      <LinearProgress
                        variant="determinate"
                        value={
                          entity.children
                            ? (entity.children.filter(
                                (paper) =>
                                  testCompleted[paper.testName] === true
                              ).length /
                                entity.children.length) *
                              100
                            : 0
                        }
                        sx={STYLES.linearProgress}
                      />
                    </Box>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000} // Auto-hide after 6 seconds
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
      </Box>
    </Grid>
    </>
  );
};

export default Hierarchy;
