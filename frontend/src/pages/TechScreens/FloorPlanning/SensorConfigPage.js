import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNavBar from "../../../components/NavBar/TopNavBar";
import {
  Box,
  Typography,
  Button,
  Tooltip,
  Paper,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Snackbar,
} from "@mui/material";
import FloorImg from "./components/assets/floor.png";
import SensorCards from "./components/SensorCard";
import TempImg from "../../../assets/images/greenicons/faTemperatureFull.png";
import DropImg from "../../../assets/images/greenicons/faDroplet.png";
import FanImg from "../../../assets/images/greenicons/faFan.png";
import LightImg from "../../../assets/images/greenicons/faLightbulb.png";
import EnergyImg from "../../../assets/images/greenicons/faBoltLightning.png";
import WindImg from "../../../assets/images/greenicons/faWind.png";
import WaterImg from "../../../assets/images/greenicons/faWater.png";
import TempIcon from "../../../assets/images/whiteicons/faTemperatureFull.png";
import DropIcon from "../../../assets/images/whiteicons/faDroplet.png";
import FanIcon from "../../../assets/images/whiteicons/faFan.png";
import LightIcon from "../../../assets/images/whiteicons/faLight.png";
import EnergyIcon from "../../../assets/images/whiteicons/faEnergy.png";
import WindIcon from "../../../assets/images/whiteicons/faWind.png";
import WaterIcon from "../../../assets/images/whiteicons/faWater.png";
import axios from "axios";
import API_PATHS from "../../../Config";
import LoadingSpinner from "../../../components/LoadingSpinner";
import WestIcon from "@mui/icons-material/West";
import SensorConfigDialog from "./components/AddFloorPlanDialogBox";

const SensorConfigPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [sensorPositions, setSensorPositions] = useState([]);
  const [sensorInfo, setSensorInfo] = useState({});
  const [currentPosition, setCurrentPosition] = useState(null);
  const [sensorName, setSensorName] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [floorList, setFloorList] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState("");
  const [showButton, setShowButton] = useState(false);
  const [floorPosition, setFloorPosition] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedSensor, setDraggedSensor] = useState(null);
  const [draggingSensor, setDraggingSensor] = useState(null); // Track the currently dragged sensor
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hasChanges, setHasChanges] = useState(false);

  const navigate = useNavigate();

  const sensorTypeMapping = {
    Temperature: "Temperature",
    Humidity: "Humidity",
    HVAC: "Fan",
    Light: "Valve",
    CO2: "CO2",
    Energy: "Energy",
    Water: "Water",
  };

  const [cards, setCards] = useState([
    {
      id: 1,
      label: "Temperature",
      bgColor: "#27272C",
      Icon: TempIcon,
      image: TempImg,
    },
    {
      id: 2,
      label: "Humidity",
      bgColor: "#27272C",
      Icon: DropIcon,
      image: DropImg,
    },
    { id: 3, label: "HVAC", bgColor: "#27272C", Icon: FanIcon, image: FanImg },
    {
      id: 4,
      label: "Light",
      bgColor: "#27272C",
      Icon: LightIcon,
      image: LightImg,
    },
    { id: 5, label: "CO2", bgColor: "#27272C", Icon: WindIcon, image: WindImg },
    {
      id: 6,
      label: "Energy",
      bgColor: "#27272C",
      Icon: EnergyIcon,
      image: EnergyImg,
    },
    {
      id: 7,
      label: "Water",
      bgColor: "#27272C",
      Icon: WaterIcon,
      image: WaterImg,
    },
  ]);

  useEffect(() => {
    return () => {
      console.log("SensorPositionChange:::",sensorPositions);
      
    };
  }, [sensorPositions])

  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const BuildingId = sessionStorage.getItem("building_id");
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}${API_PATHS.GET_FLOOR_BY_BUILDING_ID}/${BuildingId}`
        );
        const floors = response.data;
        setFloorList(floors);
        if (floors.length > 0) {
          const firstFloorId = floors[0].floor_id;
          setSelectedFloor(firstFloorId);
          await handleFloorChange({ target: { value: firstFloorId } });
        }
      } catch (error) {
        console.error("Error fetching floor data:", error);
      }
    };

    fetchFloors();
  }, []);

  const handleFloorChange = async (event) => {
    const selectedFloorId = event.target.value;
    setSensorPositions([]);
    setSelectedFloor(selectedFloorId);

    if (!selectedFloorId) {
      setSensorPositions([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}${API_PATHS.GET_SENSORS_BY_FLOOR_ID}/${selectedFloorId}`
      );

      const sensors = response.data.sensors.map((sensor) => ({
        ...sensor,
        x: sensor.x_coordinate,
        y: sensor.y_coordinate,
        image: cards.find(
          (card) => sensorTypeMapping[card.label] === sensor.sensor_type
        )?.image,
      }));
      setFloorPosition(response.data.floor_position);
      setSensorPositions(sensors);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setSnackbarMessage(error.response.data.message || "Floor not found");
      } else {
        setSnackbarMessage("Failed to load sensors for the selected floor.");
      }
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const addSensorCard = () => {
    setShowButton(true);
    setShowCards(true);
  };

  const handleImageClick = (e) => {
    if (!isEditMode) {
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCurrentPosition({ x, y });
      setOpenDialog(true);
    }
  };

  const handleDialogSubmit = () => {
    if (sensorName && currentPosition) {
      const selectedCard = cards[selectedIndex];
      const newSensor = {
        ...currentPosition,
        sensorName,
        value: Math.floor(Math.random() * (800 - 20 + 1)) + 20,
        id: selectedIndex + 1,
        image: selectedCard.image,
      };
      setSensorPositions([...sensorPositions, newSensor]);
      setSensorInfo((prev) => ({
        ...prev,
        [`${currentPosition.x}-${currentPosition.y}`]: {
          sensorName,
          value: newSensor.value,
        },
      }));
      setCurrentPosition(null);
      setSensorName("");
      setOpenDialog(false);
    }
  };

  const handleRemoveSensor = (index) => {
    const updatedPositions = sensorPositions.filter((_, i) => i !== index);
    setSensorPositions(updatedPositions);
  };

  const handleSaveorUpdate = async () => {
    if (sensorPositions.length < 1) {
      setSnackbarMessage("No sensor added! Please add at least one sensor.");
      setSnackbarOpen(true);
      return;
    }
    try {
      setLoading(true);

      if(hasChanges){
      const data = sensorPositions.map((sensor) => {
        const sensorTypeText =
          sensorTypeMapping[
            cards.find((card) => card.id === sensor.id)?.label
          ] || "Unknown";
        return {
          sensor_id:sensor.sensor_id,
          x_coordinate: sensor.x,
          y_coordinate: sensor.y,
        };
      });

      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}${API_PATHS.ADD_MULTIPLE_SENSORS}`,
        data
      );
      setSnackbarMessage("Sensors Updated successfully!");
    }
    else{
      const data = sensorPositions.map((sensor) => {
        const sensorTypeText =
          sensorTypeMapping[
            cards.find((card) => card.id === sensor.id)?.label
          ] || "Unknown";
        return {
          floor_id: selectedFloor,
          sensor_name: sensor.sensorName,
          sensor_type: sensorTypeText,
          value: sensor.value,
          source: "Sensor Network",
          x_coordinate: sensor.x,
          y_coordinate: sensor.y,
        };
      });

      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}${API_PATHS.ADD_MULTIPLE_SENSORS}`,
        data
      );
      setSnackbarMessage("Sensors saved successfully!");
    }


    
      setSnackbarOpen(true);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error saving sensors:", error);
      setSnackbarMessage("Failed to save sensors. Please try again.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
      setHasChanges(false);
    }
  };

  const handleNextButtonClick = () => {
    navigate("/tech-dashboard/sensors");
  };

  const handleCancel = () => {
    setShowCards(false);
    setShowButton(false);
    setOpenDialog(false);
    setIsEditMode(false);
  };

  const handleBackButtonClick = () => {
    navigate("/tech-dashboard/floor");
  };

  const handleEditButton = () => {
    setIsEditMode(!isEditMode);
  };


 const handleMouseDown = (e, index) => {
    if (isEditMode) {
      const sensor = sensorPositions[index];
      setDraggingSensor(index);
      setOffset({
        x: e.clientX - sensor.x,
        y: e.clientY - sensor.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isEditMode && draggingSensor !== null) {
      const newPosition = {
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      };
      setSensorPositions((prevPositions) =>
        prevPositions.map((sensor, index) =>
          index === draggingSensor ? { ...sensor, ...newPosition } : sensor
        )
      );
      setHasChanges(true);
    }
  };

  const handleMouseUp = () => {
    setDraggingSensor(null); // Stop dragging
  };
  

  return (
    <>
      <TopNavBar />
      <Box sx={{ minHeight: "89vh", background: "#1A1A1D" }}>
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
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography fontSize="22px" color="#FFFFFF" fontWeight="700">
                  Floor {floorPosition}
                </Typography>
                <Box>
                  <IconButton
                    sx={{ height: "5px", marginRight: "12px", color: "white" }}
                    onClick={handleBackButtonClick}
                  >
                    <WestIcon />
                  </IconButton>
                  <FormControl
                    variant="outlined"
                    sx={{
                      minWidth: 120,
                      marginRight: "10px",
                      marginTop: "5px",
                    }}
                  >
                    <Select
                      value={selectedFloor}
                      onChange={handleFloorChange}
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
                      {floorList.map((floor) => (
                        <MenuItem key={floor.floor_id} value={floor.floor_id}>
                          Floor {floor.floor_position}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {showButton ? (
                    <>
                      <Button
                        onClick={handleEditButton}
                        sx={{
                          fontSize: "11px",
                          textTransform: "capitalize",
                          fontWeight: "700",
                          background: isEditMode ? "#008080" : "#E5E5E5",
                          color: "black",
                          height: "30px",
                          width: "120px",
                          borderRadius: "10px",
                          marginRight: "10px",
                        }}
                      >
                        {isEditMode ? "Done Editing" : "Edit"}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        sx={{
                          fontSize: "11px",
                          textTransform: "capitalize",
                          fontWeight: "700",
                          background: "#E5E5E5",
                          color: "black",
                          height: "30px",
                          width: "120px",
                          borderRadius: "10px",
                          marginRight: "10px",
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveorUpdate}
                        sx={{
                          fontSize: "11px",
                          textTransform: "capitalize",
                          fontWeight: "700",
                          background: "#008080",
                          color: "black",
                          height: "30px",
                          width: "120px",
                          borderRadius: "10px",
                        }}
                      >
                        {hasChanges ? "Update" : "Save"}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={addSensorCard}
                      sx={{
                        fontSize: "11px",
                        textTransform: "capitalize",
                        fontWeight: "700",
                        background: "white",
                        height: "30px",
                        width: "120px",
                        borderRadius: "10px",
                      }}
                    >
                      Add Sensors
                    </Button>
                  )}
                  <Button
                    onClick={handleNextButtonClick}
                    sx={{
                      fontSize: "11px",
                      textTransform: "capitalize",
                      fontWeight: "700",
                      color: "black",
                      background: "#008080",
                      height: "30px",
                      width: "80px",
                      borderRadius: "10px",
                      marginLeft: "10px",
                    }}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "49%",
                  mb: 2,
                }}
              >
                <Typography sx={{ color: "#8A8A8A" }}>
                  No. of Active Sensors: {sensorPositions.length}
                </Typography>
              </Box>
              <Box sx={{ display: "flex" }}>
                <SensorCards
                  showCards={showCards}
                  cards={cards}
                  selectedIndex={selectedIndex}
                  setSelectedIndex={setSelectedIndex}
                />
              </Box>

              <Box sx={{ position: "relative", cursor: isEditMode ? "move" : "pointer" }} 
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
            <img
              src={selectedFloor ? FloorImg : setLoading(true)}
              alt="Floor Plan"
              style={{ width: "100%", height: "auto" }}
              onClick={!isEditMode ? handleImageClick : undefined}
            />
            {sensorPositions.map((position, index) => (
              <Box
              key={index}
              onMouseDown={(e) => handleMouseDown(e, index)}
                sx={{
                  position: "absolute",
                  top: position.y,
                  left: position.x,
                  transform: "translate(-50%, -50%)",
                  cursor: isEditMode ? 'grab' : 'default',
                }}
              >
                {isEditMode ? (
                  <img
                    src={position.image}
                    alt="Sensor Icon"
                    style={{ width: "26px", height: "26px" }}
                  />
                ) : (
                  <Tooltip
                    title={
                      <Paper
                        sx={{
                          padding: "10px",
                          backgroundColor: "#242424",
                          color: "#fff",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography fontSize="13px" fontWeight="bold">
                          {position.sensorName}
                        </Typography>
                        <Typography fontSize="11px">
                          Value: {position.value}
                        </Typography>
                        <Button
                          onClick={() => handleRemoveSensor(index)}
                          sx={{
                            background: "#B0ECEC",
                            color: "#008080",
                            height: "8px",
                            textTransform: "capitalize",
                            borderRadius: "2px",
                            fontSize: "8px",
                            fontWeight: "600",
                            marginTop: "5px",
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
                      src={position.image}
                      alt="Sensor Icon"
                      style={{ width: "26px", height: "26px" }}
                    />
                  </Tooltip>
                )}
              </Box>
            ))}
          </Box>
            </Box>
          </Box>
        )}
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      <SensorConfigDialog
        openDialog={openDialog}
        handleCloseDialog={() => setOpenDialog(false)}
        sensorName={sensorName}
        setSensorName={setSensorName}
        handleDialogSubmit={handleDialogSubmit}
      />
    </>
  );
};

export default SensorConfigPage;
