import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  FormGroup,
} from "@mui/material";
import BgImage from "../../assets/images/BgImage.png";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Dummy credentials
  const credentials = [
    { email: "client", password: "clientpass", role: "client" },
    { email: "technician", password: "techpass", role: "technician" },
  ];

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const user = credentials.find(
      (user) => user.email === email && user.password === password
    );

    if (user) {
      
      sessionStorage.setItem("userEmail", user.email);
      sessionStorage.setItem("userRole", user.role);

      if (user.role === "client") {
        navigate('/client-dashboard');
      } else if (user.role === "technician") {
        navigate('/tech-dashboard');
      }
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <Box sx={{ background: "rgba(0,0,0,.9)" }}>
      <Box
        sx={{
          backgroundImage: `url(${BgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Card
            sx={{
              backgroundColor: "#212125",
              color: "#e4eaed",
              padding: "8px 20px 36px 20px",
              width: "25%",
              borderRadius: "35px",
              height: "50vh",
            }}
          >
            <CardContent>
              <Typography
                fontWeight="800"
                fontSize="28px"
                component="h1"
                gutterBottom
                textAlign="center"
              >
                TowerWatch
              </Typography>
              <Typography
                style={{ fontWeight: "600", fontSize: "21px" }}
                marginTop="15px"
                marginBottom="12px"
                color="inherit"
                gutterBottom
              >
                All Clients
              </Typography>
             
              <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                <FormGroup style={{ marginBottom: "12px" }}>
                  <Typography
                    color="inherit"
                    style={{ fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}
                  >
                    Client Name
                  </Typography>
                  <TextField
                    placeholder="Enter Client Name"
                    type="text"
                    fullWidth
                    value={email}
                    onChange={handleEmailChange}
                    required
                    InputProps={{
                      style: {
                        color: "white",
                        height: "30px",
                        borderRadius: "10px",
                        fontSize: "12px",
                        backgroundColor: "#27272C",
                      },
                    }}
                    InputLabelProps={{
                      style: { color: "white", background: "#27272C" },
                    }}
                  />
                </FormGroup>
                <FormGroup>
                  <Typography
                    style={{ fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}
                    color="inherit"
                  >
                    Client Password
                  </Typography>
                  <TextField
                    placeholder="Enter Client Password"
                    type="password"
                    fullWidth
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    InputProps={{
                      style: {
                        color: "white",
                        height: "30px",
                        fontSize: "12px",
                        borderRadius: "10px",
                        backgroundColor: "#27272C",
                      },
                    }}
                    InputLabelProps={{ style: { color: "white" } }}
                  />
                </FormGroup>
                <Box sx={{
                  display:"flex",
                  flexDirection:'row',
                  justifyContent:'space-between',
                }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  style={{
                    background: "#008080",
                    color: "#1E1E1E",
                    textTransform: "capitalize",
                    borderRadius: "10px",
                    gap: "10px",
                    padding: "10px 30px 10px 30px",
                    marginTop: "14px",
                    width: "26%",
                    height: "32px",
                    fontWeight: "600",
                  }}
                >
                  Login
                </Button>
                {error && (
                <Typography color="red" fontSize="12px" marginBottom="12px" marginTop={2}>
                  {error}
                </Typography>
              )}
              </Box>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
