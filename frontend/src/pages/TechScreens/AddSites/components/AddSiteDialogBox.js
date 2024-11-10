import React, { useState } from "react";
import axios from "axios";
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
import API_PATHS from "../../../../Config";

const AddSiteDialogBox = ({ openDialog, handleCloseDialog, setRefresh }) => {
  const [siteName, setSiteName] = useState("");
  const [siteLocation, setSiteLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // State to track loading

  const handleSiteNameChange = (e) => {
    setSiteName(e.target.value);
  };

  const handleSiteLocationChange = (e) => {
    setSiteLocation(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous error

    // Input validation
    if (!siteName.trim()) {
      setError("Site name is required.");
      return; // Prevent API call if validation fails
    }
    if (!siteLocation.trim()) {
      setError("Site location is required.");
      return; // Prevent API call if validation fails
    }

    let CustomerId = sessionStorage.getItem("customer_id");

    setLoading(true); // Set loading to true when the API call starts

    try {
      const response = await axios.post(
        process.env.REACT_APP_API_BASE_URL + API_PATHS.CREATE_SITE_LIST,
        {
          customer_id: CustomerId,
          site_name: siteName,
          site_location: siteLocation,
          last_updated: new Date().toISOString(),
        }
      );

      if (response.status === 201) {
        console.log("Site added successfully:", response.data);

        // Clear form fields after success
        setSiteName("");
        setSiteLocation("");

        // Refresh the list
        setRefresh(Date.now());

        // Close the dialog box
        handleCloseDialog();
      } else {
        setError("Failed to add site. Please try again.");
      }
    } catch (error) {
      console.error("Error adding site:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false); // Set loading to false after API call completes
    }
  };

  return (
    <Dialog
      open={openDialog}
      onClose={handleCloseDialog}
      PaperProps={{
        sx: {
          borderRadius: "30px",
          width: { xs: "80%", sm: "50%", md: "27%" }, // Responsive width
          height: "auto",
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
        Add Site
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
              Site Name
            </Typography>
            <TextField
              placeholder="Enter Site Name"
              type="text"
              fullWidth
              value={siteName}
              onChange={handleSiteNameChange}
              required
              error={Boolean(error && !siteName.trim())}
              helperText={error && !siteName.trim() ? "Site name is required" : ""}
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
          <FormGroup sx={{ marginBottom: "2px" }}>
            <Typography
              color="inherit"
              sx={{
                fontSize: "11px",
                fontWeight: "600",
                marginBottom: "5px",
              }}
            >
              Site Location
            </Typography>
            <TextField
              placeholder="Enter Location"
              type="text"
              fullWidth
              value={siteLocation}
              onChange={handleSiteLocationChange}
              required
              error={Boolean(error && !siteLocation.trim())}
              helperText={error && !siteLocation.trim() ? "Site location is required" : ""}
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
            <Typography color="error" sx={{ marginTop: "10px" }}>
              {error}
            </Typography>
          )}

          {loading && <LinearProgress sx={{ marginTop: "10px"}} />} {/* Progress bar */}
        </form>
      </DialogContent>
      <DialogActions
        sx={{
          backgroundColor: "#212125",
          marginTop: "8px",
          marginBottom: "5px",
        }}
      >
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
          disabled={loading} // Disable button during loading
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
          disabled={loading} // Disable button during loading
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSiteDialogBox;
