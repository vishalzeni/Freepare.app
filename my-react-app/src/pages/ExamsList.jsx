import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Snackbar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material"; // Import icons
import axios from "axios";
import { debounce } from "lodash";
import PropTypes from "prop-types";

const BASE_URL = "https://freepare.onrender.com/api";

const ExamsList = () => {
  const [state, setState] = useState({
    exams: [],
    filteredExams: [],
    loading: true,
    error: null,
    searchQuery: "",
    sortOrder: "A-Z",
    currentPage: 1,
    openSnackbar: false,
    snackbarMessage: "",
    snackbarSeverity: "error",
    renameDialogOpen: false,
    currentExam: null,
    newExamName: "",
    previewExam: null,
    previewDialogOpen: false,
    inputValue: "",
    deleteDialogOpen: false,
    examToDelete: null,
    mutationLoading: false,
  });

  const examsPerPage = 12; // Number of cards per page

  const fetchExams = async (retries = 3) => {
    try {
      const cancelToken = axios.CancelToken.source();
      const response = await axios.get(`${BASE_URL}/exams`, {
        cancelToken: cancelToken.token,
      });
      setState((prevState) => ({
        ...prevState,
        exams: response.data,
        loading: false,
      }));
    } catch (error) {
      if (axios.isCancel(error)) return;
      if (retries > 0) {
        setTimeout(() => fetchExams(retries - 1), 1000);
      } else {
        let errorMessage = "Failed to load exams!";
        if (error.response) {
          switch (error.response.status) {
            case 404:
              errorMessage = "Exams data not found.";
              break;
            case 500:
              errorMessage = "Server error. Please try again later.";
              break;
            default:
              errorMessage = "An unexpected error occurred.";
          }
        }
        setState((prevState) => ({
          ...prevState,
          error: errorMessage,
          snackbarMessage: errorMessage,
          openSnackbar: true,
          loading: false,
        }));
      }
    }
  };

  // Fetch exams data with retry logic
  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    setState((prevState) => {
      const searchLower = prevState.searchQuery.toLowerCase(); // Ensure case-insensitivity
      return {
        ...prevState,
        filteredExams: prevState.exams.filter(
          (exam) =>
            (exam.examName &&
              exam.examName.toLowerCase().includes(searchLower)) ||
            (exam.examId && exam.examId.toLowerCase().includes(searchLower))
        ),
      };
    });
  }, [state.searchQuery, state.exams]);

  const debouncedSearch = useCallback(
    debounce((query) => {
      setState((prevState) => ({ ...prevState, searchQuery: query }));
    }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearch = (value) => {
    const trimmedQuery = value.trim().toLowerCase();
    setState((prevState) => ({
      ...prevState,
      inputValue: value,
      currentPage: 1,
    }));
    debouncedSearch(trimmedQuery);
  };

  const handleSortChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      sortOrder: e.target.value,
      currentPage: 1,
    }));
  };

  const sortedExams = useMemo(() => {
    return [...state.filteredExams].sort((a, b) => {
      if (state.sortOrder === "A-Z") {
        return a.examName.localeCompare(b.examName);
      } else if (state.sortOrder === "Z-A") {
        return b.examName.localeCompare(a.examName);
      }
      return 0;
    });
  }, [state.filteredExams, state.sortOrder]);

  const indexOfLastExam = state.currentPage * examsPerPage;
  const indexOfFirstExam = indexOfLastExam - examsPerPage;
  const currentExams = sortedExams.slice(indexOfFirstExam, indexOfLastExam);

  const handlePageChange = (event, value) => {
    setState((prevState) => ({ ...prevState, currentPage: value }));
  };

  const handleClearSearch = () => {
    setState((prevState) => ({
      ...prevState,
      inputValue: "",
      searchQuery: "",
      currentPage: 1,
    }));
  };

  const handleRenameClick = (exam) => {
    setState((prevState) => ({
      ...prevState,
      currentExam: exam,
      newExamName: exam.examName,
      renameDialogOpen: true,
    }));
  };

  const handleRenameConfirm = async () => {
    if (!state.newExamName.trim()) {
      setState((prevState) => ({
        ...prevState,
        snackbarMessage: "Exam name cannot be empty!",
        openSnackbar: true,
      }));
      return;
    }

    setState((prevState) => ({ ...prevState, mutationLoading: true }));

    try {
      await axios.put(`${BASE_URL}/exams/${state.currentExam._id}`, {
        examName: state.newExamName,
      });

      const updatedExams = state.exams.map((exam) =>
        exam._id === state.currentExam._id
          ? { ...exam, examName: state.newExamName }
          : exam
      );
      setState((prevState) => ({
        ...prevState,
        exams: updatedExams,
        renameDialogOpen: false,
        snackbarMessage: "Exam renamed successfully!",
        snackbarSeverity: "success",
        openSnackbar: true,
        mutationLoading: false,
      }));
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        snackbarMessage: "Failed to rename exam!",
        snackbarSeverity: "error",
        openSnackbar: true,
        mutationLoading: false,
      }));
    }
  };

  const handleRenameCancel = () => {
    setState((prevState) => ({
      ...prevState,
      renameDialogOpen: false,
      currentExam: null,
    }));
  };

  const handleDeleteClick = (exam) => {
    setState((prevState) => ({
      ...prevState,
      examToDelete: exam,
      deleteDialogOpen: true,
    }));
  };

  const handleDeleteConfirm = async () => {
    setState((prevState) => ({ ...prevState, mutationLoading: true }));

    try {
      await axios.delete(`${BASE_URL}/exams/${state.examToDelete._id}`);
      setState((prevState) => ({
        ...prevState,
        exams: prevState.exams.filter(
          (exam) => exam._id !== state.examToDelete._id
        ),
        snackbarMessage: "Exam deleted successfully!",
        snackbarSeverity: "success",
        openSnackbar: true,
        deleteDialogOpen: false,
        examToDelete: null,
        mutationLoading: false,
      }));
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        snackbarMessage: "Failed to delete exam!",
        snackbarSeverity: "error",
        openSnackbar: true,
        deleteDialogOpen: false,
        examToDelete: null,
        mutationLoading: false,
      }));
    }
  };

  const handleDeleteCancel = () => {
    setState((prevState) => ({
      ...prevState,
      deleteDialogOpen: false,
      examToDelete: null,
    }));
  };

  const handlePreviewClick = (exam) => {
    setState((prevState) => ({
      ...prevState,
      previewExam: exam,
      previewDialogOpen: true,
    }));
  };

  const handleDialogClose = () => {
    setState((prevState) => ({
      ...prevState,
      previewDialogOpen: false,
      previewExam: null,
    }));
  };

  const handleRetry = () => {
    setState((prevState) => ({ ...prevState, loading: true, error: null }));
    fetchExams();
  };

  if (state.loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (state.error) {
    return (
      <Box sx={{ textAlign: "center", color: "red", fontSize: "1.5rem" }}>
        <Typography variant="h6">{`Error: ${state.error}`}</Typography>
        <Button onClick={handleRetry} variant="contained" color="primary">
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", padding: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          mt: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

        <Typography
          variant="h2"
          sx={{
            background: "linear-gradient(90deg, #066C98, #2CACE3)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "#066C98", // Fallback color
            fontWeight: "500",
            fontSize: { xs: "1.8rem", sm: "2.5rem" },
            mb: { xs: 2, sm: 0 },
          }}
        >
          Uploaded Tests
        </Typography>
        <Typography variant="h6" sx={{ color: "grey.600" }}>
          <em> (Total {state.exams.length} Tests)</em>
        </Typography>
          </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={state.sortOrder}
              onChange={handleSortChange}
              label="Sort By"
              aria-label="Sort exams"
            >
              <MenuItem value="A-Z">A-Z</MenuItem>
              <MenuItem value="Z-A">Z-A</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              variant="outlined"
              placeholder="Search by name or ID"
              size="small"
              value={state.inputValue}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "grey.600" }} />
                ),
              }}
              sx={{ width: { xs: "100%", sm: 300 } }}
              aria-label="Search exams"
            />

            {state.searchQuery && (
              <IconButton onClick={handleClearSearch} aria-label="clear search">
                <ClearIcon />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {currentExams.length > 0 ? (
          currentExams.map((exam) => (
            <MemoizedExamCard
              key={exam._id}
              exam={exam}
              onPreviewClick={handlePreviewClick}
              onRenameClick={handleRenameClick}
              onDeleteClick={handleDeleteClick}
            />
          ))
        ) : (
          <Typography
            variant="body1"
            sx={{ textAlign: "center", width: "100%", mt: 2, color: "grey" }}
          >
            No exams found.
          </Typography>
        )}
      </Grid>

      {state.filteredExams.length > examsPerPage && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={Math.ceil(state.filteredExams.length / examsPerPage)}
            page={state.currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Rename Dialog */}
      <Dialog open={state.renameDialogOpen} onClose={handleRenameCancel}>
        <DialogTitle>Rename Exam</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Exam Name"
            fullWidth
            value={state.newExamName}
            onChange={(e) =>
              setState((prevState) => ({
                ...prevState,
                newExamName: e.target.value,
              }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRenameCancel} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleRenameConfirm}
            color="primary"
            disabled={state.mutationLoading}
          >
            {state.mutationLoading ? <CircularProgress size={24} /> : "Rename"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={state.previewDialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Exam Preview</DialogTitle>
        <DialogContent dividers>
          {state.previewExam?.questions?.map((question, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="h4">
                {question.questionNo}: {question.questionText}
              </Typography>
              {question.questionImage && (
                <Box
                  component="img"
                  src={question.questionImage}
                  alt="Question"
                  sx={{ width: "100%", maxHeight: 200, mt: 1 }}
                />
              )}
              <Box sx={{ mt: 2 }}>
                <Box sx={{ pl: 2 }}>
                  <Typography>A: {question.optionA}</Typography>
                  {question.optionAImage && (
                    <Box
                      component="img"
                      src={question.optionAImage}
                      alt="Option A"
                      sx={{ width: "100px", height: "100px", mt: 1 }}
                    />
                  )}
                  <Typography>B: {question.optionB}</Typography>
                  {question.optionBImage && (
                    <Box
                      component="img"
                      src={question.optionBImage}
                      alt="Option B"
                      sx={{ width: "100px", height: "100px", mt: 1 }}
                    />
                  )}
                  <Typography>C: {question.optionC}</Typography>
                  {question.optionCImage && (
                    <Box
                      component="img"
                      src={question.optionCImage}
                      alt="Option C"
                      sx={{ width: "100px", height: "100px", mt: 1 }}
                    />
                  )}
                  <Typography>D: {question.optionD}</Typography>
                  {question.optionDImage && (
                    <Box
                      component="img"
                      src={question.optionDImage}
                      alt="Option D"
                      sx={{ width: "100px", height: "100px", mt: 1 }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={state.deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this exam?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="primary"
            disabled={state.mutationLoading}
          >
            {state.mutationLoading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={state.openSnackbar}
        autoHideDuration={4000}
        onClose={() =>
          setState((prevState) => ({ ...prevState, openSnackbar: false }))
        }
      >
        <Alert severity={state.snackbarSeverity}>{state.snackbarMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

const ExamCard = ({ exam, onPreviewClick, onRenameClick, onDeleteClick }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Card
      sx={{
        boxShadow: 3,
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: 6,
        },
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 2,
          backgroundColor: "#fff",
          borderRadius: 3,
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ color: "#066C98", fontWeight: "500" }}>
            {exam.examName}
          </Typography>
          <Typography variant="body2" sx={{ color: "grey", mt: 0.5 }}>
            Id: {exam.examId}
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Preview">
            <IconButton
              aria-label="Preview"
              onClick={() => onPreviewClick(exam)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rename">
            <IconButton color="primary" onClick={() => onRenameClick(exam)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton color="error" onClick={() => onDeleteClick(exam)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  </Grid>
);

const MemoizedExamCard = React.memo(ExamCard);

ExamCard.propTypes = {
  exam: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    examName: PropTypes.string.isRequired,
    examId: PropTypes.string.isRequired,
  }).isRequired,
  onPreviewClick: PropTypes.func.isRequired,
  onRenameClick: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
};

export default ExamsList;
