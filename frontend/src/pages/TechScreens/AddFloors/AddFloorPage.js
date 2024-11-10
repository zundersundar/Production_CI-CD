import React, { useState, useEffect } from "react";
import TopNavBar from "../../../components/NavBar/TopNavBar";
import {
  Box,
  Card,
  Typography,
  Grid,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
  Button
} from "@mui/material";
import PlusCircle from "../../../assets/icons/pluscircle.png";
import AddFloorDialogBox from "../AddFloors/components/AddFloorDialogBox";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import WestIcon from '@mui/icons-material/West';
import API_PATHS from "../../../Config.js";
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingSpinner from '../../../components/LoadingSpinner.js';
import UpdateFloorDialogBox from "./components/UpdateFloorDialogBox.js";
import ConfirmDeleteDialog from "../../../components/DialogBox/ConfirmDeleteDialog.js"; // Import your confirmation dialog

const AddFloorPage = () => {
  const [floors, setFloors] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedCurrentFloorPlan, setSelectedCurrentFloorPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // State for delete confirmation dialog
  const [floorToDelete, setFloorToDelete] = useState(null); // Track the floor ID to delete

  const navigate = useNavigate();

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);
  const handleOpenUpdateDialog = (floorId, floorPlan) => {
    setSelectedCurrentFloorPlan(floorPlan);
    setSelectedFloor(floorId);
    setOpenUpdateDialog(true);
  };
  const handleCloseUpdateDialog = () => setOpenUpdateDialog(false);
  const handleSkipButton = () => navigate("/tech-dashboard/sensorconfig");
  const handleBackButtonClick = () => navigate('/tech-dashboard/buildings');

  const handleDeleteButton = (floor) => {
    setFloorToDelete(floor); // Store the floor ID to delete
    setOpenDeleteDialog(true); // Open the confirmation dialog
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL + API_PATHS.DELETE_FLOOR}/${floorToDelete.id}`
      );

      if (response.status === 200) {
        console.log(`Floor ${floorToDelete} deleted successfully`);
        setRefresh(prev => !prev); // Refresh the floor list
      } else {
        setError("Failed to delete the floor.");
      }
    } catch (err) {
      console.error("Error deleting floor:", err);
      setError("An error occurred while trying to delete the floor.");
    } finally {
      setLoading(false);
      setOpenDeleteDialog(false); // Close the confirmation dialog
    }
  };

  useEffect(() => {
    const fetchFloors = async () => {
      let BuildingId = sessionStorage.getItem("building_id");
      setRefresh(false);
      setLoading(true);
      setError(""); // Clear any previous error
  
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL + API_PATHS.GET_FLOOR_BY_BUILDING_ID}/${BuildingId}`
        );
  
        if (response.status === 200) {
          if (response.data && response.data.length > 0) {
            const fetchedFloors = response.data.map((floor) => ({
              id: floor.floor_id,
              name: `Floor ${floor.floor_position}`,
              imageFile: null, // To store new uploaded image
              imageUrl: floor.floor_plan,
            }));
            setFloors(fetchedFloors);
          } else {
            setError("No floors found for this building.");
            setFloors([]);
          }
        } else {
          setError("Failed to fetch floors data.");
        }
      } catch (err) {
        if (err.response) {
          const errorMessage = err.response.data.message || "An error occurred.";
          setError(errorMessage);
        } else {
          setError("An error occurred while fetching floors data.");
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchFloors();
  }, [refresh]);

  return (
    <>
      <TopNavBar />
      <Box sx={{ minHeight: "89vh", background: "#1A1A1D" }}>
        <Box
          sx={{
            minHeight: "28vh",
            display: "flex",
            justifyContent: "center",
            paddingTop: "20px",
          }}
        >
          <Box
            sx={{
              background: "#212125",
              width: "65%",
              borderRadius: "15px",
              padding: "20px 40px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Typography
                fontSize="20px"
                color="#FFFFFF"
                fontWeight="700"
                mb={2}
              >
                Building Name
              </Typography>
              <IconButton sx={{ height: "12px", marginRight: "12px", color: "white" }} onClick={handleBackButtonClick}>
                <WestIcon />
              </IconButton>
            </Box>

            {/* Error Handling */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Loading Spinner */}
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "50vh",
                }}
              >
                <LoadingSpinner />
              </Box>
            ) : (
              <Grid container spacing={2}>
                {floors.map((floor, index) => (
                  <Grid item xs={12} sm={6} md={4} key={floor.id}>
                    <Box>
                      <Typography
                        style={{
                          fontSize: "11px",
                          fontWeight: "600",
                        }}
                        color="white"
                      >
                        {floor.name}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: "5px",
                        }}
                      >
                        <Button
                          sx={{
                            textTransform: "capitalize",
                            width: "41%",
                            color: "#008080",
                            background: "#B0ECEC",
                            maxHeight: "28px",
                            textWrap: 'nowrap',
                            fontSize: "0.6rem",
                            fontWeight: "600",
                            borderRadius: "8px",
                            "&:hover": {
                              backgroundColor: "#8ab2b2",
                            },
                          }}
                          onClick={() => handleOpenUpdateDialog(floor.id, floor.imageUrl)} // Open update dialog
                        >
                          Update
                        </Button>
                        <TextField
                          placeholder={
                            floor.imageUrl
                              ? floor.imageUrl.split("/").pop()
                              : "No file chosen"
                          }
                          type="text"
                          fullWidth
                          required
                          value={floor.imageFile ? floor.imageFile.name : ""}
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
                        <IconButton 
                         onClick={() => handleDeleteButton(floor)} // Open delete confirmation dialog
                         sx={{ background: "black" }}
                        >
                          <DeleteIcon sx={{ color: 'white' }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>
                ))}
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      background: "transparent",
                      border: "2px dashed #FFFFFF",
                      borderColor: "#008080",
                      borderRadius: "20px",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "5px",
                      padding: "20px",
                    }}
                  >
                    <IconButton onClick={handleOpenDialog} aria-label="add floor">
                      <img
                        src={PlusCircle}
                        alt="Add Floor"
                        style={{ width: 24, height: 24 }}
                      />
                    </IconButton>
                    <Typography
                      fontSize="12px"
                      color="#008080"
                      textAlign="center"
                    >
                      Add Floor
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            )}
            <Button
              sx={{
                marginTop: "20px",
                textTransform: "capitalize",
                width: "9%",
                color: "black",
                background: "#008080",
                maxHeight: "28px",
                fontSize: "0.64rem",
                fontWeight: "600",
                borderRadius: "8px",
                float: "right",
                "&:hover": {
                  backgroundColor: "#07adab",
                },
              }}
              onClick={handleSkipButton}
              disabled={loading}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Box>
      <AddFloorDialogBox
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        floors={floors}    
        setRefresh={setRefresh}
      />
      {/* Update Floor Dialog Box */}
      <UpdateFloorDialogBox
        openUpdateDialog={openUpdateDialog}
        handleCloseUpdateDialog={handleCloseUpdateDialog}
        selectedCurrentFloorPlan={selectedCurrentFloorPlan}
        selectedFloor={selectedFloor}
        setRefresh={setRefresh}
      />
      {/* Confirmation Delete Dialog */}
      <ConfirmDeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        itemName = {floorToDelete ? floorToDelete.name : ""}
        
      />
    </>
  );
};

export default AddFloorPage;
