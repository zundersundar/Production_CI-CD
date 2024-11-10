import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNavBar from "../../../components/NavBar/TopNavBar";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Paper,
} from "@mui/material";
import FloorImg from "./components/assets/floor.png";
import SensorCards from "./components/SensorCard";
import AcUnitIcon from '@mui/icons-material/AcUnit';
import OpacityIcon from '@mui/icons-material/Opacity';
import AirIcon from '@mui/icons-material/Air';
import WbIncandescentIcon from '@mui/icons-material/WbIncandescent';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import BoltIcon from '@mui/icons-material/Bolt';
import OpacityTwoToneIcon from '@mui/icons-material/OpacityTwoTone';
import AddFloorPlanDialogBox from "./components/AddFloorPlanDialogBox";
import TempIcon from './components/assets/icons/faTemperatureFull.png';

const FloorPlanPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [sensorPositions, setSensorPositions] = useState([]); // Store positions of added sensors
  const [sensorInfo, setSensorInfo] = useState({}); // Store info about each sensor
  const [sensorName, setSensorName] = useState("");


  const [cards, setCards] = useState([
    { label: "Temperature", bgColor: "#008080", Icon: AcUnitIcon },
    { label: "Humidity", bgColor: "#27272C", Icon: OpacityIcon },
    { label: "HVAC", bgColor: "#27272C", Icon: AirIcon },
    { label: "Light", bgColor: "#27272C", Icon: WbIncandescentIcon },
    { label: "CO2", bgColor: "#27272C", Icon: FilterDramaIcon },
    { label: "Energy", bgColor: "#27272C", Icon: BoltIcon },
    { label: "Water", bgColor: "#27272C", Icon: OpacityTwoToneIcon },
  ]);

  const navigate = useNavigate();
  const cardLength = cards.length;

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const addSensorCard = () => {
    setShowCards(true);
  };

  const handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect(); // Get the bounding box of the image
    const x = e.clientX - rect.left; // X coordinate relative to the image
    const y = e.clientY - rect.top; // Y coordinate relative to the image

    // Prompt user for sensor name and value
    handleOpenDialog();
    const value = Math.floor(Math.random() * (800 - 20 + 1)) + 20;

    if (sensorName && value) {
      // Add the new sensor position with additional info
      setSensorPositions([...sensorPositions, { x, y, sensorName, value }]);
      setSensorInfo(prev => ({ ...prev, [`${x}-${y}`]: { sensorName, value } }));
    }
  };

  const handleRemoveSensor = (index) => {
    const updatedPositions = sensorPositions.filter((_, i) => i !== index);
    setSensorPositions(updatedPositions);
  };

  return (
    <>
      <TopNavBar />
      <Box sx={{ minHeight: "89vh", background: "#1A1A1D" }}>
        <Box
          sx={{
            minHeight: "27vh",
            display: "flex",
            justifyContent: "center",
            paddingTop: "20px",
          }}
        >
          <Box
            sx={{
              background: "#212125",
              width: "65%",
              borderRadius: "30px",
              padding: "20px 40px",
            }}
          >
            <Box sx={{
            display:'flex',
            flexDirection:"row",
            justifyContent:'space-between',
            }}>
            <Typography fontSize="22px" color="#FFFFFF" fontWeight="700" >
              Floor 1
            </Typography>
            <Button 
            onClick={addSensorCard}
            sx={{
                fontSize:'11px',
                textTransform:'capitalize',
                fontWeight:"700",
                background:'white',
                height:'30px',
                width:"120px",
                borderRadius:"10px"
            }}>
                Add Sensors
            </Button>
            </Box>
            <Box sx={{
                display:'flex',
                flexDirection:'row',
                justifyContent:'space-between',
                width:'49%',
                mb:2
            }}>
                <Typography sx={{color: "#8A8A8A"}}>No. of Active Sensors: {cardLength}</Typography>
            </Box>
            <Box sx={{
                display:'flex'
            }}>
                <SensorCards showCards={showCards} addSensorCard={addSensorCard} cards={cards}/>
            </Box>
            
            {/* Image with click handler */}
            <Box sx={{ position: 'relative', cursor: 'pointer' }}>
              <img 
                src={FloorImg} 
                alt="Floor Plan" 
                style={{ width: '100%', height: 'auto' }} 
                onClick={handleImageClick} 
              />
              {sensorPositions.map((position, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'absolute',
                    top: position.y,
                    left: position.x,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <Tooltip
                    title={
                      <Paper 
                        sx={{ padding: '10px', backgroundColor: '#242424', color: '#fff', display: 'flex', flexDirection: 'column' }}
                      >
                        <Typography fontSize="13px" fontWeight="bold">{position.sensorName}</Typography>
                        <Typography fontSize="11px">Value: {position.value}</Typography>
                        <Button
                          onClick={() => handleRemoveSensor(index)}
                          sx={{
                            background: "#B0ECEC",
                            color: "#008080",
                            height:"8px",
                            textTransform: "capitalize",
                            borderRadius: "2px",
                            fontSize: "8px",
                            fontWeight: "600",
                            marginTop:"5px",
                            "&:hover": {
                              backgroundColor: "#8ab2b2",
                            },
                          }}
                        >
                          Remove
                        </Button>
                      </Paper>
                    }
                    placement="top"
                  >
                    <img 
                      src={TempIcon}
                      alt="Sensor Icon" 
                      style={{ width: '24px', height: '24px' }}
                    />
                  </Tooltip>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
      <AddFloorPlanDialogBox
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        sensorName={sensorName}
        setSensorName={setSensorName}
      />
    </>
  );
};

export default FloorPlanPage;
