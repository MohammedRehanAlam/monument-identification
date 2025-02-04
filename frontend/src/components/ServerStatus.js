import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StatusBar = styled(Box)(({ theme, status }) => ({
  width: '100%',
  padding: '8px',
  backgroundColor: '#0084ff',
  color: '#fff',
  textAlign: 'center',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
}));

const YellowBar = styled(Box)(({ theme, show }) => ({
  width: '100%',
  padding: '12px',
  backgroundColor: '#ffd700',
  color: '#000',
  textAlign: 'center',
  display: show ? 'flex' : 'none',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'opacity 0.3s ease',
  opacity: show ? 1 : 0,
}));

const ServerStatus = ({ status, serverUrl, showSuccessMessage }) => {
  const getStatusMessage = () => {
    switch (status) {
      case 'checking':
        return 'Checking server connection...';
      case 'connected':
        return 'Server is working properly';
      case 'error':
        return 'Server error. Please check the backend logs.';
      case 'disconnected':
        return 'Cannot connect to server. Please ensure the backend is running.';
      default:
        return 'Checking server connection...';
    }
  };

  const shouldShowYellowBar = () => {
    if (status === 'connected' && !showSuccessMessage) {
      return false;
    }
    return status !== 'connected' || showSuccessMessage;
  };

  return (
    <>
      <StatusBar>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1,
        }}>
          <span>⚠️</span>
          <Typography component="span" sx={{ fontWeight: 500 }}>
            {serverUrl}
          </Typography>
        </Box>
      </StatusBar>
      <YellowBar show={shouldShowYellowBar()}>
        <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getStatusMessage()}
          {status === 'checking' && <span role="img" aria-label="loading">🌙</span>}
        </Typography>
      </YellowBar>
    </>
  );
};

export default ServerStatus; 