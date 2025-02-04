import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(2),
  maxHeight: '60vh',
  overflowY: 'auto',
  backgroundColor: theme.palette.background.default,
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}));

const Message = styled(Box)(({ theme, isUser }) => ({
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
  borderRadius: '12px',
  maxWidth: '85%',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  backgroundColor: isUser ? theme.palette.primary.main : theme.palette.background.paper,
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  '& p': {
    margin: 0,
  },
  '& img': {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '8px',
    marginTop: theme.spacing(1),
  },
}));

const ChatHistory = ({ messages, sessionId }) => {
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <StyledPaper>
      <Typography variant="h6" component="h2" gutterBottom>
        Chat History
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {messages.map((message, index) => (
          <Message key={index} isUser={message.role === 'user'}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ node, ...props }) => <Typography variant="body1" {...props} />,
                h1: ({ node, ...props }) => <Typography variant="h5" gutterBottom {...props} />,
                h2: ({ node, ...props }) => <Typography variant="h6" gutterBottom {...props} />,
                h3: ({ node, ...props }) => <Typography variant="subtitle1" gutterBottom {...props} />,
                pre: ({ node, ...props }) => (
                  <Paper 
                    sx={{ 
                      p: 1.5, 
                      my: 1.5, 
                      backgroundColor: 'background.paper',
                      overflowX: 'auto'
                    }}
                    {...props} 
                  />
                ),
                code: ({ node, inline, ...props }) => (
                  inline ? 
                    <Typography 
                      component="code" 
                      sx={{ 
                        backgroundColor: 'background.paper',
                        p: 0.5,
                        borderRadius: 1
                      }} 
                      {...props}
                    /> :
                    <Typography 
                      component="code" 
                      sx={{ 
                        display: 'block',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }} 
                      {...props}
                    />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </Message>
        ))}
        <div ref={chatEndRef} />
      </Box>
    </StyledPaper>
  );
};

export default ChatHistory; 