import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  IconButton,
  TablePagination,
  TextField,
  Box,
  Button,
  Select,
  FormControl,
  InputLabel,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import { CSVLink } from "react-csv";
import axios from "axios";
import { debounce } from "lodash";
import CircularProgress from "@mui/material/CircularProgress";

const BASE_URL = "https://api.freepare.com";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTests, setSelectedTests] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [institutionTypeFilter, setInstitutionTypeFilter] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [isSearching, setIsSearching] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // Fetch users data with retry logic
  useEffect(() => {
    const fetchUsers = async (retries = 3) => {
      try {
        const response = await axios.get(`${BASE_URL}/users-data`);
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        if (retries > 0) {
          setTimeout(() => fetchUsers(retries - 1), 1000);
        } else {
          let errorMessage = "Failed to fetch users. Please try again later.";
          if (err.response) {
            switch (err.response.status) {
              case 404:
                errorMessage = "Users data not found.";
                break;
              case 500:
                errorMessage = "Server error. Please try again later.";
                break;
              default:
                errorMessage = "An unexpected error occurred.";
            }
          }
          setError(errorMessage);
          setSnackbarMessage(errorMessage);
          setSnackbarSeverity("error");
          setOpenSnackbar(true);
          setLoading(false);
        }
      }
    };
    fetchUsers();
  }, []);

  // Debounced search handler
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setIsSearching(true);
    debouncedHandleSearchChange(event.target.value);
  };

  const debouncedHandleSearchChange = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setIsSearching(false);
    }, 500),
    []
  );

  // Cancel debounce on unmount
  useEffect(() => {
    return () => {
      debouncedHandleSearchChange.cancel();
    };
  }, [debouncedHandleSearchChange]);

  // Filter users based on search term and institution type
  const filteredUsers = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const lowerCaseInstitutionTypeFilter = institutionTypeFilter.toLowerCase();
    return users.filter(
      (user) =>
        ((user.firstName &&
          user.firstName.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (user.lastName &&
            user.lastName.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (user.email &&
            user.email.toLowerCase().includes(lowerCaseSearchTerm))) &&
        (institutionTypeFilter === "" ||
          (user.institutionType &&
            user.institutionType.toLowerCase() ===
              lowerCaseInstitutionTypeFilter))
    );
  }, [users, searchTerm, institutionTypeFilter]);

  // Function to filter out unwanted fields for CSV export
  const filterUserDataForExport = (users) => {
    return users.map((user) => {
      const {
        profileImageUrl,
        _id,
        password,
        updatedAt,
        __v,
        completedTests,
        submittedTest,
        ...filteredUser
      } = user;
      return filteredUser;
    });
  };

  // Pagination handlers
  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, [setPage]);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, [setRowsPerPage, setPage]);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedTests(null);
  }, [setAnchorEl, setSelectedTests]);

  // Delete user handlers
  const handleDeleteClick = useCallback((user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  }, [setUserToDelete, setDeleteDialogOpen]);

  const handleDeleteConfirm = useCallback(() => {
    if (nameInput === userToDelete.firstName) {
      // Make an API call to delete the user using _id
      axios.delete(`${BASE_URL}/users-data/${userToDelete._id}`)
        .then((response) => {
          // Update the users list after successful deletion
          setUsers(users.filter((user) => user._id !== userToDelete._id));
          setDeleteDialogOpen(false);
          setUserToDelete(null);
          setSnackbarMessage("User deleted successfully.");
          setSnackbarSeverity("success");
          setOpenSnackbar(true);
        })
        .catch((err) => {
          // Handle error if the delete fails
          setSnackbarMessage("Failed to delete user. Please try again later.");
          setSnackbarSeverity("error");
          setOpenSnackbar(true);
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        });
    } else {
      setSnackbarMessage("Name does not match. User not deleted.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  }, [users, userToDelete, nameInput, setUsers, setDeleteDialogOpen, setUserToDelete, setSnackbarMessage, setSnackbarSeverity, setOpenSnackbar]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  }, [setDeleteDialogOpen, setUserToDelete]);

  // Export handlers
  const handleExportClick = useCallback(() => {
    setExportDialogOpen(true);
  }, [setExportDialogOpen]);

  const handleExportConfirm = useCallback(() => {
    setExportDialogOpen(false);
    setSnackbarMessage("Data exported successfully.");
    setSnackbarSeverity("success");
    setOpenSnackbar(true);
  }, [setExportDialogOpen, setSnackbarMessage, setSnackbarSeverity, setOpenSnackbar]);

  const handleExportCancel = useCallback(() => {
    setExportDialogOpen(false);
  }, [setExportDialogOpen]);

  // Snackbar close handler
  const handleCloseSnackbar = useCallback(() => {
    setOpenSnackbar(false);
  }, [setOpenSnackbar]);

  // Loading skeletons for better UX
  const renderSkeletons = useMemo(() => {
    return Array.from({ length: rowsPerPage }).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <Skeleton variant="circular" width={50} height={50} />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" />
        </TableCell>
      </TableRow>
    ));
  }, [rowsPerPage]);

  return (
    <Box
      maxWidth="xl"
      style={{
        marginTop: 30,
        height: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "center", md: "space-between" },
          alignItems: "center",
          marginBottom: "20px",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Box>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              background: "linear-gradient(90deg, #066C98, #2CACE3)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "500",
              fontSize: { xs: "1.8rem", sm: "2.5rem" },
              mb: { xs: 2, sm: 0 },
            }}
          >
            Users Data
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexDirection: { xs: "column", md: "row" } }}>
          <TextField
            variant="outlined"
            label="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ width: 300 }}
            InputProps={{
              endAdornment: isSearching ? <CircularProgress size={20} /> : null,
            }}
          />
          <FormControl variant="outlined" style={{ width: 200 }}>
            <InputLabel>Institution Type</InputLabel>
            <Select
              value={institutionTypeFilter}
              onChange={(e) => setInstitutionTypeFilter(e.target.value)}
              label="Institution Type"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="school">School</MenuItem>
              <MenuItem value="college">College</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={handleExportClick}
            style={{ backgroundColor: "#4caf50", color: "#fff" }} // Green color for export button
          >
            Export to CSV
          </Button>
        </Box>
      </Box>

      {loading && renderSkeletons}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && !error && filteredUsers.length === 0 && (
        <Typography>No users found</Typography>
      )}

      {!loading && !error && filteredUsers.length > 0 && (
        <>
          <TableContainer
            component={Paper}
            style={{ flex: 1, overflowX: "auto" }}
          >
            <Table aria-label="user table">
              <TableHead
                sx={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#fff",
                  zIndex: 1,
                }}
              >
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Profile Picture</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>First Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Last Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>Class</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Degree Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Institution Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Institution Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>Passing Year</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>User Joined at</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                      }}
                    >
                      <TableCell>
                        <Tooltip title={`${user.firstName} ${user.lastName}`}>
                          {user.profileImageUrl ? (
                            <img
                              src={user.profileImageUrl}
                              alt="Profile"
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: "50%",
                              }}
                            />
                          ) : (
                            <AccountCircleIcon
                              style={{ fontSize: 50, color: "#066C98" }}
                            />
                          )}
                        </Tooltip>
                      </TableCell>
                      <TableCell>{user.firstName}</TableCell>
                      <TableCell>{user.lastName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell align="right">{user.class || "N/A"}</TableCell>
                      <TableCell>{user.degreeName || "N/A"}</TableCell>
                      <TableCell>{user.institutionName || "N/A"}</TableCell>
                      <TableCell>{user.institutionType || "N/A"}</TableCell>
                      <TableCell align="right">
                        {user.passingYear || "N/A"}
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDeleteClick(user)}
                          style={{ color: "#f44336" }} // Red color for delete icon
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {/* Snackbar for user feedback */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Menu for Completed Tests */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        MenuListProps={{
          onMouseLeave: handleMenuClose,
        }}
      >
        {selectedTests && selectedTests.length > 0 ? (
          selectedTests.map((test, index) => (
            <MenuItem key={index}>{test}</MenuItem>
          ))
        ) : (
          <MenuItem>No tests completed.</MenuItem>
        )}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          Are you sure you want to delete{" "}
          {userToDelete ? userToDelete.firstName : "this user"}?
          <TextField
            label="Enter the user's first name to confirm"
            fullWidth
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Confirmation Dialog */}
      <Dialog open={exportDialogOpen} onClose={handleExportCancel}>
        <DialogTitle>Export Data</DialogTitle>
        <DialogContent>
          Are you sure you want to export the data to a CSV file?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExportCancel}>Cancel</Button>
          <CSVLink
            data={filterUserDataForExport(filteredUsers)} // Use filtered data
            filename={"users.csv"}
            onClick={handleExportConfirm}
          >
            <Button color="primary">Export</Button>
          </CSVLink>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;