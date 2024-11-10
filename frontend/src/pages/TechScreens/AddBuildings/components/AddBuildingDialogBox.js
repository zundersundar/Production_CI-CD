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
  LinearProgress,
} from "@mui/material";
import axios from "axios";
import API_PATHS from "../../../../Config";

const AddBuildingDialogBox = ({ openDialog, handleCloseDialog, setRefresh }) => {
  const [buildingName, setBuildingName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Track loading state

  const handleBuildingNameChange = (e) => {
    setBuildingName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!buildingName) {
      setError("Building name is required.");
      return;
    }

    setLoading(true); // Start loading
    try {
      await saveBuilding({ name: buildingName });
      setBuildingName("");
      setRefresh(Date.now());
      handleCloseDialog(); // Close the dialog after saving
    } catch (err) {
      setError("Failed to save the building. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const saveBuilding = async (buildingData) => {
    let siteId = sessionStorage.getItem("site_id");
    const staticData = {
      building_name: buildingData.name,
      site_id: siteId,
    };

    try {
      const response = await axios.post(
        process.env.REACT_APP_API_BASE_URL + API_PATHS.CREATE_BUILDINGS_LIST,
        staticData
      );
      if (response.status === 201) {
        console.log("Building added:", response.data.result);
      } else {
        throw new Error("Failed to add building");
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <Dialog
      open={openDialog}
      onClose={handleCloseDialog}
      PaperProps={{
        sx: {
          borderRadius: "30px",
          width: "27%", // Keep the fixed width
          maxHeight: "90vh", // Set max height to allow scrolling if needed
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
        Add Building
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: "#212125", color: "#e4eaed" }}>
        <form onSubmit={handleSubmit}>
          <FormGroup sx={{ marginBottom: "2px" }}>
            <Typography
              color="inherit"
              sx={{
                fontSize: "11px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Building Name
            </Typography>
            <TextField
              placeholder="Enter Building Name"
              type="text"
              fullWidth
              value={buildingName}
              onChange={handleBuildingNameChange}
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

        {/* Conditionally render LinearProgress */}
        {loading && <LinearProgress sx={{ marginTop: "10px", backgroundColor: "inherit" }} />}
      </DialogContent>
      <DialogActions sx={{ backgroundColor: "#212125", marginTop: "8px" }}>
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
          Close
        </Button>
        <Button
          onClick={handleSubmit}
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            background: "#008080",
            color: "#1E1E1E",
            textTransform: "capitalize",
            borderRadius: "7px",
            padding: "3px 23px",
            fontSize: "12px",
            fontWeight: "600",
            "&:hover": {
              backgroundColor: "#005151",
            },
          }}
          disabled={loading} // Disable button while loading
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBuildingDialogBox;
