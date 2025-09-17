import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthScreen from './pages/AuthScreen';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import CreateProject from './pages/CreateProject';
import LoadingSpinner from './components/LoadingSpinner';
import './utils/indexTest'; // Import for browser console testing
import './utils/debugUserLookup'; // Import for user lookup debugging
import './utils/debugFirestoreUsers'; // Import for Firestore users debugging
import './utils/debugUserCache'; // Import for user cache debugging
import './utils/debugInvitations'; // Import for invitation debugging
import './utils/debugTaskVisibility'; // Import for task visibility debugging

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Routes>
        <Route 
          path="/auth" 
          element={user ? <Navigate to="/dashboard" /> : <AuthScreen />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/project/:id" 
          element={user ? <ProjectDetail /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/create-project" 
          element={user ? <CreateProject /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/auth"} />} 
        />
      </Routes>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
