import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormGroup,
  Box,
  TextField,
} from "@mui/material";
import axios from "axios";
import API_PATHS from "../../../../Config";

const UpdateFloorDialogBox = ({
  openUpdateDialog,
  handleCloseUpdateDialog,
  selectedFloor,
  selectedCurrentFloorPlan, 
  setRefresh,
}) => {
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const floorId = selectedFloor;
      let floorPlanPath = null;

      // Step 1: Delete the current image if a new image is selected
      if (selectedImage && selectedCurrentFloorPlan) {
        console.log("currentFloorPlan",selectedCurrentFloorPlan)
        const deleteResponse = await axios.delete(
          `${process.env.REACT_APP_API_BASE_URL}${API_PATHS.DELETE_FLOOR_IMAGE}/${selectedCurrentFloorPlan}`
        );

        if (deleteResponse.status !== 200) {
          throw new Error("Failed to delete the current floor plan image.");
        }
      }

      // Step 2: Upload the new image if selected
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
          floorPlanPath = uploadResponse.data.file_name; // Get new file path
        } else {
          throw new Error("Failed to upload the new image.");
        }
      }

      // Step 3: Update the floor with the new floor plan path
      const updatedFloorData = {
        floor_plan: floorPlanPath || null, // Use new image or keep existing one
      };

      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}${API_PATHS.UPDATE_FLOOR}/${floorId}`,
        updatedFloorData
      );

      if (response.status === 200) {
        setRefresh(true); // Trigger data refresh in parent component
        setSelectedImage(null); // Clear the selected image
        setError(""); // Clear error
        handleCloseUpdateDialog(); // Close the dialog after updating
      } else {
        throw new Error("Failed to update floor.");
      }
    } catch (err) {
      console.error("Error updating floor:", err);
      setError("Failed to update the floor. Please try again.");
    }
  };

  return (
    <Dialog
      open={openUpdateDialog}
      onClose={handleCloseUpdateDialog}
      PaperProps={{
        sx: {
          borderRadius: "30px",
          width: "27%",
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
        Update Floor
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: "#212125", color: "#e4eaed" }}>
        <form onSubmit={handleSubmit}>
          <FormGroup sx={{ marginTop: "5px" }}>
            <Typography
              color="inherit"
              sx={{
                fontSize: "11px",
                fontWeight: "600",
                marginBottom: "6px",
              }}
            >
              Upload New Floor Plan
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
                placeholder={selectedImage ? selectedImage.name : "No file chosen"}
                type="text"
                fullWidth
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
            <Typography color="error" variant="body2" sx={{ marginTop: "10px" }}>
              {error}
            </Typography>
          )}
        </form>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: "#212125", marginTop: "8px" }}>
        <Button
          onClick={handleCloseUpdateDialog}
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
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateFloorDialogBox;
