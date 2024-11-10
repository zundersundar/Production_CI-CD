import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNavBar from "../../../components/NavBar/TopNavBar";
import { Box, Card, Typography, Grid, IconButton } from "@mui/material";
import PlusCircle from "../../../assets/icons/pluscircle.png";
import DeleteIcon from "@mui/icons-material/Delete";
import AddClientDialogBox from "./components/AddClientDialogBox";
import axios from "axios";
import API_PATHS from "../../../Config";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ConfirmDeleteDialog from "../../../components/DialogBox/ConfirmDeleteDialog";

const AddClientsPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [clients, setClients] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null); // Store client object instead of just name
  const navigate = useNavigate();

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL + API_PATHS.GET_CUSTOMER_LIST}`
      );
      const dynamicClients = response.data.map((client) => ({
        id: client.customer_id,
        name: client.customer_name,
        description: `No. of Sites: ${client.sites_count}`,
        image: client.logo
          ? `${process.env.REACT_APP_API_BASE_URL}uploads/customer_logo/${client.logo}`
          : null,
        imageName: client.logo,
        pageLink: `sites`,
      }));
      setClients(dynamicClients);
      setRefresh(false);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [refresh]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDeleteDialog = (client) => {
    setSelectedClient(client); // Store the entire client object for deletion
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedClient(null);
  };

  const handleCardClick = (client) => {
    sessionStorage.setItem("customer_id", client.id);
    navigate(client.pageLink);
  };

  const handleConfirmDelete = async () => {
    if (!selectedClient) return; // Check if a client is selected
    const { id, imageName } = selectedClient;
    setLoading(true);
    
    try {
      // Delete the image if it exists
      if (imageName) {
        try {
          await axios.delete(`${process.env.REACT_APP_API_BASE_URL + API_PATHS.DELETE_CUSTOMER_LOGO_IMAGE}/${imageName}`);
          console.log(`Image ${imageName} deleted successfully`);
        } catch (imageError) {
          console.error(`Failed to delete image ${imageName}:`, imageError);
        }
      }

      // Delete the customer
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL + API_PATHS.DELETE_CUSTOMER_BY_ID}/${id}`);
      console.log(`Customer ${id} deleted successfully`);

      // Refresh the client list after deletion
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error in the delete process:", error);
    } finally {
      setLoading(false);
      handleCloseDeleteDialog(); // Close the dialog after deletion
    }
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
            <Typography fontSize="20px" color="#FFFFFF" fontWeight="700" mb={2}>
              All Clients
            </Typography>
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
                {clients.map((client) => (
                  <Grid item xs={12} sm={6} md={3} key={client.id}>
                    <Card
                      sx={{
                        background: "#27272C",
                        borderRadius: "20px",
                        cursor: "pointer",
                        position: "relative",
                      }}
                    >
                      <Box padding="10px" onClick={() => handleCardClick(client)}>
                        <Box
                          component="img"
                          src={client.image}
                          alt={client.name}
                          sx={{
                            width: "100%",
                            height: "173px",
                            objectFit: "cover",
                            borderRadius: "10px",
                          }}
                        />
                        <Typography fontSize="14px" color="white" fontWeight="700" pl={1} mb={0.2}>
                          {client.name}
                        </Typography>
                        <Typography fontSize="10px" color="gray" pl={1} pb={1}>
                          {client.description}
                        </Typography>
                      </Box>
                      <IconButton
                        sx={{
                          position: "absolute",
                          bottom: "10px",
                          right: "10px",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents triggering card click
                          handleOpenDeleteDialog(client);
                        }}
                      >
                        <DeleteIcon sx={{ color: "white" }} />
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
                      alignItems: "center",
                      justifyContent: "center",
                      height: "35vh",
                      padding: "20px",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <IconButton
                        onClick={handleOpenDialog}
                        aria-label="custom icon"
                      >
                        <img
                          src={PlusCircle}
                          alt="Custom Icon"
                          style={{ width: 60, height: 60 }}
                        />
                      </IconButton>
                      <Typography
                        fontSize="21px"
                        color="#008080"
                        fontWeight="400"
                        textAlign="center"
                      >
                        Add Clients
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        </Box>
      </Box>
      <AddClientDialogBox
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        setRefresh={setRefresh}
      />
      <ConfirmDeleteDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        itemName={selectedClient ? selectedClient.name : ""}
      />
    </>
  );
};

export default AddClientsPage;
