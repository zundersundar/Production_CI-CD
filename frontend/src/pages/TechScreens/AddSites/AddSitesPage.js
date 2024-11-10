import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import PlusCircle from "../../../assets/icons/pluscircle.png";
import AddSiteDialogBox from "../AddSites/components/AddSiteDialogBox";
import SiteIcon from "../../../assets/icons/siteicon.png";
import WestIcon from "@mui/icons-material/West";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_PATHS from "../../../Config";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ConfirmDeleteDialog from "../../../components/DialogBox/ConfirmDeleteDialog";

const AddSitesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [sites, setSites] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(Date.now());
  const [customerId, setCustomerId] = useState(sessionStorage.getItem("customer_id") || "");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSite, setSelectedSite] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSites = async () => {
      if (!customerId) {
        console.error("Customer ID is not available.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL + API_PATHS.GET_SITE_BY_CUSTOMER_ID}/${customerId}`
        );

        if (response.status === 200 && response.data && response.data.length > 0) {
          const apiSites = response.data.map((site) => ({
            id: site.site_id,
            name: site.site_name,
            description: `No. of Buildings: ${site.buildings_count}`,
            pageLink: "/tech-dashboard/buildings",
          }));
          setSites(apiSites);
        } else {
          console.warn("No sites found for the given customer ID.");
          setSites([]);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.warn("Customer not found in the database.");
          setSites([]);
        } else {
          console.error("Error fetching sites:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}${API_PATHS.GET_CUSTOMER_LIST}`
        );
        const defaultCustomer = response.data.find(
          (customer) => customer.customer_id === parseInt(customerId, 10)
        );
        setSelectedCategory(defaultCustomer?.customer_name || "");
        setCustomerList(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
    fetchSites();
  }, [refresh, customerId]);

  const handleCategoryChange = (event) => {
    const selectedCustomer = customerList.find(
      (customer) => customer.customer_name === event.target.value
    );

    if (selectedCustomer) {
      setCustomerId(selectedCustomer.customer_id);
      sessionStorage.setItem("customer_id", selectedCustomer.customer_id);
      setSelectedCategory(event.target.value);
      setRefresh(Date.now());
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCardClick = (site) => {
    sessionStorage.setItem("site_id", site.id);
    navigate(site.pageLink);
  };

  const handleOpenDeleteDialog = (site) => {
    setSelectedSite(site);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedSite(null);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL + API_PATHS.DELETE_SITE_BY_SITE_ID}/${selectedSite.id}`
      );
      if (response.status === 200) {
        setRefresh(Date.now());
      }
    } catch (error) {
      console.error("Error deleting site:", error);
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleBackButtonClick = () => {
    navigate("/tech-dashboard");
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
              borderRadius: "10px",
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
                All Sites
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "row" }}>
                <IconButton
                  sx={{ height: "12px", marginRight: "12px", color: "white" }}
                  onClick={handleBackButtonClick}
                >
                  <WestIcon />
                </IconButton>
                <Typography fontSize="12px" color="#FFFFFF" fontWeight="600" mb={2} mr={1}>
                  Choose Clients
                </Typography>
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <Select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
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
                    {customerList.map((customer) => (
                      <MenuItem key={customer.customer_id} value={customer.customer_name}>
                        {customer.customer_name}
                      </MenuItem>
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
                {sites.map((site) => (
                  <Grid item xs={12} sm={6} md={3} key={site.id}>
                    <Card
                      sx={{
                        background: "#27272C",
                        borderRadius: "20px",
                        cursor: "pointer",
                        position: "relative",
                      }}
                      onClick={() => handleCardClick(site)}
                    >
                      <IconButton
                        sx={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                          color: "white",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDeleteDialog(site);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>

                      <Box padding="20px 15px 7px 12px">
                        <Box
                          component="img"
                          src={SiteIcon}
                          alt={site.name}
                          pl={1}
                          sx={{
                            width: "46%",
                            height: "75px",
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
                          {site.name}
                        </Typography>
                        <Typography
                          fontSize="10px"
                          color="gray"
                          pl={1}
                          pb={1}
                          letterSpacing={0.5}
                        >
                          {site.description}
                        </Typography>
                      </Box>
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
                    <IconButton onClick={handleOpenDialog} aria-label="add site">
                      <img src={PlusCircle} alt="Add Site" style={{ width: 55, height: 55 }} />
                    </IconButton>
                    <Typography fontSize="22px" color="#008080" fontWeight="400" textAlign="center">
                      Add Site
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        </Box>
        <AddSiteDialogBox
          openDialog={openDialog}
          handleCloseDialog={handleCloseDialog}
          setRefresh={setRefresh}
        />
        <ConfirmDeleteDialog
          open={openDeleteDialog}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
          itemName={selectedSite ? selectedSite.name : ""}
        />
      </Box>
    </>
  );
};

export default AddSitesPage;
