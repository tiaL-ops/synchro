import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import {
  ArrowBack,
  AccountCircle,
  ExitToApp
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { createProject } from '../services/projectService';

const CreateProject: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const [formData, setFormData] = useState({
    projectName: '',
    goal: '',
    deadline: '',
    visibility: 'private' as 'private' | 'public'
  });

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    handleClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      const projectData = {
        projectName: formData.projectName,
        goal: formData.goal,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined,
        createdBy: user.uid,
        teamMembers: {
          [user.uid]: {
            role: 'Owner' as const,
            joinedAt: new Date()
          }
        },
        visibility: formData.visibility
      };

      const projectId = await createProject(projectData);
      navigate(`/project/${projectId}`);
    } catch (error: any) {
      setError(error.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: e.target.value
    });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Create New Project
          </Typography>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.displayName?.charAt(0)?.toUpperCase() || <AccountCircle />}
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem disabled>
              <Typography variant="body2">
                {user?.displayName || user?.email}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              Create New Project
            </Typography>
            <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
              Set up your project and start collaborating with your team
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="projectName"
                label="Project Name"
                name="projectName"
                autoComplete="off"
                autoFocus
                value={formData.projectName}
                onChange={handleInputChange('projectName')}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="goal"
                label="Project Goal"
                multiline
                rows={4}
                value={formData.goal}
                onChange={handleInputChange('goal')}
                placeholder="Describe the main objective and goals of this project..."
              />
              <TextField
                margin="normal"
                fullWidth
                name="deadline"
                label="Deadline"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.deadline}
                onChange={handleInputChange('deadline')}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading || !formData.projectName || !formData.goal}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Project'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateProject;
