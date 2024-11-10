import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';

const ConfirmDeleteDialog = ({ open, onClose, onConfirm, itemName }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-delete-dialog-title"
      aria-describedby="confirm-delete-dialog-description"
      PaperProps={{
        sx: {
          width:'340px',
          backgroundColor: '#212125',
          color: 'white',
          borderRadius: 2, // Slightly rounded corners
          padding: 2, // Adds padding around content
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)', // Modern shadow effect
        },
      }}
    >
      <DialogTitle id="confirm-delete-dialog-title" sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
          Confirm Delete
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          id="confirm-delete-dialog-description"
          sx={{ color: 'white', textAlign: 'center', marginBottom: 2 }}
        >
          Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', paddingBottom: 2 }}>
        <Button onClick={onClose} sx={{ color: 'white', borderColor: 'white' }} variant="outlined">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" sx={{ marginLeft: 2 }}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
