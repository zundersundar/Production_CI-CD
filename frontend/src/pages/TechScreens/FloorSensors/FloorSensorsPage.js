import React, { useState, useEffect } from "react";
import TopNavBar from "../../../components/NavBar/TopNavBar";
import { Box, Card, FormControl, IconButton, MenuItem, Select, Typography } from "@mui/material";
import FloorIcon from './components/images/floor.png'; // Adjust the import path based on your actual image location
import BottomIcon from './components/images/bottom.png';
import TopIcon from './components/images/top.png';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import API_PATHS from "../../../Config";
import WestIcon from "@mui/icons-material/West";

// Static list for notifications
const notificationList = [
  {
    floor_id: 1,
    notifications: ["Water Sensor Triggered", "Smoke Sensor Triggered"]
  },
  {
    floor_id: 2,
    notifications: ["No Notification"]
  },
  // Add notifications for other floors as needed
];

const getNotificationColor = (notification) => {
  if (notification.includes("Water Sensor Triggered")) {
    return "yellow";
  } else if (notification.includes("Smoke Sensor Triggered")) {
    return "red";
  } else {
    return "white";
  }
};

const FloorSensorsPage = () => {
  const navigate = useNavigate();
  const [selectedBuilding, setSelectedBuilding] = useState(""); // Selected building
  const [buildings, setBuildings] = useState([]); // Buildings data for dropdown
  const [floors, setFloors] = useState([]); // State for floors data
  const [loadingFloors, setLoadingFloors] = useState(false);

  // Fetch buildings data from API for the dropdown
  useEffect(() => {
    const fetchBuildings = async () => {
      let SiteId = sessionStorage.getItem("site_id");
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL + API_PATHS.GET_BUILDINGS_BY_SITE_ID}/${SiteId}`);
        const buildingData = response.data;
        setBuildings(buildingData);

        // Set default building to the first one if not already selected in sessionStorage
        let defaultBuilding = sessionStorage.getItem("sensor_building_id") || buildingData[0]?.building_id;
        setSelectedBuilding(defaultBuilding);
        sessionStorage.setItem("sensor_building_id", defaultBuilding); // Store default in sessionStorage
      } catch (error) {
        console.error("Error fetching buildings:", error);
      }
    };

    fetchBuildings();
  }, []);

  // Fetch floor data from API when building is selected
  useEffect(() => {
    const fetchFloorData = async () => {
      let BuildingId = sessionStorage.getItem("sensor_building_id");

      if (BuildingId) {
        setLoadingFloors(true);
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL + API_PATHS.GET_FLOOR_BY_BUILDING_ID}/${BuildingId}`);
          const floorData = response.data;
          setFloors(floorData.reverse()); // Display floors starting from bottom
        } catch (error) {
          console.error("Error fetching floor data:", error);
        } finally {
          setLoadingFloors(false);
        }
      }
    };

    fetchFloorData();
  }, [selectedBuilding]); // Refetch floors when the selected building changes

  // Handle building selection change
  const handleBuildingChange = (event) => {
    const selectedBuildingId = event.target.value;
    setFloors([]);
    setSelectedBuilding(selectedBuildingId);
    sessionStorage.setItem("sensor_building_id", selectedBuildingId); // Update sessionStorage
  };

  const handleBackButtonClick = () => {
    navigate("/tech-dashboard/sensorconfig");
  };

  const handleCardClick = () => {
    console.log("card clicked!!");
    // navigate('/client/lulu/sensors/1');
  };

  return (
    <>
      <TopNavBar />
      <Box sx={{ minHeight: "100vh", background: "#1A1A1D" }}>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            paddingTop: "20px",
            pb: '20px'
          }}
        >
          <Box
            sx={{
              background: "#212125",
              width: "65%",
              borderRadius: "10px",
              padding: "20px 40px",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ width: "100%" }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography fontSize="20px" color="#FFFFFF" fontWeight="700">
                    {selectedBuilding ? `Building: ${buildings.find(b => b.building_id === selectedBuilding)?.building_name}` : 'Select Building'}
                  </Typography>
                  <Typography fontSize="13px" color="#8A8A8A" mt={.1} mb={2}>
                    No. of Floors: {floors.length}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "row" }}>
                  <IconButton
                    sx={{ height: "5px", marginRight: "8px", color: "white" }}
                    onClick={handleBackButtonClick}
                  >
                    <WestIcon />
                  </IconButton>
                  <Typography fontSize="12px" color="#FFFFFF" fontWeight="600" mb={2} mr={1}>
                    Choose Building
                  </Typography>
                  <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                    <Select
                      value={selectedBuilding}
                      onChange={handleBuildingChange}
                      displayEmpty
                      sx={{
                        height: "23px",
                        fontSize: ".7rem",
                        color: "#FFFFFF",
                        background: "#27272C",
                        borderRadius: "5px",
                        "&:hover": { backgroundColor: "#38383d" },
                        ".MuiOutlinedInput-notchedOutline": { border: "none" },
                        ".MuiSelect-select": { padding: "10px", display: "flex", alignItems: "center" },
                        ".MuiSvgIcon-root": { color: "#FFFFFF" },
                      }}
                      IconComponent={(props) => (
                        <span {...props} style={{ color: "#FFFFFF" }}>▼</span>
                      )}
                    >
                      {buildings.map(building => (
                        <MenuItem key={building.building_id} value={building.building_id}>
                          {building.building_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                {loadingFloors ? (
                  <Typography color="white">Loading floors...</Typography>
                ) : (
                  floors.map((floor, index) => {
                    const notificationData = notificationList.find(n => n.floor_id === floor.floor_id) || {};
                    const notifications = notificationData.notifications || ["No Notification"];
                    let image = index === 0 ? TopIcon : (index === floors.length - 1 ? BottomIcon  : FloorIcon);

                    return (
                      <Box key={floor.floor_id} sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <img src={image} alt="Floor Icon" style={{ height: "25vh", width: "100%", objectFit: 'fill', marginRight: '2px' }} />
                        <Card
                          onClick={handleCardClick}
                          sx={{
                            alignContent: 'center',
                            background: "#27272C",
                            borderRadius: "20px",
                            cursor: "pointer",
                            padding: "12px",
                            width: "39.1%",
                            mb: "8px"
                          }}
                        >
                          <Typography fontSize="13px" color="white" fontWeight="700" letterSpacing={0.5}>
                            Total Sensors: {floor.sensors_count}
                          </Typography>
                          <Box mt={.3}>
                            {notifications.map((notification, idx) => (
                              <Typography
                                key={idx}
                                fontSize="10px"
                                color={getNotificationColor(notification)}
                                letterSpacing={0.5}
                              >
                                {notification}
                              </Typography>
                            ))}
                          </Box>
                          <Box sx={{ pr: '10px' }}>
                            <Typography sx={{ fontWeight: '900', fontSize: '35px', textAlign: 'end' }}>{floor.floor_position}</Typography>
                          </Box>
                        </Card>
                      </Box>
                    );
                  })
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default FloorSensorsPage;
