import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { green, red, orange } from "@mui/material/colors";

const generatePieSlice = (radius, startAngle, endAngle) => {
  const startX = radius + radius * Math.cos((startAngle * Math.PI) / 180);
  const startY = radius + radius * Math.sin((startAngle * Math.PI) / 180);
  const endX = radius + radius * Math.cos((endAngle * Math.PI) / 180);
  const endY = radius + radius * Math.sin((endAngle * Math.PI) / 180);

  return `M ${radius} ${radius} L ${startX} ${startY} A ${radius} ${radius} 0 ${
    endAngle - startAngle > 180 ? 1 : 0
  } 1 ${endX} ${endY} Z`;
};

const ResultsDialog = ({
  open,
  onClose,
  totalQuestions,
  correctAnswers,
  wrongAnswers,
  unattemptedAnswers,
  testName,
}) => {
  const correctPercentage = (correctAnswers / totalQuestions) * 100 || 0;
  const wrongPercentage = (wrongAnswers / totalQuestions) * 100 || 0;
  const unattemptedPercentage =
    (unattemptedAnswers / totalQuestions) * 100 || 0;

  const correctAngle = (correctPercentage / 100) * 360;
  const wrongAngle = (wrongPercentage / 100) * 360;
  const unattemptedAngle = (unattemptedPercentage / 100) * 360;

  const correctSlice = generatePieSlice(100, 0, correctAngle);
  const wrongSlice = generatePieSlice(100, correctAngle, correctAngle + wrongAngle);
  const unattemptedSlice = generatePieSlice(
    100,
    correctAngle + wrongAngle,
    360
  );

  const handleClose = () => {
    onClose();
    if (window.opener) {
      window.opener.postMessage("TEST_COMPLETED", window.location.origin);
      window.close();
    } else {
      window.history.back();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
  align="left"
  sx={{
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "primary.main",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingLeft: 3,
    "@media (max-width: 600px)": { // Apply styles for screens less than 600px wide
      fontSize: "1.2rem", // Smaller font size for mobile
      paddingLeft: 2, // Adjust padding for mobile
    },
  }}
>
  Test Result
</DialogTitle>

      
      <DialogContent>
      <Divider sx={{ height: 1, backgroundColor: "primary.main"
}} />
        <Box sx={{ padding: 2 }}>
  <Box sx={{ display: "flex", justifyContent: "space-between","@media (max-width: 600px)": { // Mobile view adjustments
    flexDirection: "column", // Stack items vertically on mobile
    alignItems: "center", // Center align items on mobile
    gap: 1, // Add gap between items
        }, }}>
    <Typography
      variant="h3"
      color="primary"
      sx={{
        paddingLeft: 3,
        textOverflow: "ellipsis",
        overflow: "hidden",
        whiteSpace: "nowrap",
        "@media (max-width: 600px)": { // Mobile view adjustments
          fontSize: "1.3rem", // Decrease font size on mobile
          paddingLeft: 1, // Adjust padding
          textAlign: "center", // Center align text on mobile
        },
      }}
    >
      {testName}
    </Typography>
    <Typography
      variant="h4"
      color="primary"
      sx={{
        paddingRight: 3,
        "@media (max-width: 600px)": { // Mobile view adjustments
          fontSize: "1.2rem", // Decrease font size on mobile
          paddingRight: 1, // Adjust padding
        },
      }}
    >
      Total Questions: {totalQuestions}
    </Typography>
  </Box>
  <Divider
    sx={{
      marginTop: 2,
      marginBottom: 2,
      height: 1,
      backgroundColor: "primary.main",
    }}
  />
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-evenly",
      alignItems: "center",
      marginBottom: 2,
      gap: 1,
      "@media (max-width: 600px)": {
        flexDirection: "column", // Stack items vertically on mobile
        alignItems: "center", // Center align icons and text
      },
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <CheckCircleOutlineIcon color="success" sx={{ fontSize: 35 }} />
      <Typography variant="h5" color="success.main">
        Correct: {correctAnswers} ({correctPercentage.toFixed(1)}%)
      </Typography>
    </Box>

    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <HighlightOffIcon color="error" sx={{ fontSize: 35 }} />
      <Typography variant="h5" color="error.main">
        Wrong: {wrongAnswers} ({wrongPercentage.toFixed(1)}%)
      </Typography>
    </Box>

    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <HelpOutlineIcon color="warning" sx={{ fontSize: 35 }} />
      <Typography variant="h5" color="warning.main">
        Unattempted: {unattemptedAnswers} (
        {unattemptedPercentage.toFixed(1)}%)
      </Typography>
    </Box>
  </Box>

  <Box
    sx={{
      marginTop: 3,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      "@media (max-width: 600px)": {
        flexDirection: "column-reverse", // Stack items vertically on mobile
        alignItems: "center", // Center align the pie chart and score
        gap: 4, // Add gap between items
      },
    }}
  >
    <svg width="200" height="200" viewBox="0 0 200 200">
      <circle
        cx="100"
        cy="100"
        r="90"
        fill="white"
        stroke="lightgray"
        strokeWidth="1"
      />
      <path d={correctSlice} fill={green[500]} />
      <path d={wrongSlice} fill={red[500]} />
      <path d={unattemptedSlice} fill={orange[500]} />
      <circle
        cx="100"
        cy="100"
        r="50"
        fill="white"
        stroke="lightgray"
        strokeWidth="1"
      />
      <circle
        cx="100"
        cy="100"
        r="90"
        fill="none"
        stroke="rgba(0, 0, 0, 0.1)"
        strokeWidth="10"
      />
    </svg>
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginLeft: 3,
        backgroundColor: "#fff",
        borderRadius: 2,
        padding: 5,
        boxShadow: 2,
        textAlign: "center",
        "@media (max-width: 600px)": {
          marginLeft: 0, // Remove margin on mobile
          padding: 3, // Reduce padding on mobile
          width: "80%", // Make it more responsive
        },
      }}
    >
      <Typography
        variant="h4"
        color="primary"
        sx={{
          fontWeight: "600",
          textTransform: "uppercase",
          marginBottom: 1,
        }}
      >
        Total Score
      </Typography>
      <Typography
        variant="h3"
        fontWeight="bold"
        fontSize={40}
        sx={{
          color: correctAnswers / totalQuestions >= 0.8 ? "green" : "red",
          letterSpacing: 2,
        }}
      >
        {correctAnswers}/{totalQuestions}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          marginTop: 1,
          fontStyle: "italic",
          fontSize: 16,
        }}
      >
        ({((correctAnswers / totalQuestions) * 100).toFixed(1)}%)
      </Typography>
    </Box>
  </Box>
</Box>

      </DialogContent>
      <DialogActions sx={{ padding: 2 }}>
        <Button
          onClick={handleClose}
          color="primary"
          variant="contained"
          sx={{
            "&:hover": { backgroundColor: "primary.dark" },
            width: "100%",
            padding: "12px 16px",
            fontWeight: "bold",
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResultsDialog;
