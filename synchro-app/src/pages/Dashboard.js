import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Fab,
  Chip,
  Alert
} from '@mui/material';
import { Add, Group, CalendarToday, Description } from '@mui/icons-material';
import AuthContext from '../contexts/AuthContext';
import { getUserProjects } from '../firebase/projects';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const userProjects = await getUserProjects(user.uid);
        setProjects(userProjects);
      } catch (error) {
        setError('Failed to load projects');
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProjects();
    }
  }, [user]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (loading) {
    return <LoadingSpinner message="Loading your projects..." />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.displayName || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your team projects and generate charters with AI assistance
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {projects.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No projects yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first project to get started with team collaboration
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/create-project')}
                >
                  Create Project
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<Group />}
                      label={`${project.members?.length || 0} members`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<CalendarToday />}
                      label={formatDate(project.createdAt)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  {project.status && (
                    <Chip
                      label={project.status}
                      size="small"
                      color={project.status === 'Active' ? 'success' : 'default'}
                      sx={{ mb: 1 }}
                    />
                  )}
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/project/${project.id}`)}
                    startIcon={<Description />}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => navigate('/create-project')}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default Dashboard;

