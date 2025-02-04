import React, { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';

const AdditionalDetails = ({
  onLocationRequest,
  onDetailsSubmit,
  locationError,
  isLoading,
  details,
  onDetailsChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Box>
      <button 
        className="details-button"
        onClick={toggleExpanded}
      >
        Show Additional Details ▼
      </button>

      {isExpanded && (
        <Box sx={{ mt: 2 }}>
          <button
            className="action-button"
            onClick={onLocationRequest}
            disabled={isLoading}
            style={{ width: '100%', marginBottom: '16px' }}
          >
            Auto-detect Location
          </button>

          {locationError && (
            <div style={{ 
              color: '#856404',
              backgroundColor: '#fff3cd',
              padding: '8px',
              borderRadius: '4px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {locationError}
            </div>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Monument Name"
              value={details.monumentName || ''}
              onChange={(e) => onDetailsChange('monumentName', e.target.value)}
              placeholder="Enter monument name (if known)"
              fullWidth
              size="small"
            />

            <TextField
              label="Country"
              value={details.country || ''}
              onChange={(e) => onDetailsChange('country', e.target.value)}
              placeholder="Enter country name"
              fullWidth
              size="small"
            />

            <TextField
              label="State/Province"
              value={details.state || ''}
              onChange={(e) => onDetailsChange('state', e.target.value)}
              placeholder="Enter state/province name"
              fullWidth
              size="small"
            />

            <TextField
              label="Local Address"
              value={details.localAddress || ''}
              onChange={(e) => onDetailsChange('localAddress', e.target.value)}
              placeholder="Enter local address"
              fullWidth
              size="small"
              multiline
              rows={2}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AdditionalDetails; 