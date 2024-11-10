import React, { useState } from 'react';
import { Grid, Box, Typography, FormControl, Select, MenuItem, IconButton, Button } from '@mui/material';
import TopNavBar from '../../../components/NavBar/TopNavBar'; // Adjust the path as needed
import WestIcon from '@mui/icons-material/West';
import { useNavigate } from 'react-router-dom';

const UsageView = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("");

  const dashboards = [
    {
      url: "http://3.232.154.213:3000/d-solo/bdwcukuyeqnlsa/trend-analysis?orgId=1&var-interval=Week&from=1723680000000&to=1724716800000&panelId=2",
      title: "Grafana Dashboard 1"
    },
    {
      url: "http://3.232.154.213:3000/d-solo/bdwcukuyeqnlsa/trend-analysis?orgId=1&var-interval=Week&from=1723680000000&to=1724716800000&panelId=8",
      title: "Grafana Dashboard 2"
    },
    {
      url: "http://3.232.154.213:3000/d-solo/bdwcukuyeqnlsa/trend-analysis?orgId=1&var-interval=Week&from=1723680000000&to=1724716800000&panelId=5",
      title: "Grafana Dashboard 3"
    },
    {
      url: "http://3.232.154.213:3000/d-solo/bdwcukuyeqnlsa/trend-analysis?orgId=1&var-interval=Week&from=1723680000000&to=1724716800000&panelId=7",
      title: "Grafana Dashboard 4"
    },
  ];

  const largeDashboard = {
    url: "http://3.232.154.213:3000/d-solo/ddw62h13xzqwwa/floor-plan?orgId=1&from=1725326754179&to=1725348354179&panelId=1",
    title: "Grafana Dashboard Big"
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleBackButtonClick = () => {
    navigate('/client-dashboard/energy-dashboard');
  };

  const handleViewMoreButton = () => {
    navigate('/client-dashboard/trend-analysis');
  };

  return (
    <>
      <TopNavBar />
      <Box sx={{ backgroundColor: '#1A1A1D', minHeight: '89vh', boxSizing: 'border-box' }}>
        <Box sx={{ minHeight: "27vh", display: "flex", justifyContent: "center", paddingTop: "20px" }}>
          <Box sx={{ background: "#212125", width: "65%", borderRadius: "10px", padding: "20px 40px" }}>
            <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap" }}>
              <Box>
                <Typography fontSize="20px" color="#FFFFFF" fontWeight="700" mb={0.5}>
                  Building Name
                </Typography>
                <Typography sx={{ color: '#8A8A8A' }}>No. of Floors: 7</Typography>
                <Box sx={{ display: "flex", alignItems: "center", mt: "15px", flexWrap: "nowrap" }}>
                  <Typography fontSize="11px" color="#FFFFFF" fontWeight="600" mr={3} noWrap>
                    Choose Floor
                  </Typography>
                  <FormControl variant="outlined" sx={{ minWidth: 80 }}>
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
                        <span {...props} style={{ color: "#FFFFFF" }}>▼</span>
                      )}
                    >
                      <MenuItem value=""><em>Floor 5</em></MenuItem>
                      <MenuItem value={10}>Category 1</MenuItem>
                      <MenuItem value={20}>Category 2</MenuItem>
                      <MenuItem value={30}>Category 3</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                  onClick={handleViewMoreButton}
                    sx={{
                      height: "25px",
                      borderRadius: '8px',
                      marginLeft: '8px',
                      background: '#008080',
                      color: "black",
                      textTransform: 'capitalize',
                      fontSize: '0.8rem',
                      fontWeight: "600",
                      whiteSpace: 'nowrap',
                    }}
                  >
                    View More
                  </Button>
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "row", alignItems: "start" }}>
                <IconButton sx={{ color: "white", mr: 1,height:'10px'}} onClick={handleBackButtonClick}>
                  <WestIcon />
                </IconButton>
                <Typography fontSize="12px" color="#FFFFFF" fontWeight="600" noWrap>
                  Choose Clients
                </Typography>
                <FormControl variant="outlined" sx={{ minWidth: 120, ml: 1 }}>
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
                      <span {...props} style={{ color: "#FFFFFF" }}>▼</span>
                    )}
                  >
                    <MenuItem value=""><em>Lulu International</em></MenuItem>
                    <MenuItem value={10}>Category 1</MenuItem>
                    <MenuItem value={20}>Category 2</MenuItem>
                    <MenuItem value={30}>Category 3</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Grid container spacing={2} justifyContent="center" sx={{ marginTop: '1px' }}>
              {dashboards.map((dashboard, index) => (
                <Grid item xs={12} sm={6} md={6} key={index}>
                  <Box sx={{
                    width: '100%',
                    height: '300px',
                    maxWidth: '380px',
                    borderRadius: '20px',
                    boxShadow: '0 4px 8px rgba(0, 0, 10, 0.2)',
                    overflow: 'hidden',
                    margin: '0 auto',
                  }}>
                    <iframe
                      src={dashboard.url}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      title={dashboard.title}
                    ></iframe>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Box sx={{
              width: '100%',
              height: '700px',
              maxWidth: '660px',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              backgroundColor: '#F0F0F0',
              marginTop: '50px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}>
              <iframe
                src={largeDashboard.url}
                width="100%"
                height="100%"
                frameBorder="0"
                title={largeDashboard.title}
              ></iframe>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default UsageView;
