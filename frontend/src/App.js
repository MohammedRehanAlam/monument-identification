import React, { useState, useRef, useEffect } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Paper,
  Container,
  CircularProgress,
  TextField,
  Fade,
  Collapse,
  Card,
  CardContent,
  CardActions,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  CameraAlt as CameraIcon,
  Upload as UploadIcon,
  LocationOn as LocationIcon,
  Send as SendIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';
import { getUserCoordinates, fetchAddressDetails } from './locationService';
import AnalysisResults from './components/AnalysisResults';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2196f3',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: darkMode ? '#1a1a1a' : '#f5f5f5',
        paper: darkMode ? '#2d2d2d' : '#ffffff'
      },
      text: {
        primary: darkMode ? '#ffffff' : '#000000',
        secondary: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: darkMode ? '#1a1a1a' : '#f5f5f5',
            transition: 'background-color 0.3s ease',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            transition: 'all 0.3s ease',
          },
          contained: {
            '&.Mui-disabled': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
              color: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
            transition: 'background-color 0.3s ease',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
            transition: 'background-color 0.3s ease',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiFilledInput-root, & .MuiOutlinedInput-root': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              },
              '&.Mui-focused': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
              },
              '& input': {
                color: darkMode ? '#ffffff' : '#000000',
              }
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
          },
          standardWarning: {
            backgroundColor: darkMode ? 'rgba(102, 60, 0, 0.2)' : 'rgba(255, 244, 229, 1)',
            '& .MuiAlert-icon': {
              color: darkMode ? '#ffb74d' : '#f57c00',
            },
          },
          standardError: {
            backgroundColor: darkMode ? 'rgba(102, 0, 0, 0.2)' : 'rgba(253, 236, 234, 1)',
            '& .MuiAlert-icon': {
              color: darkMode ? '#ff5252' : '#d32f2f',
            },
          },
          standardSuccess: {
            backgroundColor: darkMode ? 'rgba(0, 102, 0, 0.2)' : 'rgba(237, 247, 237, 1)',
            '& .MuiAlert-icon': {
              color: darkMode ? '#69f0ae' : '#2e7d32',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.3s ease',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
            color: darkMode ? '#ffffff' : '#000000',
            transition: 'all 0.3s ease',
          },
        },
      },
    },
  });

  const [images, setImages] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [location, setLocation] = useState(null);
  const [question, setQuestion] = useState('');
  const [cameraStream, setCameraStream] = useState(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [monumentDetails, setMonumentDetails] = useState({
    monumentName: '',
    country: '',
    state: '',
    localAddress: '',
  });
  const [locationError, setLocationError] = useState('');
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [error, setError] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Get available cameras
  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(cameras);
      
      // Try to find a back camera
      const backCamera = cameras.find(camera => 
        camera.label.toLowerCase().includes('back') || 
        camera.label.toLowerCase().includes('rear') ||
        camera.label.toLowerCase().includes('environment')
      );
      
      // Set the default camera (prefer back camera if available)
      setSelectedCamera(backCamera || cameras[0]);
    } catch (err) {
      console.error("Error getting cameras:", err);
    }
  };

  // Check if camera permissions are granted
  const checkCameraPermissions = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' });
      return result.state === 'granted';
    } catch (err) {
      console.log('Permissions API not supported, will try direct camera access');
      return null; // Permissions API not supported
    }
  };

  // Effect to handle camera initialization and cleanup
  useEffect(() => {
    if (showCamera && !isCameraReady) {
      const initCamera = async () => {
        try {
          setError('');
          
          // Wait a bit to ensure DOM is ready
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (!videoRef.current) {
            throw new Error('Video element not found');
          }

          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });

          videoRef.current.srcObject = stream;
          setCameraStream(stream);
          setIsCameraReady(true);
          
        } catch (err) {
          console.error('Camera init error:', err);
          setError(err.message || 'Camera initialization failed');
          setShowCamera(false);
        }
      };

      initCamera();
    }

    // Cleanup function
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => {
          track.stop();
          console.log('Camera track stopped');
        });
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setCameraStream(null);
        setIsCameraReady(false);
      }
    };
  }, [showCamera, cameraStream]);

  // Handle camera toggle
  const toggleCamera = () => {
    if (showCamera) {
      // Stop the camera stream
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => {
          track.stop();
          console.log('Camera track stopped on toggle');
        });
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setCameraStream(null);
        setIsCameraReady(false);
      }
    }
    setShowCamera(!showCamera);
  };

  const handleCameraCapture = async () => {
    if (!videoRef.current || !cameraStream) {
      showNotification('Camera is not ready', 'error');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setImages(prev => [...prev, file]);
          setImageUploaded(true);
          showNotification('Photo captured successfully!', 'success');
        }
      }, 'image/jpeg', 1.0);
      
    } catch (error) {
      console.error('Camera capture error:', error);
      showNotification(error.message || 'Failed to capture photo', 'error');
    }
  };

  const handleFileUpload = (event) => {
    const newFiles = Array.from(event.target.files);
    setImages(prev => [...prev, ...newFiles]);
    setImageUploaded(true);
    showNotification(`${newFiles.length} image(s) uploaded successfully!`, "success");
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (images.length <= 1) {
      setImageUploaded(false);
    }
    showNotification("Image removed", "info");
  };

  const handleDetailsChange = (field) => (event) => {
    setMonumentDetails(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const clearLocation = () => {
    setLocation(null);
    setLocationPermission(false);
    setLocationError('');
    // Clear all monument details
    setMonumentDetails({
      monumentName: '',
      country: '',
      state: '',
      localAddress: '',
    });
  };

  // Update location permission handler
  const requestLocationPermission = async () => {
    try {
      setLocationError('');
      
      // Get coordinates using locationService
      const coordinates = await getUserCoordinates();
      
      // Fetch address details using the coordinates
      const addressDetails = await fetchAddressDetails(coordinates.latitude, coordinates.longitude);
      
      setLocation(addressDetails);
      setLocationPermission(true);
      
      // Update monument details with the location information
      setMonumentDetails(prev => ({
        ...prev,
        country: addressDetails.country,
        state: addressDetails.state,
        localAddress: addressDetails.displayName,
      }));
      
      showNotification("Location detected successfully!", "success");
    } catch (err) {
      console.error("Location error:", err);
      setLocationError(err.message || 'Failed to detect location. Please try again.');
      showNotification("Location access failed. You can enter location manually.", "error");
    }
  };

  const handleAnalysis = async () => {
    if (!images.length) return;
    
    setAnalyzing(true);
    setAnalysisResult('');
    setError('');

    try {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images[]', image);
      });

      // Add session ID
      const sessionId = localStorage.getItem('sessionId') || Math.random().toString(36).substring(7);
      localStorage.setItem('sessionId', sessionId);
      formData.append('sessionId', sessionId);

      // Add location information if available
      if (location) {
        formData.append('latitude', location.latitude || '');
        formData.append('longitude', location.longitude || '');
        formData.append('localAddress', location.address || '');
        formData.append('country', location.country || '');
        formData.append('state', location.state || '');
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analyze-monument`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let analysisText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                analysisText += data.chunk;
                setAnalysisResult(analysisText);
              }
              if (data.done) {
                if (data.history) {
                  setChatHistory(data.history);
                }
                break;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.message || 'Failed to analyze the image');
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle chat question
  const handleAskQuestion = async (question) => {
    try {
      // Get the session ID from localStorage
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        throw new Error('No active session. Please analyze an image first.');
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: question,
          sessionId: sessionId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let responseText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                responseText += data.chunk;
                setChatHistory(prev => [...prev, { type: 'user', content: question }, { type: 'assistant', content: responseText }]);
              }
              if (data.done) break;
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message);
      showNotification(err.message, 'error');
    }
  };

  // Handle image click for fullscreen view
  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  // Handle closing fullscreen view
  const handleCloseFullscreen = () => {
    setSelectedImage(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        bgcolor: 'background.default',
        transition: 'background-color 0.3s ease'
      }}>
        <AppBar position="fixed" elevation={0} color="inherit">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Monument Identifier
            </Typography>
            <IconButton onClick={() => setDarkMode(!darkMode)} sx={{ color: 'text.primary' }}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container sx={{ mt: 10, mb: 4, flex: 1 }}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent>
              <Box className="action-buttons" sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={showCamera ? <CloseIcon /> : <CameraIcon />}
                  onClick={toggleCamera}
                  sx={{
                    bgcolor: showCamera ? 'error.main' : 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: showCamera ? 'error.dark' : 'primary.dark',
                    },
                    minWidth: '150px'
                  }}
                >
                  {showCamera ? 'Close Camera' : 'Take Photo'}
                </Button>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                />
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ minWidth: '150px' }}
                >
                  Upload Photos
                </Button>
              </Box>

              {showCamera && (
                <Box sx={{ 
                  width: '100%', 
                  maxWidth: '640px', 
                  margin: '0 auto', 
                  position: 'relative',
                  aspectRatio: '4/3',
                  mb: 2,
                  overflow: 'hidden',
                  borderRadius: 2,
                  bgcolor: 'black',
                  boxShadow: 3
                }}>
                  {error && (
                    <Alert severity="error" sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 }}>
                      {error}
                    </Alert>
                  )}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={() => {
                      videoRef.current.play().catch(err => {
                        console.error('Error playing video:', err);
                        setError('Failed to start video playback');
                      });
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <Box sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2,
                    padding: '0 16px',
                    zIndex: 2
                  }}>
                    <Button
                      variant="contained"
                      onClick={handleCameraCapture}
                      startIcon={<CameraIcon />}
                      sx={{
                        bgcolor: 'rgba(33, 150, 243, 0.9)',
                        '&:hover': {
                          bgcolor: 'rgba(33, 150, 243, 1)',
                        },
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      Capture
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Fullscreen Image Modal */}
              {selectedImage && (
                <Box
                  onClick={handleCloseFullscreen}
                  sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'rgba(0, 0, 0, 0.9)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999,
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Fullscreen view"
                    style={{
                      maxWidth: '90%',
                      maxHeight: '90vh',
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }}
                  />
                </Box>
              )}

              {/* Image Preview Section */}
              {images.length > 0 && (
                <Fade in={true}>
                  <Box className="image-preview-container" sx={{ 
                    mb: 2,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: 2,
                    maxHeight: '300px',
                    overflowY: 'hidden',
                    padding: 1,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    borderRadius: 2
                  }}>
                    {images.map((image, index) => (
                      <Box 
                        key={index} 
                        className="image-preview" 
                        sx={{ 
                          position: 'relative',
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: theme.shadows[4],
                          aspectRatio: '1',
                          cursor: 'pointer',
                          '&:hover': {
                            '& .image-overlay': {
                              opacity: 1
                            }
                          }
                        }}
                      >
                        <img 
                          src={URL.createObjectURL(image)} 
                          alt={`Preview ${index + 1}`}
                          onClick={() => handleImageClick(image)}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        {/* Delete button */}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(0, 0, 0, 0.6)',
                            color: 'white',
                            padding: '4px',
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.8)',
                            },
                            zIndex: 2
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        {/* Hover overlay */}
                        <Box 
                          className="image-overlay"
                          onClick={() => handleImageClick(image)}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: 'rgba(0, 0, 0, 0.3)',
                            opacity: 0,
                            transition: 'opacity 0.2s ease-in-out'
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Fade>
              )}

              {/* Show Additional Details Button - Always visible */}
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowDetails(!showDetails)}
                sx={{ 
                  width: '100%', 
                  mb: showDetails ? 0 : 2,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Show Additional Details {showDetails ? '▲' : '▼'}
              </Button>

              <Collapse in={showDetails} timeout={300}>
                <Box className="location-controls" sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<LocationIcon />}
                      onClick={requestLocationPermission}
                      sx={{ 
                        flex: 1, 
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                        color: 'text.primary',
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)',
                        },
                        transition: 'all 0.3s ease',
                        boxShadow: 1
                      }}
                    >
                      Auto-detect Location
                    </Button>
                    <Button
                      variant="contained"
                      onClick={clearLocation}
                      sx={{ 
                        flex: 1, 
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                        color: 'text.primary',
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)',
                        },
                        transition: 'all 0.3s ease',
                        boxShadow: 1
                      }}
                    >
                      Clear Location
                    </Button>
                  </Box>

                  {location && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mb: 2, 
                        color: 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        transition: 'color 0.3s ease'
                      }}>
                      <LocationIcon fontSize="small" />
                      Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </Typography>
                  )}

                  {locationError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {locationError}
                    </Alert>
                  )}

                  {/* Monument Details Form */}
                  <Box className="monument-details-form">
                    <TextField
                      fullWidth
                      variant="filled"
                      value={monumentDetails.monumentName}
                      onChange={handleDetailsChange('monumentName')}
                      placeholder="Monument Name (if known)"
                      sx={{ 
                        mb: 2,
                        '& .MuiFilledInput-root': {
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                          },
                          '&.Mui-focused': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                          },
                          '& input': {
                            color: theme.palette.text.primary,
                          }
                        },
                        '& .MuiFilledInput-input::placeholder': {
                          color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.6)',
                          opacity: 1
                        }
                      }}
                      inputProps={{
                        style: {
                          color: theme.palette.text.primary,
                        }
                      }}
                    />
                    <TextField
                      fullWidth
                      variant="filled"
                      value={monumentDetails.country}
                      onChange={handleDetailsChange('country')}
                      placeholder="Country (if known)"
                      sx={{ 
                        mb: 2,
                        '& .MuiFilledInput-root': {
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                          },
                          '&.Mui-focused': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                          },
                          '& input': {
                            color: theme.palette.text.primary,
                          }
                        },
                        '& .MuiFilledInput-input::placeholder': {
                          color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.6)',
                          opacity: 1
                        }
                      }}
                      inputProps={{
                        style: {
                          color: theme.palette.text.primary,
                        }
                      }}
                    />
                    <TextField
                      fullWidth
                      variant="filled"
                      value={monumentDetails.state}
                      onChange={handleDetailsChange('state')}
                      placeholder="State/Province (if known)"
                      sx={{ 
                        mb: 2,
                        '& .MuiFilledInput-root': {
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                          },
                          '&.Mui-focused': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                          },
                          '& input': {
                            color: theme.palette.text.primary,
                          }
                        },
                        '& .MuiFilledInput-input::placeholder': {
                          color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.6)',
                          opacity: 1
                        }
                      }}
                      inputProps={{
                        style: {
                          color: theme.palette.text.primary,
                        }
                      }}
                    />
                    <TextField
                      fullWidth
                      variant="filled"
                      value={monumentDetails.localAddress}
                      onChange={handleDetailsChange('localAddress')}
                      placeholder="Local Address (if known)"
                      sx={{ 
                        mb: 2,
                        '& .MuiFilledInput-root': {
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                          },
                          '&.Mui-focused': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                          },
                          '& input': {
                            color: theme.palette.text.primary,
                          }
                        },
                        '& .MuiFilledInput-input::placeholder': {
                          color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.6)',
                          opacity: 1
                        }
                      }}
                      inputProps={{
                        style: {
                          color: theme.palette.text.primary,
                        }
                      }}
                    />

                    <Alert 
                      severity="warning" 
                      sx={{ 
                        mb: 2,
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(102, 60, 0, 0.2)' : 'rgba(255, 244, 229, 1)',
                        color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.87)',
                        border: 1,
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 183, 77, 0.3)' : '#ed6c02',
                        '& .MuiAlert-icon': {
                          color: theme.palette.mode === 'dark' ? '#ffb74d' : '#ed6c02'
                        },
                        '& .MuiAlert-message': {
                          color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.87)',
                        },
                        boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(8px)',
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(102, 60, 0, 0.25)' : 'rgba(255, 244, 229, 0.95)',
                        }
                      }}
                      icon={<WarningIcon sx={{ color: theme.palette.mode === 'dark' ? '#ffb74d' : '#ed6c02' }} />}
                    >
                      Sometimes the AI may be hallucinating and wrong information may be provided, 
                      so please chat back with the AI assistant to get correct information. Thank You
                    </Alert>
                  </Box>
                </Box>
              </Collapse>

              <Box sx={{ mt: 2 }}>
                {images.length > 0 && (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleAnalysis}
                    disabled={analyzing}
                    sx={{ mt: 2, mb: 2 }}
                  >
                    {analyzing ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 1, color: 'inherit' }} />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Monument'
                    )}
                  </Button>
                )}
              </Box>

              {analysisResult && (
                <Box sx={{ mt: 2, mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Analysis Results
                  </Typography>
                  <Typography 
                    component="div" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      '& p': { mb: 1 },
                      '& ul, & ol': { pl: 2, mb: 1 }
                    }}
                  >
                    {analysisResult}
                  </Typography>
                </Box>
              )}

              {analysisResult && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Ask questions further..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => handleAskQuestion(question)}
                    disabled={!question.trim() || analyzing}
                  >
                    Ask Question
                  </Button>
                </Box>
              )}

              {/* Chat Interface */}
              {chatHistory.length > 0 && (
                <Box sx={{ 
                  mt: 3, 
                  p: 2, 
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 2,
                  maxHeight: '400px',
                  overflowY: 'hidden'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 1
                  }}>
                    {chatHistory.map((msg, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                          mb: 1
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: '80%',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: msg.type === 'user' 
                              ? theme.palette.primary.main 
                              : theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.1)' 
                                : 'rgba(0, 0, 0, 0.05)',
                            color: msg.type === 'user' 
                              ? '#fff' 
                              : theme.palette.text.primary,
                            position: 'relative',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              width: 0,
                              height: 0,
                              borderStyle: 'solid',
                              ...(msg.type === 'user' 
                                ? {
                                    borderWidth: '8px 0 8px 8px',
                                    borderColor: `transparent transparent transparent ${theme.palette.primary.main}`,
                                    right: '-8px',
                                  }
                                : {
                                    borderWidth: '8px 8px 8px 0',
                                    borderColor: `transparent ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'} transparent transparent`,
                                    left: '-8px',
                                  }),
                              top: '50%',
                              transform: 'translateY(-50%)',
                            }
                          }}
                        >
                          <Typography 
                            variant="body1" 
                            component="div"
                            sx={{ 
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              '& a': {
                                color: msg.type === 'user' ? '#fff' : theme.palette.primary.main,
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            {msg.content}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Chat Input */}
              {analysisResult && (
                <Box sx={{ 
                  mt: 2,
                  display: 'flex',
                  gap: 1,
                  alignItems: 'flex-start'
                }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Ask a question about the monument..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAskQuestion(question);
                        setQuestion('');
                      }
                    }}
                    multiline
                    maxRows={4}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        borderRadius: 3
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => {
                      handleAskQuestion(question);
                      setQuestion('');
                    }}
                    disabled={!question.trim()}
                    sx={{
                      minWidth: 'auto',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: theme.palette.primary.main,
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark
                      }
                    }}
                  >
                    <SendIcon />
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;