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
  CircularProgress,
  Menu,
  MenuItem as MenuOption,
  ListItemIcon,
} from "@mui/material";
import PlusCircle from "../../../assets/icons/pluscircle.png";
import BuildingIcons from "../../../assets/icons/buildingicon.png";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WestIcon from "@mui/icons-material/West";
import { useNavigate } from "react-router-dom";
import API_PATHS from "../../../Config";
import LoadingSpinner from "../../../components/LoadingSpinner";

const AddBuildingPage = () => {
  const [selectedSite, setSelectedSite] = useState("");
  const [sites, setSites] = useState([]); // State for categories
  const [buildings, setBuildings] = useState([]);
  const [lastId, setLastId] = useState();
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const navigate = useNavigate();

  const open = Boolean(anchorEl);

  // Fetch categories
  useEffect(() => {
    const fetchSites = async () => {
      let CustomerId = sessionStorage.getItem("customer_id");
      try {
        const response = await axios.get(
          `${
            process.env.REACT_APP_API_BASE_URL +
            API_PATHS.GET_SITE_BY_CUSTOMER_ID
          }/${CustomerId}`
        );
        setSites(response.data); // Assuming the API returns a list of categories
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchSites();
  }, []);

  // Fetch buildings based on selected category
  useEffect(() => {
    const fetchBuildings = async () => {
      let SiteId = sessionStorage.getItem("site_id");

      setLoading(true);
      try {
        const response = await axios.get(
          `${
            process.env.REACT_APP_API_BASE_URL +
            API_PATHS.GET_BUILDINGS_BY_SITE_ID
          }/${SiteId}`
        );
        const fetchedBuildings = response.data;

        if (fetchedBuildings.length > 0) {
          const lastBuildingId =
            fetchedBuildings[fetchedBuildings.length - 1].building_id;
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

    fetchBuildings();
  }, [refresh, selectedSite]);

  const handleSiteChange = (event) => {
    setSelectedSite(event.target.value);
  };

  const handleMenuClick = (event, buildingId) => {
    setAnchorEl(event.currentTarget);
    setSelectedBuildingId(buildingId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBuildingId(null);
  };

  const handleViewDashboardClick = () => {
    sessionStorage.setItem("building_id", selectedBuildingId);
    navigate("/client-dashboard/energy-dashboard");
    handleMenuClose();
  };

  const handleBackButtonClick = () => {
    navigate("/client-dashboard/sites");
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
              <Typography
                fontSize="20px"
                color="#FFFFFF"
                fontWeight="700"
                mb={2}
              >
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
                    <MenuOption value="">
                      <em>Select Site</em>
                    </MenuOption>
                    {sites.map((site) => (
                      <MenuOption key={site.id} value={site.site_name}>
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
                      onClick ={handleViewDashboardClick}
                      sx={{
                        background: "#27272C",
                        borderRadius: "20px",
                        cursor: "pointer",
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
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default AddBuildingPage;
