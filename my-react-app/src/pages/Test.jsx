import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Typography,
  CircularProgress,
  Box,
  Alert,
  Card,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Button,
  Grid,
  Snackbar,
} from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"; // Pie chart
import Navbar from "../components/Navbar";
import SessionExpireDialog from "../SessionExpireCheck/SessionExpireDialog";
import DisableCopy from "../Disable/DisableCopy";

const useFetchExamData = (examId) => {
  const [examData, setExamData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (examId) {
      setLoading(true);
      fetch(`http://82.112.236.241:5000/api/exams/${examId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Server Error: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          setExamData(data);
        })
        .catch((err) => {
          setError(
            err.message.includes("NetworkError")
              ? "Network error. Please try again."
              : err.message
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [examId]);
  

  return { examData, error, loading };
};
const processData = (examData) => {
  // Convert newlines to <br /> tags
  examData = examData.replace(/\\n/g, "<br />");

  // Convert bold markdown (**) to <b> tag
  examData = examData.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

    // Convert italic markdown ($text$) to <i> tag
    examData = examData.replace(/\$(.*?)\$/g, "<i>$1</i>");

  // Convert tilde markdown (~text~) to <u> tag for underline
  examData = examData.replace(/~(.*?)~/g, "<u>$1</u>");

  return examData;
};

const TestPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const examId = queryParams.get("examId");
  const testName = queryParams.get("testName");
  const { examData, error, loading } = useFetchExamData(examId);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [unattemptedAnswers, setUnattemptedAnswers] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [processedExamData, setProcessedExamData] = useState(null);

  useEffect(() => {
    if (examData && selectedAnswers) {
      let correct = 0;
      let wrong = 0;
      let unattempted = 0;

      examData.questions.forEach((question) => {
        const userAnswer = selectedAnswers[question.questionNo];
        if (userAnswer === undefined) {
          unattempted += 1;
        } else if (userAnswer === question.correctAnswer) {
          correct += 1;
        } else {
          wrong += 1;
        }
      });

      setCorrectAnswers(correct);
      setWrongAnswers(wrong);
      setUnattemptedAnswers(unattempted); // Ensure unattempted is updated
    }
  }, [examData, selectedAnswers]);

  useEffect(() => {
    if (examData) {
      const processedData = {
        ...examData,
        questions: examData.questions.map((question) => ({
          ...question,
          questionText: processData(question.questionText),
          explanation: processData(question.explanation),
        })),
      };
      setProcessedExamData(processedData);
    }
  }, [examData]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleAnswerChange = (questionNo, selectedOption) => {
    setSelectedAnswers((prevAnswers) => {
      if (prevAnswers[questionNo] === selectedOption) {
        const { [questionNo]: _, ...rest } = prevAnswers;
        return rest;
      }
      return {
        ...prevAnswers,
        [questionNo]: selectedOption,
      };
    });
  };

  const handleSubmit = () => {
    const submittedTest = { answers: selectedAnswers, examId, testName };
    window.opener.postMessage(
      { type: "TEST_COMPLETED", submittedTest },
      window.location.origin
    );
    setIsSubmitted(true);
    // Scroll to the top of the page after submission
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scroll to the top
    });
  };

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarOpen(true);
    }
  }, [error]);

  // Pie chart data
  const pieData = [
    { name: "Correct", value: correctAnswers },
    { name: "Wrong", value: wrongAnswers },
    { name: "Unattempted", value: unattemptedAnswers },
  ];

  return (
    <>
    <DisableCopy/>
      <Navbar />
      <Box
        sx={{
          background: "#e3f2fd",
          minHeight: "100vh",
          overflowY: "auto",
          padding: 4,
        }}
      >
        {!examId && (
          <Alert
            severity="warning"
            sx={{
              marginBottom: "1rem",
              backgroundColor: "#fff3cd",
              color: "#856404",
            }}
          >
            No exam ID provided. Please navigate here correctly.
          </Alert>
        )}
        {loading && (
          <Box
            display="flex"
            justifyContent="center"
            sx={{ marginTop: "2rem" }}
          >
            <CircularProgress size={50} sx={{ color: "#1976d2" }} />
          </Box>
        )}

        {processedExamData && (
          <Box>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{ marginBottom: "1.5rem" }}
            >
              <Typography
                variant="h2"
                gutterBottom
                sx={{
                  fontWeight: "550",
                  color: "#066C98",
                  textTransform: "Capitalize",
                }}
              >
                {testName || "Freepare Test"}
              </Typography>
            </Box>
            {isSubmitted && (
              <>
                {/* Full Screen Results Box */}
                <Box
                  sx={{
                    padding: "1.5rem",
                    marginBottom: "1.5rem",
                    borderRadius: "12px",
                    border: "1px solid #ddd",
                    backgroundColor: "#ffffff",
                    boxShadow: 3,
                    transition: "all 0.3s ease",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Results Header */}
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: "600",
                        color: "#1976d2",
                        marginBottom: { xs: "1.5rem", sm: "0rem" },
                        width: { xs: "100%", sm: "auto" }, // Ensures the header is full width on small screens
                      }}
                    >
                      <strong>Test Result</strong>
                    </Typography>

                    {/* Results Summary (Inline layout with space between) */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: { xs: 1, sm: 2 },
                        width: { xs: "100%", sm: "45%" }, // Stack on small screens, inline on larger screens
                        flexDirection: { xs: "column", sm: "row" }, // Stack vertically on small screens
                        alignItems: { xs: "flex-start", sm: "center" }, // Align items to the left on small screens
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: "600", color: "#4caf50" }}
                      >
                        Correct Answers:{" "}
                        <span style={{ color: "#388e3c" }}>
                          {correctAnswers}
                        </span>
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: "600", color: "#f44336" }}
                      >
                        Wrong Answers:{" "}
                        <span style={{ color: "#d32f2f" }}>{wrongAnswers}</span>
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: "600", color: "#9e9e9e" }}
                      >
                        Unattempted Answers:{" "}
                        <span style={{ color: "#616161" }}>
                          {unattemptedAnswers}
                        </span>
                      </Typography>
                    </Box>
                  </Box>

                  {/* Pie Chart and Overall Score */}
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: "900px", // Limiting width for better control on large screens
                      margin: "0 auto", // Centering the box horizontally
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" }, // Column on small screens, row on larger screens
                      justifyContent: "space-between", // Space between the two items (pie chart and score)
                      alignItems: "center", // Centering both items
                    }}
                  >
                    {/* Pie Chart */}
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius="50%"
                            outerRadius="80%"
                            fill="#8884d8"
                            paddingAngle={5}
                          >
                            <Cell key="correct" fill="#4CAF50" />
                            <Cell key="wrong" fill="#F44336" />
                            <Cell key="unattempted" fill="#9E9E9E" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* Overall Score */}
                    <Box
                      sx={{
                        width: "100%",
                        textAlign: "center",
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: "700",
                          color: "#1976d2",
                          marginBottom: "1rem",
                          fontSize: { xs: "1.5rem", sm: "2rem" },
                        }}
                      >
                        Your Score: {correctAnswers}/
                        {correctAnswers + wrongAnswers + unattemptedAnswers}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </>
            )}

            {processedExamData.questions?.length > 0 ? (
              <Grid container spacing={2}>
                {processedExamData.questions.map((question, index) => {
                  const isOptionSelected =
                    selectedAnswers[question.questionNo] ===
                    question.correctAnswer;

                  return (
                    <Grid item xs={12} key={index}>
                      <Card
                        sx={{
                          padding: "1.5rem",
                          marginBottom: "1.5rem",
                          borderRadius: "12px",
                          border: "1px solid #ddd",
                          backgroundColor: "#ffffff",
                          boxShadow: 3,

                          transition: "all 0.3s ease",
                        }}
                      >
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: "500",
                            color: "#000",
                            display: "flex",
                            marginBottom: "1rem",
                          }}
                        >
                          <strong>{question.questionNo}: </strong>
                          {question.questionText && (
                            <span
                              dangerouslySetInnerHTML={{
                                __html: question.questionText,
                              }}
                              style={{
                                marginBottom: question.questionImage
                                  ? "4rem"
                                  : "0", // Conditional margin
                                flexGrow: 1,
                                marginLeft: "1rem",
                                marginRight: "1rem",
                                fontSize: "1.1rem",
                              }}
                            />
                          )}
                        </Typography>

                        {question.questionImage && (
                          <Box sx={{ marginBottom: "1rem" }}>
                            <img
                              src={question.questionImage}
                              alt={`Question ${question.questionNo}`}
                              style={{
                                width: "90%",
                                maxHeight: "400px",
                                objectFit: "contain",
                                display: "block",
                                margin: "0 40px",
                                marginTop: "-40px",
                              }}
                            />
                          </Box>
                        )}

                        <FormControl
                          component="fieldset"
                          sx={{ marginTop: "1rem" }}
                        >
                          <RadioGroup
                            value={selectedAnswers[question.questionNo] || ""}
                            onChange={(e) =>
                              handleAnswerChange(
                                question.questionNo,
                                e.target.value
                              )
                            }
                          >
                            {["A", "B", "C", "D"].map((option, i) => {
                              return (
                                <FormControlLabel
                                  key={i}
                                  value={option}
                                  control={<Radio />}
                                  label={
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        width: "100%",
                                        padding: "10px 0",
                                      }}
                                    >
                                      <Typography
                                        sx={{
                                          marginRight: "10px",
                                          marginLeft: "0px",
                                          flexGrow: 1,
                                          fontWeight: "600",
                                          color: isSubmitted
                                            ? selectedAnswers[
                                                question.questionNo
                                              ] === option
                                              ? option ===
                                                question.correctAnswer
                                                ? "green"
                                                : "red"
                                              : "inherit"
                                            : "inherit",
                                        }}
                                      >
                                        {option}:
                                      </Typography>

                                      <Typography
                                        sx={{
                                          color: isSubmitted
                                            ? selectedAnswers[
                                                question.questionNo
                                              ] === option
                                              ? option ===
                                                question.correctAnswer
                                                ? "green"
                                                : "red"
                                              : "inherit"
                                            : "inherit",
                                        }}
                                      >
                                        {question[`option${option}`]}
                                      </Typography>
                                      {question[`option${option}Image`] && (
                                        <img
                                          src={question[`option${option}Image`]}
                                          alt={`Option ${option}`}
                                          
                                          onLoad={(e) => {
                                            const img = e.target;
                                            if (img.naturalWidth > 50 || img.naturalHeight > 50) {
                                              img.style.width = `${Math.max(img.naturalWidth, 50)}px`;
                                              }
                                          }}
                                          style={{
                                            maxWidth: "100px", // Max size limit
                                            objectFit: "contain",
                                          }}
                                        />
                                      )}
                                    </Box>
                                  }
                                  sx={{
                                    cursor: "pointer",
                                    color: isSubmitted
                                      ? selectedAnswers[question.questionNo] ===
                                        option
                                        ? option === question.correctAnswer
                                          ? "green"
                                          : "red"
                                        : "inherit"
                                      : "inherit",
                                  }}
                                  disabled={isSubmitted}
                                />
                              );
                            })}
                          </RadioGroup>
                        </FormControl>

                        {isSubmitted && (
                          <>
                            <Typography
                              variant="body2"
                              sx={{
                                marginTop: "0.5rem",
                                color: "#1976d2",
                                fontWeight: "500",
                              }}
                            >
                              <strong>Correct Answer:</strong>{" "}
                              {question.correctAnswer}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                marginTop: "0.5rem",
                                color: "#555",
                                fontStyle: "italic",
                              }}
                            >
                              <strong>Explanation:</strong>{" "}
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: question.explanation,
                                }}
                              />
                              {question.explanationImage && (
                                <img
                                  src={question.explanationImage}
                                  alt={`Explanation ${question.questionNo}`}
                                  style={{
                                    width: "100%",
                                    maxHeight: "200px",
                                    objectFit: "contain",
                                    display: "block",
                                  }}
                                />
                              )}
                            </Typography>
                          </>
                        )}
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Typography variant="body2" sx={{ color: "#555" }}>
                No questions available for this exam.
              </Typography>
            )}

            {!isSubmitted && (
              <Box
                display="flex"
                justifyContent="center"
                sx={{ marginTop: "2rem" }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  sx={{
                    fontSize: "1rem",
                    padding: "0.75rem 2rem",
                    backgroundColor: "#066C98",
                    cursor: "pointer",
                  }}
                >
                  Submit
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="error"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <SessionExpireDialog />
    </>
  );
};

export default TestPage;
