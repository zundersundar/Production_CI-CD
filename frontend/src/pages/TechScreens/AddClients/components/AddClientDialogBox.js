import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  FormGroup,
  LinearProgress, // Import LinearProgress
} from "@mui/material";
import axios from "axios";
import API_PATHS from "../../../../Config";

const AddClientDialogBox = ({ openDialog, handleCloseDialog, setRefresh }) => {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [logo, setLogo] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // State to track loading

  const handleClientNameChange = (e) => {
    setClientName(e.target.value);
  };

  const handleClientEmailChange = (e) => {
    setClientEmail(e.target.value);
  };

  const handleLogoChange = (e) => {
    setLogo(e.target.files[0]);
  };

  const validate = () => {
    let tempErrors = {};
    if (!clientName) tempErrors.clientName = "Client Name is required.";
    if (!clientEmail) {
      tempErrors.clientEmail = "Client Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(clientEmail)) {
      tempErrors.clientEmail = "Email is not valid.";
    }
    if (!logo) tempErrors.logo = "Logo is required.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true); // Set loading to true when starting the API call
      try {
        // Prepare form data for file upload
        const formData = new FormData();
        formData.append("file", logo);

        // Upload the logo first
        const uploadResponse = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}${API_PATHS.UPLOAD_CUSTOMER_LOGO_IMAGE}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Retrieve the file path from the response
        const logoPath = uploadResponse.data.file_name;

        // Prepare the final customer data with the logo path
        const customerData = {
          customer_name: clientName,
          email: clientEmail,
          logo: logoPath, // Store the logo path
        };

        // Save the customer data
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}${API_PATHS.CREATE_CUSTOMER_LIST}`,
          customerData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setRefresh(true);
        console.log("Client saved successfully");
        setClientName("");
        setClientEmail("");
        setLogo(null);
        handleCloseDialog();
      } catch (error) {
        console.error("Error saving client:", error);
      } finally {
        setLoading(false); // Set loading to false after API call completes
      }
    }
  };

  return (
    <Dialog
      open={openDialog}
      onClose={handleCloseDialog}
      PaperProps={{
        sx: {
          borderRadius: "30px",
          width: { xs: "95%", sm: "60%", md: "40%", lg: "30%" }, // Responsive width
          background: "#212125",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "#212125",
          color: "#e4eaed",
          textAlign: "start",
          fontWeight: "600",
          paddingTop: "28px",
        }}
      >
        Add Clients
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: "#212125", color: "#e4eaed" }}>
        <form onSubmit={handleSubmit}>
          <FormGroup sx={{ marginBottom: "10px" }}>
            <Typography
              color="inherit"
              sx={{
                fontSize: "11px",
                fontWeight: "600",
                marginBottom: "5px",
              }}
            >
              Client Name
            </Typography>
            <TextField
              placeholder="Enter Client Name"
              type="text"
              fullWidth
              value={clientName}
              onChange={handleClientNameChange}
              required
              error={!!errors.clientName}
              helperText={errors.clientName}
              InputProps={{
                style: {
                  color: "white",
                  height: "30px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  backgroundColor: "#27272C",
                },
              }}
            />
          </FormGroup>
          <FormGroup sx={{ marginBottom: "10px" }}>
            <Typography
              color="inherit"
              sx={{
                fontSize: "11px",
                fontWeight: "600",
                marginBottom: "5px",
              }}
            >
              Client Email
            </Typography>
            <TextField
              placeholder="Enter Client Email"
              type="email"
              fullWidth
              value={clientEmail}
              onChange={handleClientEmailChange}
              required
              error={!!errors.clientEmail}
              helperText={errors.clientEmail}
              InputProps={{
                style: {
                  color: "white",
                  height: "30px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  backgroundColor: "#27272C",
                },
              }}
            />
          </FormGroup>
          <FormGroup>
            <Typography
              style={{
                fontSize: "11px",
                fontWeight: "600",
              }}
              color="inherit"
            >
              Logo
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                marginTop: "5px",
              }}
            >
              <Button
                component="label"
                sx={{
                  textTransform: "capitalize",
                  width: "40%",
                  color: "#008080",
                  background: "#B0ECEC",
                  maxHeight: "28px",
                  fontSize: "0.64rem",
                  fontWeight: "600",
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "#8ab2b2",
                  },
                }}
              >
                Choose File
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </Button>
              <TextField
                placeholder="No file chosen"
                type="text"
                value={logo ? logo.name : ""}
                fullWidth
                required
                error={!!errors.logo}
                helperText={errors.logo}
                InputProps={{
                  style: {
                    color: "white",
                    height: "30px",
                    fontSize: "12px",
                    borderRadius: "10px",
                    backgroundColor: "#27272C",
                  },
                  readOnly: true,
                }}
              />
            </Box>
          </FormGroup>
        </form>
        {loading && <LinearProgress sx={{ marginBottom: "10px" ,marginTop:'10px' }} />} {/* Show loading bar */}
        <DialogActions sx={{ backgroundColor: "#212125", marginTop: "5px" }}>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            color="primary"
            sx={{
              background: "#B0ECEC",
              color: "#008080",
              textTransform: "capitalize",
              borderRadius: "7px",
              padding: "3.5px 22px",
              fontSize: "12px",
              fontWeight: "600",
              "&:hover": {
                backgroundColor: "#8ab2b2",
              },
            }}
            disabled={loading} // Disable button when loading
          >
            Close
          </Button>
          <Button
            onClick={handleSubmit}
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              background: "#008080",
              color: "#1E1E1E",
              textTransform: "capitalize",
              borderRadius: "7px",
              padding: "3.5px 22px",
              fontSize: "12px",
              fontWeight: "600",
              "&:hover": {
                backgroundColor: "#005151",
              },
            }}
            disabled={loading} // Disable button when loading
          >
            Save
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientDialogBox;
