import React, { useState } from "react";
import { Box, Grid, Typography, FormControl, Select, MenuItem, Button, IconButton } from "@mui/material";
import TopNavBar from '../../../components/NavBar/TopNavBar.js'; // Adjust import path as needed
import LoadingSpinner from '../../../components/LoadingSpinner.js'; // Adjust import path as needed
import { useNavigate } from "react-router-dom";
import WestIcon from '@mui/icons-material/West';


const MainDashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false); // Example loading state, adjust based on your logic
  const navigate = useNavigate();
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleViewMoreButton =()=>{
    navigate('/tech-dashboard/view-more')
  }
  
  const handleBackButtonClick = ()=>{
    navigate('/tech-dashboard/buildings')
  }

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
              borderRadius: "10px",
              padding: "20px 30px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Box>
              <Typography fontSize="20px" color="#FFFFFF" fontWeight="700" mb={.2}>
                Building Name
              </Typography>
              <Typography sx={{color:'#8A8A8A'}}>No. of Floors :  7</Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "row" }}>
              <IconButton  sx={{height:"12px",marginRight:"12px",color:"white"}} onClick={handleBackButtonClick}>
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
                    <MenuItem value="">
                      <em>Lulu International</em>
                    </MenuItem>
                    <MenuItem value={10}>Category 1</MenuItem>
                    <MenuItem value={20}>Category 2</MenuItem>
                    <MenuItem value={30}>Category 3</MenuItem>
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
              <Grid container spacing={2} sx={{ justifyContent: 'center', marginTop: '10px' }}>
                {/* First card with Grid size 8 */}
                <Grid item xs={12} md={7}>
                  <Box
                    sx={{
                      width: '100%',
                      height: '200px',
                      borderRadius: '20px',
                      boxShadow: '0 4px 8px rgba(0, 0, 10, 0.2)',
                      overflow: 'hidden',
                    }}
                  >
                    <iframe
                      src="http://3.232.154.213:3000/d-solo/bdwcukuyeqnlsa/trend-analysis?orgId=1&from=1723680000000&to=1724716800000&var-interval=Week&panelId=7"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      title="Grafana Dashboard 1"
                    ></iframe>
                  </Box>
                </Grid>

                {/* Second card with Grid size 5 */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      width: '100%',
                      height: '200px',
                      borderRadius: '20px',
                      boxShadow: '0 4px 8px rgba(0, 0, 10, 0.2)',
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{
                      display:"flex",
                      justifyContent:'center',
                      flexDirection:"column",
                      alignItems:'center',
                      background:'#191919'
                    }}>
                    <iframe
                      src="http://3.232.154.213:3000/d-solo/bdwcukuyeqnlsa/trend-analysis?orgId=1&from=1723680000000&to=1724716800000&var-interval=Week&panelId=9"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      title="Grafana Dashboard 2"
                    ></iframe>
                    <Button
                    onClick={handleViewMoreButton}
                    sx={{
                      width:"50%",
                      height:"25px",
                      marginTop:'15px',
                      marginBottom:"15px",
                      borderRadius:'8px',
                      background:'#008080',
                      color:"black",
                      textTransform:'capitalize',
                      fontSize:'0.8rem',
                      fontWeight:"600"

                    }}>View More</Button>
                    </Box>
                  </Box>
                </Grid>

                {/* Below bigger and wider card */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      width: '69%',
                      height: '570px',
                      borderRadius: '10px',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                      overflow: 'hidden',
                      backgroundColor: '#F0F0F0',
                      marginTop: '10px',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                    }}
                  >
                    <iframe
                      src="http://3.232.154.213:3000/d-solo/ddw62h13xzqwwa/floor-plan?orgId=1&from=1725339762157&to=1725361362157&panelId=2"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      title="Grafana Dashboard Big"
                    ></iframe>
                  </Box>
                </Grid>
              </Grid>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default MainDashboard;
