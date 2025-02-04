import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const AnalysisResults = ({ analysisResult, onAskQuestion }) => {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleAsk = () => {
    if (question.trim()) {
      const newMessage = { type: 'question', content: question };
      setChatHistory([...chatHistory, newMessage]);
      onAskQuestion(question);
      setQuestion('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <Box sx={{ mt: 3, width: '100%' }}>
      {/* Analysis Results Container */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          mb: 2
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>Analysis Results</Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {analysisResult}
        </Typography>
      </Paper>

      {/* Chat History */}
      <Box sx={{ mb: 2 }}>
        {chatHistory.map((msg, index) => (
          <Paper 
            key={index} 
            sx={{ 
              p: 2, 
              mb: 1, 
              borderRadius: '12px',
              backgroundColor: msg.type === 'question' ? 'rgba(200, 220, 255, 0.9)' : 'rgba(255, 255, 255, 0.9)'
            }}
          >
            <Typography variant="body1">
              {msg.type === 'question' ? '🙋 You: ' : '🤖 Assistant: '}
              {msg.content}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Question Input */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask questions further..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }
          }}
        />
        <Button
          variant="contained"
          onClick={handleAsk}
          disabled={!question.trim()}
          endIcon={<SendIcon />}
          sx={{ 
            borderRadius: '12px',
            minWidth: '120px'
          }}
        >
          Ask
        </Button>
      </Box>
    </Box>
  );
};

export default AnalysisResults;
