import React from 'react';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const ImagePreview = ({ open, image, onClose }) => {
  if (!image) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'white',
          bgcolor: 'rgba(0,0,0,0.5)',
          '&:hover': {
            bgcolor: 'rgba(0,0,0,0.7)',
          }
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ p: 0 }}>
        <img
          src={typeof image === 'string' ? image : URL.createObjectURL(image)}
          alt="Preview"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block'
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreview;
