import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, FormControl, MenuItem, Select } from '@mui/material';
import WestIcon from '@mui/icons-material/West';
import TopNavBar from '../../../components/NavBar/TopNavBar'; // Ensure this component is imported correctly
import { useNavigate } from 'react-router-dom';

const TrendAnalysis = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterData, setFilterData] = useState('Week'); // Default filter

  const navigate = useNavigate();

  const handleBackButtonClick = () => {
    navigate('/tech-dashboard/view-more');
  };

  useEffect(() => {
    switch (selectedCategory) {
      case 10:
        setFilterData('Day');
        break;
      case 20:
        setFilterData('Week');
        break;
      case 30:
        setFilterData('Month');
        break;
      default:
        setFilterData('Week'); // Default value
        break;
    }
  }, [selectedCategory]);

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  return (
    <>
      <TopNavBar />
      <Box sx={{ backgroundColor: '#1A1A1D', minHeight: '89vh', boxSizing: 'border-box' }}>
        <Box
          sx={{
            minHeight: '27vh',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '20px',
          }}
        >
          <Box
            sx={{
              background: '#212125',
              width: '65%',
              borderRadius: '10px',
              padding: '20px 40px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography fontSize="20px" color="#FFFFFF" fontWeight="700" mb={0.5}>
                  Building Name
                </Typography>
                <Typography sx={{ color: '#8A8A8A' }}>No. of Floors: 7</Typography>
                <Box mt={2} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <Typography fontSize="12px" color="#FFFFFF" fontWeight="600" mr={1}>
                    Choose Floor
                  </Typography>
                  <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                    <Select
                      // value={selectedCategory}
                      // onChange={handleCategoryChange}
                      displayEmpty
                      sx={{
                        height: '23px',
                        fontSize: '.7rem',
                        color: '#FFFFFF',
                        background: '#27272C',
                        borderRadius: '5px',
                        '&:hover': {
                          backgroundColor: '#38383d',
                        },
                        '.MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        '.MuiSelect-select': {
                          padding: '10px',
                          display: 'flex',
                          alignItems: 'center',
                        },
                        '.MuiSvgIcon-root': {
                          color: '#FFFFFF',
                        },
                      }}
                      IconComponent={(props) => (
                        <span {...props} style={{ color: '#FFFFFF' }}>
                          ▼
                        </span>
                      )}
                    >
                      <MenuItem value="">
                        <em>Choose Floor</em>
                      </MenuItem>
                      <MenuItem value={10}>Floor 1</MenuItem>
                      <MenuItem value={20}>Floor 2</MenuItem>
                      <MenuItem value={30}>Floor 3</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box mt={2} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <Typography fontSize="12px" color="#FFFFFF" fontWeight="600" mr={1}>
                    Choose Filter
                  </Typography>
                  <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                    <Select
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      displayEmpty
                      sx={{
                        height: '23px',
                        fontSize: '.7rem',
                        color: '#FFFFFF',
                        background: '#27272C',
                        borderRadius: '5px',
                        '&:hover': {
                          backgroundColor: '#38383d',
                        },
                        '.MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        '.MuiSelect-select': {
                          padding: '10px',
                          display: 'flex',
                          alignItems: 'center',
                        },
                        '.MuiSvgIcon-root': {
                          color: '#FFFFFF',
                        },
                      }}
                      IconComponent={(props) => (
                        <span {...props} style={{ color: '#FFFFFF' }}>
                          ▼
                        </span>
                      )}
                    >
                      <MenuItem value="">
                        <em>Choose Filter</em>
                      </MenuItem>
                      <MenuItem value={10}>Day</MenuItem>
                      <MenuItem value={20}>Week</MenuItem>
                      <MenuItem value={30}>Month</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <Box mt={0.8} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'start' }}>
                <IconButton
                  sx={{ color: 'white', marginRight: '12px', height: '10px' }}
                  onClick={handleBackButtonClick}
                >
                  <WestIcon />
                </IconButton>
                <Typography fontSize="12px" color="#FFFFFF" fontWeight="600" mr={1}>
                  Choose Client
                </Typography>
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <Select
                    // value={selectedCategory}
                    // onChange={handleCategoryChange}
                    displayEmpty
                    sx={{
                      height: '23px',
                      fontSize: '.7rem',
                      color: '#FFFFFF',
                      background: '#27272C',
                      borderRadius: '5px',
                      '&:hover': {
                        backgroundColor: '#38383d',
                      },
                      '.MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      '.MuiSelect-select': {
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                      },
                      '.MuiSvgIcon-root': {
                        color: '#FFFFFF',
                      },
                    }}
                    IconComponent={(props) => (
                      <span {...props} style={{ color: '#FFFFFF' }}>
                        ▼
                      </span>
                    )}
                  >
                    <MenuItem value="">
                      <em>Select Client</em>
                    </MenuItem>
                    <MenuItem value={10}>Lulu International</MenuItem>
                    <MenuItem value={20}>Category 1</MenuItem>
                    <MenuItem value={30}>Category 2</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Embed Grafana Dashboard */}
            <Box sx={{ marginTop: '20px', height: '1650px' }}>
              <iframe
                src={`http://3.232.154.213:3000/d/bdwcukuyeqnlsa/trend-analysis?orgId=1&var-interval=${filterData}&from=1723680000000&to=1724716800000&viewPanel=1&kiosk`}
                width="100%"
                height="100%"
                frameBorder="0"
                title="Grafana Dashboard"
              ></iframe>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default TrendAnalysis;
