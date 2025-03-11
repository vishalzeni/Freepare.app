import { useState, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  CircularProgress,
  Divider,
  Grid,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import DeleteIcon from "@mui/icons-material/Delete";

import * as XLSX from "xlsx";
const processData = (examData) => {
  if (!examData) return ""; // Ensure examData is defined

  // Convert newlines to <br /> tags
  examData = examData.replace(/\\n/g, "<br />");

  // Convert bold markdown (**) to <b> tag
  examData = examData.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

  // Convert italic markdown (*) to <i> tag
  examData = examData.replace(/\*(.*?)\*/g, "<i>$1</i>");

    // Convert tilde markdown (~text~) to <u> tag for underline
    examData = examData.replace(/~(.*?)~/g, "<u>$1</u>");

  return examData;
};
export default function Upload() {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [excelData, setExcelData] = useState([]); // Store Excel data
  const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbar state
  const [examName, setExamName] = useState(""); // State to store the exam name
  const [examId, setExamId] = useState(""); // State to store the generated exam ID
  const [openExamNameDialog, setOpenExamNameDialog] = useState(false);
  const [openExamIdDialog, setOpenExamIdDialog] = useState(false);
  const [errorSnackbar, setErrorSnackbar] = useState({
    open: false,
    message: "",
  }); // Error Snackbar state

  const fileInputRef = useRef(null); // Reference to the file input
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Helper function to format file size
  const formatFileSize = (sizeInBytes) => {
    if (sizeInBytes >= 1024 * 1024) {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    }
  };

  // Extract and store only the required metadata for Excel files
  const addFiles = useCallback(
    (newFiles) => {
      const validFileTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
      const fileData = newFiles.map((file) => {
        const error =
          file.size > MAX_FILE_SIZE
            ? "File exceeds maximum size of 5MB"
            : !validFileTypes.includes(file.type)
            ? "Unsupported file type"
            : null;

        // If file is valid, extract sheet data from the Excel file
        if (!error) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            // Extract sheet names and first sheet data
            const sheetNames = workbook.SheetNames;
            const sheetData = XLSX.utils.sheet_to_json(
              workbook.Sheets[sheetNames[0]]
            );
            setExcelData(sheetData); // Save extracted data to state
            console.log(sheetData); // Debugging line to log the data
          };
          reader.readAsArrayBuffer(file);
        } else {
          setErrorSnackbar({ open: true, message: error });
        }

        return {
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
          error,
        };
      });
      setFiles((prev) => [...prev, ...fileData]);

      // Show Snackbar if no error
      if (!fileData.some((file) => file.error)) {
        setOpenSnackbar(true);
      }
    },
    [MAX_FILE_SIZE]
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setDragging(false);
      const droppedFiles = Array.from(event.dataTransfer.files);
      addFiles(droppedFiles);
    },
    [addFiles]
  );

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleFileInputChange = useCallback(
    (event) => {
      const selectedFiles = Array.from(event.target.files);
      addFiles(selectedFiles);
    },
    [addFiles]
  );

  const handleDelete = useCallback(
    (index) => {
      setFiles((prev) => {
        const updatedFiles = prev.filter((_, i) => i !== index);

        // Reset the file input field when files are deleted
        if (updatedFiles.length === 0) {
          resetFileInput();
          clearExcelData();
        }

        return updatedFiles;
      });
    },
    [fileInputRef, setExcelData]
  );

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // Clear the input field value
    }
  };

  const clearExcelData = () => {
    setExcelData([]); // Clear preview data
  };

  const handleFileUpload = () => {
    if (files.length > 0) {
      setOpenExamNameDialog(true); // Open the Exam Name dialog
    } else {
      setErrorSnackbar({ open: true, message: "No files selected for upload" });
    }
  };

  // Handle submission of Exam Name and generate ID
  const handleDialogSubmit = async () => {
    if (examName.trim()) {
      const generatedId = generateAlphaNumericId(); // Generate ID
      setExamId(generatedId); // Set the generated ID

      // Proceed with the upload only if exam name is valid
      setIsUploading(true);
      try {
        const response = await fetch("https://freepare.onrender.com/api/exam", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sheetData: excelData,
            examId: generatedId,
            examName: examName,
          }),
        });

        if (!response.ok) {
          throw new Error("File upload failed");
        }

        const result = await response.json();
        setErrorSnackbar({
          open: true,
          message: "Upload successful: " + result.message,
        });

        // Open the Exam ID dialog only after a successful upload
        setOpenExamNameDialog(false); // Close Exam Name dialog
        setOpenExamIdDialog(true); // Open Exam ID dialog
      } catch (error) {
        setErrorSnackbar({
          open: true,
          message: "Error uploading file: " + error.message,
        });
      } finally {
        setIsUploading(false);
      }
    } else {
      setErrorSnackbar({
        open: true,
        message: "Please enter a valid exam name.",
      });
    }
  };

  const generateAlphaNumericId = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase(); // Generates a random 8-character alphanumeric ID
  };

  // Handle copying ID to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(examId); // Copy to clipboard
    alert("ID copied to clipboard!");
  };

  // Function to handle Exam Name Dialog close
  const handleCloseExamNameDialog = () => {
    setOpenExamNameDialog(false);
    setExamName(""); // Reset exam name for clarity
  };

  // Function to handle Exam ID Dialog close
  const handleCloseExamIdDialog = () => {
    setOpenExamIdDialog(false);
    setFiles([]); // Clear files
    setExcelData([]); // Clear preview data
    setExamId(""); // Reset exam ID
  };

  const renderOptions = (row) => {
    const options = ["A", "B", "C", "D"]; // The option labels
    return (
      <Grid container direction="column" spacing={1} sx={{ mt: 2 }}>
        {options.map((optionLabel) => {
          const optionKey = `Option ${optionLabel}`;
          const optionText = row[optionKey];
          const optionImage = row[`${optionKey} Image`];

          return (
            <Grid
              item
              key={optionLabel}
              sx={{ display: "flex", alignItems: "center" }}
            >
              {/* Always display the label */}
              <Typography
                variant="body1"
                sx={{ marginRight: 1, color: "primary.main" }}
              >
                {optionLabel}:
              </Typography>

              {/* Render option text if available */}
              {optionText && (
                <Typography variant="body1" sx={{ color: "primary.main" }}>
                  {optionText}
                </Typography>
              )}

              {/* Render image if available */}
              {optionImage && (
                <img
                  src={optionImage}
                  style={{
                    height: "auto",
                    marginLeft: 10,
                    maxWidth: 300,
                  }}
                />
              )}
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderExplanation = (row) => {
    const explanationText = row["Explanation"];
    const explanationImage = row["Explanation Image"];
    return (
      <Grid container direction="column" spacing={1} sx={{ mt: 2 }}>
        {/* Render Correct Answer */}
        <Grid item>
          <Typography sx={{ color: "#4BB543", fontWeight: "bold" }}>
            Correct Answer: {row["Correct Answer"]}
          </Typography>
        </Grid>

        {/* Render Explanation Text */}
        <Grid item sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body1" sx={{ marginRight: 1, color: "grey " }}>
            <em>Explanation:</em>
          </Typography>
          {explanationText && (
            <Typography
              variant="body1"
              sx={{ color: "primary.main" }}
              dangerouslySetInnerHTML={{ __html: processData(explanationText) }}
            />
          )}
        </Grid>

        {/* Render Explanation Image */}
        {explanationImage && (
          <Grid item sx={{ display: "flex", alignItems: "center" }}>
            <img
              src={explanationImage}
              style={{
                maxWidth: "500px",
                height: "auto",
                marginLeft: 10,
              }}
            />
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <Box>
      {/* Drag and Drop Area */}
      {files.length === 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 4,
            border: `2px dashed ${dragging ? "#003366" : "#066C98"}`,
            borderRadius: 2,
            backgroundColor: "primary.secondary",
            cursor: "pointer",
            height: "70vh",
            marginTop: 5,
            "&:hover": {
              backgroundColor: "#ffffff",
            },
            "@media (max-width: 600px)": {
              padding: 3,
            },
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-label="Drag and drop or browse to upload files"
        >
          <CloudUploadIcon
            sx={{
              fontSize: 50,
              color: "#066C98",
              mb: 1,
              "@media (max-width: 600px)": {
                fontSize: 40,
              },
            }}
          />
          <Typography
            variant="body1"
            sx={{
              color: "#066C98",
              mb: 1,
              textAlign: "center",
              fontSize: "1.5rem",
              "@media (max-width: 600px)": {
                fontSize: "1.2rem",
              },
            }}
          >
            Drag and drop your Excel files here, or Browse to upload
          </Typography>
          <Button
            variant="contained"
            component="label"
            sx={{
              mt: 2,
              backgroundColor: "#066C98",
              fontSize: "0.8rem",
              padding: "8px 18px",
              "&:hover": {
                backgroundColor: "#055a80",
              },
              "@media (max-width: 600px)": {
                fontSize: "0.9rem",
                padding: "6px 14px",
              },
            }}
          >
            Browse Files
            <input
              type="file"
              hidden
              multiple
              accept=".xlsx,.xls"
              onChange={handleFileInputChange}
              ref={fileInputRef} // Attach ref to input element
            />
          </Button>
        </Box>
      )}

      {/* Display Selected Files */}
      {files.length > 0 && (
        <Box
          sx={{
            mt: 4,
            width: "100%",
            backgroundColor: "#e3f2fd",
            borderRadius: 1,
            padding: 2,
            boxShadow: 3,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              color: "#066C98",
              mb: 2,
              fontSize: "1.5rem",
            }}
          >
            Selected Files
          </Typography>
          <List>
            {files.map((file, index) => (
              <ListItem
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 1,
                  backgroundColor: "#fff", // Subtle background
                  borderRadius: 1,
                  boxShadow: 2, // Softer shadow for a cleaner look
                  padding: "10px 15px",

                  "@media (max-width: 600px)": {
                    "& .file-name": {
                      maxWidth: "100%", // Full width on mobile
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    },
                    "& .file-size": {
                      fontSize: "0.7rem",
                      color: "#757575", // Lighter color for file size
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: "40px" }}>
                  <DescriptionIcon sx={{ color: "#066C98" }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Typography
                        className="file-name"
                        sx={{
                          flexGrow: 1, // Allow name to take available space
                          maxWidth: "calc(100% - 50px)", // Adjust to avoid overflow with icon
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontWeight: "bold", // Make file name more prominent
                          color: "#333", // Dark text for better contrast
                        }}
                      >
                        {file.name}
                      </Typography>
                      <Typography
                        className="file-size"
                        variant="body2"
                        sx={{
                          color: "#757575", // Subtle color for the file size
                          fontSize: "0.85rem",
                          "@media (max-width: 600px)": {
                            display: "block", // Make file size block on mobile
                          },
                        }}
                      >
                        {file.size}
                      </Typography>
                    </Box>
                  }
                />
                <IconButton
                  onClick={() => handleDelete(index)}
                  sx={{
                    color: "#FF0000", // Delete icon color
                    "&:hover": {
                      color: "#D32F2F", // Darker red on hover
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
          <Button
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: "#066C98",
              fontSize: "0.9rem",
              padding: "6px 16px",
              "&:hover": {
                backgroundColor: "#055a80",
              },
            }}
            onClick={handleFileUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Upload"
            )}
          </Button>
        </Box>
      )}
      {/* Snackbar to show file added message */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message="File added successfully!"
      />
      <Snackbar
        open={errorSnackbar.open}
        autoHideDuration={3000}
        onClose={() => setErrorSnackbar({ open: false, message: "" })}
        message={errorSnackbar.message}
      />
      <Dialog open={openExamNameDialog} onClose={handleCloseExamNameDialog}>
        <DialogTitle>Enter Test Code</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Test Code"
            type="text"
            fullWidth
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExamNameDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDialogSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog to show Exam ID */}
      <Dialog open={openExamIdDialog} onClose={handleCloseExamIdDialog}>
        <DialogTitle>Exam ID</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            This is your unique ID for this exam: <strong>{examId}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <IconButton onClick={handleCopy} aria-label="copy exam id">
            <FileCopyIcon />
          </IconButton>
          <Button onClick={handleCloseExamIdDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* // Preview Excel Data */}
      {excelData.length > 0 && (
        <Box
          sx={{
            mt: 4,
            border: "2px dashed #066C98",
            p: 2,
            borderRadius: 1,
            backgroundColor: "#fff",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "primary.main",
              mb: 2,
              fontSize: "2rem",
              textAlign: "center",
            }}
          >
            Preview
          </Typography>
          {excelData.map((row, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography
                variant="body1"
                sx={{ color: "primary.main", fontSize: "1.2rem", mb: 1 }}
                dangerouslySetInnerHTML={{
                  __html: `${row["Question No."]}: ${processData(
                    row["Question"]
                  )}`,
                }}
              />

              <Box sx={{ display: "flex", flexDirection: "column", ml: 2 }}>
                {row["Question Image"] && row["Question Image"].trim() && (
                  <img
                    src={row["Question Image"]}
                    alt="Question"
                    style={{
                      maxWidth: "500px",
                      height: "auto",
                      margin: "10px 0",
                    }}
                  />
                )}
              </Box>

              {/* Render options and explanation */}
              {renderOptions(row)}
              {renderExplanation(row)}

              <Divider
                sx={{
                  mt: 2,
                  borderBottomWidth: 1,
                  borderColor: "primary.main",
                }}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
