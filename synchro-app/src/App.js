import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

import { onAuthStateChange } from './firebase/auth';
import AuthContext from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import ProjectDetail from './pages/ProjectDetail';
import LoadingSpinner from './components/LoadingSpinner';

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

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthContext.Provider value={{ user, setUser }}>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {user && <Navbar />}
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <Routes>
                <Route 
                  path="/login" 
                  element={user ? <Navigate to="/dashboard" /> : <Login />} 
                />
                <Route 
                  path="/signup" 
                  element={user ? <Navigate to="/dashboard" /> : <Signup />} 
                />
                <Route 
                  path="/dashboard" 
                  element={user ? <Dashboard /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/create-project" 
                  element={user ? <CreateProject /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/project/:id" 
                  element={user ? <ProjectDetail /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/" 
                  element={<Navigate to={user ? "/dashboard" : "/login"} />} 
                />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

export default App;

