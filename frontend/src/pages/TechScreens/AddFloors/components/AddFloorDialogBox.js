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
  Box,
  LinearProgress, // Import LinearProgress for loading
} from "@mui/material";
import axios from "axios";
import API_PATHS from "../../../../Config";

const AddFloorDialogBox = ({ openDialog, handleCloseDialog, setRefresh }) => {
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [floorName, setFloorName] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const handleFloorNameChange = (e) => {
    setFloorName(e.target.value);
  };

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!floorName) {
      setError("Floor name is required.");
      return;
    }

    setLoading(true); // Start loading

    try {
      const BuildingId = sessionStorage.getItem("building_id");
      const buildingId = BuildingId; // Static value for building_id
      const floorPosition = parseInt(floorName.split(" ")[1]); // Assuming floor name is in the format "Floor X"
      let floorPlanPath = "";

      // Step 1: Upload the image if an image is selected
      if (selectedImage) {
        const imageFormData = new FormData();
        imageFormData.append("file", selectedImage);

        const uploadResponse = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}${API_PATHS.UPLOAD_FLOOR_IMAGE}`,
          imageFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (uploadResponse.status === 201) {
          floorPlanPath = uploadResponse.data.file_name;
        } else {
          throw new Error("Failed to upload the image.");
        }
      }

      // Step 2: Save the floor details with the floorPlanPath
      const floorData = {
        building_id: buildingId,
        floor_position: floorPosition,
        floor_plan: floorPlanPath || null, // Use the uploaded image path or null if no image
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}${API_PATHS.CREATE_FLOOR}`,
        floorData
      );

      if (response.status === 201) {
        setRefresh(true);
        setFloorName(""); // Clear the floor name field
        setSelectedImage(null); // Clear the selected image
        setError(""); // Clear
        handleCloseDialog(); // Close the dialog after saving
      } else {
        throw new Error("Failed to add floor");
      }
    } catch (err) {
      setError("Failed to save the floor. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <Dialog
      open={openDialog}
      onClose={handleCloseDialog}
      PaperProps={{
        sx: {
          borderRadius: "30px",
          width: "27%", // Keeping original width
          height: "auto", // Adjust height based on content
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
        Add Floor
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
              Floor Name
            </Typography>
            <TextField
              placeholder="Enter Floor Name"
              type="text"
              fullWidth
              value={floorName}
              onChange={handleFloorNameChange}
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

          <FormGroup sx={{ marginTop: "20px" }}>
            <Typography
              color="inherit"
              sx={{
                fontSize: "11px",
                fontWeight: "600",
                marginBottom: "5px",
              }}
            >
              Upload Floor Plan
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Button
                sx={{
                  textTransform: "capitalize",
                  width: "40%",
                  color: "#008080",
                  background: "#B0ECEC",
                  maxHeight: "28px",
                  fontSize: "0.64rem",
                  fontWeight: "600",
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "#8ab2b2",
                  },
                }}
                component="label"
              >
                Choose File
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              <TextField
                placeholder={
                  selectedImage ? selectedImage.name : "No file chosen"
                }
                type="text"
                fullWidth
                required
                InputProps={{
                  style: {
                    color: "white",
                    height: "30px",
                    fontSize: "12px",
                    borderRadius: "10px",
                    backgroundColor: "#27272C",
                  },
                  readOnly: true,
                }}
              />
            </Box>
          </FormGroup>


          {error && (
            <Typography
              color="error"
              variant="body2"
              sx={{ marginTop: "10px" }}
            >
              {error}
            </Typography>
          )}
        </form>
        {loading && <LinearProgress sx={{ marginBottom: "10px",marginTop: "7px" }} />} {/* Loading bar */}

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
          disabled={loading} // Disable button while loading
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

export default AddFloorDialogBox;
