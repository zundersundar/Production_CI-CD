import React, { useState, useEffect } from "react";
import TopNavBar from "../../../components/NavBar/TopNavBar";
import {
  Box,
  Card,
  Typography,
  Grid,
  IconButton,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import PlusCircle from "../../../assets/icons/pluscircle.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import WestIcon from '@mui/icons-material/West';
import API_PATHS from "../../../Config.js";
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingSpinner from '../../../components/LoadingSpinner.js';

const AddFloorPage = () => {
  const [floors, setFloors] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(false);

  const navigate = useNavigate();

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);
  const handleSkipButton = () => navigate("/client-dashboard/floorplan");
  const handleBackButtonClick = () => navigate('/client-dashboard/buildings');

  const handleDeleteButton = async (floorId) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL + API_PATHS.DELETE_FLOOR}/${floorId}`

      );

      if (response.status === 200) {
        console.log(`Floor ${floorId} deleted successfully`);
        setRefresh(prev => !prev); // Toggle refresh to reload the floor list
      } else {
        setError("Failed to delete the floor.");
      }
    } catch (err) {
      console.error("Error deleting floor:", err);
      setError("An error occurred while trying to delete the floor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFloors = async () => {
      let BuildingId = sessionStorage.getItem("building_id");
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL + API_PATHS.GET_FLOOR_BY_BUILDING_ID}/${BuildingId}`
        );

        if (response.status === 200 && response.data.floors) {
          const fetchedFloors = response.data.floors.map((floor) => ({
            id: floor.floor_id,
            name: `Floor ${floor.floor_position}`,
            imageFile: null, // To store new uploaded image
            imageUrl: floor.floor_plan,
          }));
          setFloors(fetchedFloors);
          setRefresh(false);
        } else {
          setError("Failed to fetch floors data.");
        }
      } catch (err) {
        console.error("Error fetching floors:", err);
        setError("An error occurred while fetching floors data.");
      } finally {
        setLoading(false);
      }
    };

    fetchFloors();
  }, [refresh]);

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      const currentTime = new Date().toISOString();
      const buildingId = 1; // Static value for building_id
      let nextFloorId = floors.length + 1; // Start floor_id from 1

      floors.forEach((floor) => {
        const floorData = {
          floor_id: nextFloorId++,
          building_id: buildingId,
          floor_position: parseInt(floor.name.split(" ")[1]), // Extract floor position from floor name
          sensor_count: 1, // Static value for sensor_count
          last_updated: currentTime,
          floor_plan: floor.imageUrl,
        };

        if (floor.imageFile) {
          formData.append("images[]", floor.imageFile);
        }
        formData.append("floors[]", JSON.stringify(floorData));
      });

      await axios.post(`${process.env.REACT_APP_API_BASE_URL}${API_PATHS.CREATE_FLOOR}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Redirect or notify the user
      // navigate('/client-dashboard/floorplan');
    } catch (error) {
      console.error("Failed to save floors:", error);
      setError("Failed to save floors data.");
    } finally {
      setLoading(false);
    }
  };

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
                          component="label"
                        >
                          Choose File
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              setFloors((prevFloors) => {
                                const newFloors = [...prevFloors];
                                newFloors[index] = {
                                  ...newFloors[index],
                                  imageFile: file,
                                };
                                return newFloors;
                              });
                            }}
                          />
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
                          onClick={() => handleDeleteButton(floor.id)} // Fix: Call function correctly
                          sx={{ background: "black" }}
                        >
                          <DeleteIcon sx={{ color: 'white' }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
            <Button
              sx={{
                marginTop: "20px",
                textTransform: "capitalize",
                width: "9%",
                marginLeft: "4px",
                color: "#008080",
                background: "#B0ECEC",
                maxHeight: "28px",
                fontSize: "0.64rem",
                fontWeight: "600",
                borderRadius: "8px",
                float: "right",
                "&:hover": {
                  backgroundColor: "#8ab2b2",
                },
              }}
              onClick={handleSave}
              disabled={loading}
            >
              Save
            </Button>
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
              Skip
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default AddFloorPage;
