import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNavBar from "../../../components/NavBar/TopNavBar";
import { Box, Card, Typography, Grid, IconButton } from "@mui/material";
import PlusCircle from "../../../assets/icons/pluscircle.png";
import axios from "axios";
import API_PATHS from "../../../Config";
import LoadingSpinner from "../../../components/LoadingSpinner"; // Import the LoadingSpinner component

const AddClientsPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [clients, setClients] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

   // Fetch client data from backend API
   const fetchClients = async () => {
    setLoading(true); // Start loading
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL + API_PATHS.GET_CUSTOMER_LIST}`
      );
      const dynamicClients = response.data.map((client) => ({
        id: client.customer_id,
        name: client.customer_name,
        description: `No. of Sites: ${client.sites_count}`,
        image: client.logo ? `${process.env.REACT_APP_API_BASE_URL}uploads/customer_logo/${client.logo}` : null, // Add full path
        pageLink: `sites`,
      }));
      setClients(dynamicClients); // Set clients with the data fetched from the API
      setRefresh(false);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    fetchClients();
  }, [refresh]);



  const handleCardClick = (client) => {
    sessionStorage.setItem("customer_id",client.id)
    navigate(client.pageLink);
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
                      }}
                      onClick={() => handleCardClick(client)}
                    >
                      <Box padding="10px">
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
                        <Typography
                          fontSize="14px"
                          color="white"
                          fontWeight="700"
                          pl={1}
                          mb={0.2}
                        >
                          {client.name}
                        </Typography>
                        <Typography fontSize="10px" color="gray" pl={1} pb={1}>
                          {client.description}
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

export default AddClientsPage;
