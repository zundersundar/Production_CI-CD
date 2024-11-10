import React from 'react';
import {Box, Dialog, DialogTitle, DialogActions, Button, TextField, DialogContent, Typography, FormGroup } from '@mui/material';

const SensorConfigDialog = ({ openDialog, handleCloseDialog, sensorName, setSensorName, handleDialogSubmit }) => {
  return (
    <Dialog
    open={openDialog}
    onClose={handleCloseDialog}
    PaperProps={{
      sx: {
        borderRadius: "30px",
        width: "27%",
        height: "37vh", // Adjusted height to fit content
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
      Enter Name
    </DialogTitle>
    <DialogContent sx={{ backgroundColor: "#212125", color: "#e4eaed" }}>
          <Box sx={{ marginBottom: "2px" }}>
            <Typography
              color="inherit"
              sx={{
                fontSize: "11px",
                fontWeight: "600",
                marginBottom: "5px",
              }}
            >
              Sensor Name
            </Typography>
            <TextField
              placeholder="Enter Sensor Name"
              type="text"
              fullWidth
              value={sensorName}
              onChange={(e) => setSensorName(e.target.value)}
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
            />
          </Box>
          {/* {error && (
            <Typography color="error" variant="body2" sx={{ marginTop: "10px" }}>
              {error}
            </Typography>
          )} */}
      </DialogContent>
      <DialogActions sx={{ backgroundColor: "#212125", marginBottom: '10px', marginRight: "5px" }}>
        <Button
          onClick={handleDialogSubmit}
          variant="contained"
          color="primary"
          sx={{
            background: "#B0ECEC",
            color: "#008080",
            textTransform: "capitalize",
            borderRadius: "7px",
            padding: "3px 23px",
            fontSize: "12px",
            fontWeight: "600",
            "&:hover": {
              backgroundColor: "#8ab2b2",
            },
          }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SensorConfigDialog;
