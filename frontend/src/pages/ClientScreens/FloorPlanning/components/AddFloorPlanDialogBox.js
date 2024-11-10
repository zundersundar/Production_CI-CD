import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  FormGroup,
} from "@mui/material";

const AddFloorPlanDialogBox = ({ openDialog, handleCloseDialog,sensorName, setSensorName }) => {
  const [error, setError] = useState("");

  const handleSensorNameChange = (e) => {
    setSensorName(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Perform any validation here if needed
    if (!sensorName) {
      setError("Sensor name is required.");
      return;
    }

    // Close the dialog without saving or making API calls
    handleCloseDialog();
  };

  return (
    <Dialog
      open={openDialog}
      onClose={handleCloseDialog}
      PaperProps={{
        sx: {
          borderRadius: "30px",
          width: "27%",
          height: "37vh", // Adjusted height to fit content
          background: "#212125",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "#212125",
          color: "#e4eaed",
          textAlign: "start",
          fontWeight: "600",
          paddingTop: "28px",
        }}
      >
        Enter Name
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: "#212125", color: "#e4eaed" }}>
        <form onSubmit={handleSubmit}>
          <FormGroup sx={{ marginBottom: "2px" }}>
            <Typography
              color="inherit"
              sx={{
                fontSize: "11px",
                fontWeight: "600",
                marginBottom: "5px",
              }}
            >
              Sensor Name
            </Typography>
            <TextField
              placeholder="Enter Sensor Name"
              type="text"
              fullWidth
              value={sensorName}
              onChange={handleSensorNameChange}
              required
              InputProps={{
                style: {
                  color: "white",
                  height: "30px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  backgroundColor: "#27272C",
                },
              }}
            />
          </FormGroup>
          {error && (
            <Typography color="error" variant="body2" sx={{ marginTop: "10px" }}>
              {error}
            </Typography>
          )}
        </form>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: "#212125", marginBottom: '10px', marginRight: "5px" }}>
        <Button
          onClick={handleCloseDialog}
          variant="contained"
          color="primary"
          sx={{
            background: "#B0ECEC",
            color: "#008080",
            textTransform: "capitalize",
            borderRadius: "7px",
            padding: "3px 23px",
            fontSize: "12px",
            fontWeight: "600",
            "&:hover": {
              backgroundColor: "#8ab2b2",
            },
          }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFloorPlanDialogBox;
