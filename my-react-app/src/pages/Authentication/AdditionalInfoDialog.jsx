// AdditionalInfoDialog.js
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";

const AdditionalInfoDialog = ({
  open,
  onClose,
  additionalInfo,
  handleAdditionalInfoChange,
  handleAddInfoSubmit,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Additional Information</DialogTitle>
      <DialogContent dividers>
        {/* Dropdown for selecting institution type */}
        <TextField
          select
          margin="normal"
          fullWidth
          label="Select Institution Type"
          name="institutionType"
          value={additionalInfo.institutionType || ""}
          onChange={handleAdditionalInfoChange}
        >
          <MenuItem value="school">School</MenuItem>
          <MenuItem value="college">College/University</MenuItem>
        </TextField>

        {/* Conditional fields based on institutionType */}
        {additionalInfo.institutionType === "school" && (
          <TextField
            margin="normal"
            fullWidth
            label="Class"
            name="class"
            value={additionalInfo.class || ""}
            onChange={handleAdditionalInfoChange}
          />
        )}

        {additionalInfo.institutionType === "college" && (
          <>
            <TextField
              margin="normal"
              fullWidth
              label="Institution Name"
              name="institutionName"
              value={additionalInfo.institutionName || ""}
              onChange={handleAdditionalInfoChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Degree Name"
              name="degreeName"
              value={additionalInfo.degreeName || ""}
              onChange={handleAdditionalInfoChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Passing Year"
              name="passingYear"
              value={additionalInfo.passingYear || ""}
              onChange={handleAdditionalInfoChange}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleAddInfoSubmit} color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdditionalInfoDialog;
