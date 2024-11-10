import React, { useState, useEffect } from "react";
import axios from "axios";
import TopNavBar from "../../../components/NavBar/TopNavBar";
import {
  Box,
  Card,
  Typography,
  Grid,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Menu,
  MenuItem as MenuOption,
  ListItemIcon,
} from "@mui/material";
import PlusCircle from "../../../assets/icons/pluscircle.png";
import AddBuildingDialogBox from "../AddBuildings/components/AddBuildingDialogBox";
import BuildingIcons from "../../../assets/icons/buildingicon.png";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DeleteIcon from "@mui/icons-material/Delete";
import WestIcon from "@mui/icons-material/West";
import { useNavigate } from "react-router-dom";
import API_PATHS from "../../../Config";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ConfirmDeleteDialog from "../../../components/DialogBox/ConfirmDeleteDialog"; // Import your confirmation dialog component

const AddBuildingPage = () => {
  const [selectedSite, setSelectedSite] = useState("");
  const [sites, setSites] = useState([]); 
  const [buildings, setBuildings] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [lastId, setLastId] = useState();
  const [refresh, setRefresh] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // State for delete dialog
  const [buildingToDelete, setBuildingToDelete] = useState(null); // State to hold building to delete
  const navigate = useNavigate();
  const [siteId, setSiteId] = useState(sessionStorage.getItem("site_id") || "");
  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchBuildings = async () => {
      if (!siteId) return;
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL + API_PATHS.GET_BUILDINGS_BY_SITE_ID}/${siteId}`
        );
        const fetchedBuildings = response.data;

        if (fetchedBuildings.length > 0) {
          const lastBuildingId = fetchedBuildings[fetchedBuildings.length - 1].building_id;
          setLastId(lastBuildingId);
        }

        const formattedBuildings = fetchedBuildings.map((building) => ({
          id: building.building_id,
          image: BuildingIcons,
          name: building.building_name,
          description: `No. of floors: ${building.floors_count}`,
        }));

        setBuildings(formattedBuildings);
      } catch (error) {
        console.error("Error fetching buildings:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSites = async () => {
      let CustomerId = sessionStorage.getItem("customer_id");
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL + API_PATHS.GET_SITE_BY_CUSTOMER_ID}/${CustomerId}`
        );
        const defaultSite = response.data.find(
          (site) => site.site_id === parseInt(siteId, 10)
        );
        setSelectedSite(defaultSite?.site_name || "");
        setSites(response.data);
      } catch (error) {
        console.error("Error fetching sites:", error);
      }
    };

    fetchSites();
    if (siteId) {
      fetchBuildings();
    }
  }, [refresh, siteId]);

  const handleSiteChange = (event) => {
    const selectedSiteName = event.target.value;
    const selectedSite = sites.find((site) => site.site_name === selectedSiteName);

    if (selectedSite) {
      setSelectedSite(selectedSiteName);
      sessionStorage.setItem("site_id", selectedSite.site_id); 
      setSiteId(selectedSite.site_id); 
      setBuildings([]);
      setRefresh(Date.now()); 
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleMenuClick = (event, buildingId) => {
    setAnchorEl(event.currentTarget);
    setSelectedBuildingId(buildingId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBuildingId(null);
  };

  const handleConfigureClick = () => {
    sessionStorage.setItem("building_id", selectedBuildingId);
    sessionStorage.setItem("sensor_building_id", selectedBuildingId);
    navigate("/tech-dashboard/floor");
    handleMenuClose();
  };

  const handleViewDashboardClick = () => {
    sessionStorage.setItem("building_id", selectedBuildingId);
    sessionStorage.setItem("sensor_building_id", selectedBuildingId);
    navigate("/tech-dashboard/energy-dashboard");
    handleMenuClose();
  };

  const handleBackButtonClick = () => {
    navigate("/tech-dashboard/sites");
  };

  const handleOpenDeleteDialog = (building) => {
    setBuildingToDelete(building); // Set the building to delete
    setOpenDeleteDialog(true); // Open the delete confirmation dialog
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false); // Close the delete confirmation dialog
    setBuildingToDelete(null); // Reset the building to delete
  };

  const handleConfirmDelete = async () => {
    if (buildingToDelete) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_BASE_URL + API_PATHS.DELETE_BUILDING_BY_BUILDING_ID}/${buildingToDelete.id}`
        );
        setRefresh(Date.now()); // Refresh the building list
      } catch (error) {
        console.error("Error deleting building:", error);
      } finally {
        handleCloseDeleteDialog(); // Close the dialog after deletion
      }
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
              borderRadius: "10px",
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
              <Typography fontSize="20px" color="#FFFFFF" fontWeight="700" mb={2}>
                Buildings
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "row" }}>
                <IconButton
                  sx={{ height: "12px", marginRight: "12px", color: "white" }}
                  onClick={handleBackButtonClick}
                >
                  <WestIcon />
                </IconButton>
                <Typography
                  fontSize="12px"
                  color="#FFFFFF"
                  fontWeight="600"
                  mb={2}
                  mr={1}
                >
                  Choose Sites
                </Typography>
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <Select
                    value={selectedSite}
                    onChange={handleSiteChange}
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
                    {sites.map((site) => (
                      <MenuOption key={site.site_id} value={site.site_name}>
                        {site.site_name}
                      </MenuOption>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
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
                {buildings.map((building) => (
                  <Grid item xs={12} sm={6} md={3} key={building.id}>
                    <Card
                      sx={{
                        background: "#27272C",
                        borderRadius: "20px",
                        position: "relative",
                      }}
                    >
                      <Box padding="20px 15px 7px 16px">
                        <Box
                          component="img"
                          src={building.image}
                          alt={building.name}
                          pl={1.4}
                          sx={{
                            width: "35%",
                            height: "74px",
                            borderRadius: "10px",
                          }}
                        />
                        <Typography
                          fontSize="13px"
                          color="white"
                          fontWeight="700"
                          pl={1}
                          mt={1.2}
                          mb={0.5}
                          letterSpacing={0.5}
                        >
                          {building.name}
                        </Typography>
                        <Typography
                          fontSize="10px"
                          color="gray"
                          pl={1}
                          pb={1}
                          letterSpacing={0.5}
                        >
                          {building.description}
                        </Typography>
                      </Box>
                      <IconButton
                        sx={{
                          position: "absolute",
                          top: 5,
                          right: 5,
                          color: "#FFFFFF",
                        }}
                        onClick={(event) => handleMenuClick(event, building.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <IconButton
                        sx={{
                          position: "absolute",
                          bottom: 5,
                          right: 5,
                          color: "white",
                        }}
                        onClick={() => handleOpenDeleteDialog(building)} // Open delete confirmation dialog
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Card>
                  </Grid>
                ))}
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      background: "transparent",
                      border: "2px dashed #FFFFFF",
                      borderColor: "#008080",
                      borderRadius: "20px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "21.3vh",
                      padding: "20px",
                    }}
                  >
                    <IconButton
                      onClick={handleOpenDialog}
                      aria-label="add building"
                    >
                      <img
                        src={PlusCircle}
                        alt="Add Building"
                        style={{ width: 55, height: 55 }}
                      />
                    </IconButton>
                    <Typography
                      fontSize="22px"
                      color="#008080"
                      fontWeight="400"
                      textAlign="center"
                    >
                      Add Building
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        </Box>
      </Box>
      <AddBuildingDialogBox
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        setRefresh={setRefresh}
      />
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          style: {
            borderRadius: "10px",
            width: "200px",
            backgroundColor: "#27272C",
            color: "#FFFFFF",
          },
        }}
      >
        <MenuOption
          onClick={handleConfigureClick}
          sx={{
            fontSize: "16px",
            "&:hover": {
              backgroundColor: "#38383d", 
              transition: "background-color 0.3s ease", 
            },
          }}
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" style={{ color: "#FFFFFF" }} />
          </ListItemIcon>
          Configure
        </MenuOption>
        <MenuOption
          onClick={handleViewDashboardClick}
          sx={{
            fontSize: "16px",
            "&:hover": {
              backgroundColor: "#38383d", 
              transition: "background-color 0.3s ease", 
            },
          }}
        >
          <ListItemIcon>
            <DashboardIcon fontSize="small" style={{ color: "#FFFFFF" }} />
          </ListItemIcon>
          Energy Dashboard
        </MenuOption>
      </Menu>

      {/* Confirmation dialog for deletion */}
      <ConfirmDeleteDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        itemName ={buildingToDelete ? buildingToDelete.name : ""}
      />
    </>
  );
};

export default AddBuildingPage;
