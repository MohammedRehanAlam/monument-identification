import React from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';

const ResponsiveContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
  },
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
  },
}));

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

const Sidebar = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    width: '350px',
    flexShrink: 0,
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

const ResponsiveLayout = ({ children, sidebarContent }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <ResponsiveContainer maxWidth="xl">
      <ContentWrapper>
        <MainContent>
          {children}
        </MainContent>
        {sidebarContent && (
          <Sidebar>
            {sidebarContent}
          </Sidebar>
        )}
      </ContentWrapper>
    </ResponsiveContainer>
  );
};

export default ResponsiveLayout; 