import React, { useState } from "react";
import TopNavBar from "../../../components/NavBar/TopNavBar";
import { Box, Card, Container, FormControl, MenuItem, Select, Typography } from "@mui/material";
import FloorIcon from './components/images/floor.png'; // Adjust the import path based on your actual image location
import BottomIcon from './components/images/bottom.png';
import TopIcon from './components/images/top.png';
import { useNavigate } from "react-router-dom";

const sensors = [
  {
    id: 1,
    name: "Total Sensors : 10",
    notifications: ["No Notification"],
  },
  {
    id: 2,
    name: "Total Sensors : 10",
    notifications: ["No Notification"],
  },
  {
    id: 3,
    name: "Total Sensors : 10",
    notifications: ["No Notification"],
  },
  {
    id: 4,
    name: "Total Sensors : 10",
    notifications: ["Water Sensor Triggered", "Smoke Sensor Triggered"],
  },
  {
    id: 5,
    name: "Total Sensors : 10",
    notifications: ["Water Sensor Triggered", "Smoke Sensor Triggered"],
  },
  {
    id: 6,
    name: "Total Sensors : 10",
    notifications: ["No Notification"],
  },
  {
    id: 7,
    name: "Total Sensors : 11",
    notifications: ["No Notification"],
  },
  // {
  //   id: 7,
  //   name: "Total Sensors : 10",
  //   notifications: ["No Notification"],
  // },
  // {
  //   id:8,
  //   name: "Total Sensors : 10",
  //   notifications: ["No Notification"],
  // },


  // Add more sensors as needed
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
  const [selectedCategory, setSelectedCategory] = useState("");

  
const handleCardClick = () => {
  navigate('/client/lulu/sensors/1');
};


  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
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
            pb:'20px'
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
              <Typography
                fontSize="20px"
                color="#FFFFFF"
                fontWeight="700"
              >
                Building Name
              </Typography>
              <Typography
                fontSize="13px"
                color="#8A8A8A"
                mt={.1}
                mb={2}
              >
                No. of Floors: 7
              </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "row" }}>
                <Typography
                  fontSize="12px"
                  color="#FFFFFF"
                  fontWeight="600"
                  mb={2}
                  mr={1}
                >
                  Choose Building
                </Typography>

                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <Select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    placeholder="Category"
                    displayEmpty
                    sx={{
                      height: "23px",
                      fontSize: ".7rem",
                      color: "#FFFFFF",
                      background: "#27272C",
                      borderRadius: "5px",
                      "&:hover": {
                        backgroundColor: "#38383d",
                      },
                      ".MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      ".MuiSelect-select": {
                        padding: "10px",
                        display: "flex",
                        alignItems: "center",
                      },
                      ".MuiSvgIcon-root": {
                        color: "#FFFFFF",
                      },
                    }}
                    IconComponent={(props) => (
                      <span {...props} style={{ color: "#FFFFFF" }}>
                        ▼
                      </span>
                    )}
                  >
                    <MenuItem value="">
                      <em>Lulu Corperate Office</em>
                    </MenuItem>
                    <MenuItem value={10}>Category 1</MenuItem>
                    <MenuItem value={20}>Category 2</MenuItem>
                    <MenuItem value={30}>Category 3</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                {sensors.slice(0).reverse().map((sensor, index) => {
                  let image;
                  if (index === 0) {
                    image = TopIcon;
                  } else if (index === sensors.length - 1) {
                    image = BottomIcon;
                  } else {
                    image = FloorIcon;
                  }
                  return (
                    <Box key={sensor.id} sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                      <img src={image} alt="Floor Icon" style={{ height: "25vh", width: "100%", objectFit: 'cover' ,marginRight:'2px'}} />
                      <Card
                        onClick = {handleCardClick}
                        sx={{
                          alignContent:'center',
                          background: "#27272C",
                          borderRadius: "20px",
                          cursor: "pointer",
                          padding: "12px",
                          width: "39.1%",
                          mb: "8px"
                        }}
                      >
                        <Typography
                          fontSize="13px"
                          color="white"
                          fontWeight="700"
                          letterSpacing={0.5}
                        >
                          {sensor.name}
                        </Typography>
                        <Box mt={.3}>
                        {sensor.notifications.map((notification, idx) => (
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
                        <Box sx={{pr:'10px'}}>
                        <Typography sx={{fontWeight:'900' ,fontSize:'35px', textAlign:'end'}}>{sensor.id - 1}</Typography>
                        </Box>
                      </Card>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default FloorSensorsPage;
