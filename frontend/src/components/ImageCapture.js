import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, IconButton, CircularProgress } from '@mui/material';
import { CameraAlt as CameraIcon, Close as CloseIcon } from '@mui/icons-material';
import ImagePreview from './ImagePreview';

const ImageCapture = ({ onImageCapture, onError, isAnalyzing }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      setLoading(true);
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API is not supported in your browser');
      }

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Try to get the back camera first
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: 'environment' } },
          audio: false
        });
      } catch (e) {
        // If back camera fails, try any available camera
        console.log('Back camera not available, trying front camera');
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      streamRef.current = stream;
      setShowCamera(true);
    } catch (error) {
      console.error('Camera error:', error);
      onError(error.message || 'Could not access camera');
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const handleCapture = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob((blob) => {
      if (!blob) {
        onError('Failed to capture image');
        return;
      }
      
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setPreviewImage(URL.createObjectURL(blob));
      onImageCapture(file);
      stopCamera();
    }, 'image/jpeg', 0.95);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 600, margin: '0 auto' }}>
      {!showCamera ? (
        <Button
          variant="contained"
          startIcon={<CameraIcon />}
          onClick={startCamera}
          disabled={loading || isAnalyzing}
          fullWidth
          sx={{ mb: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Open Camera'}
        </Button>
      ) : (
        <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
            playsInline
            autoPlay
          />
          <Box sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 2
          }}>
            <IconButton
              onClick={handleCapture}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              <CameraIcon />
            </IconButton>
            <IconButton
              onClick={stopCamera}
              sx={{
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': { bgcolor: 'error.dark' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      )}
      
      <ImagePreview
        open={previewOpen}
        image={previewImage}
        onClose={() => setPreviewOpen(false)}
      />
    </Box>
  );
};

export default ImageCapture;