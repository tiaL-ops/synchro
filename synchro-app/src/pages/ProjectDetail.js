import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Divider,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Edit,
  Share,
  Group,
  CalendarToday,
  Description,
  AutoAwesome,
  Download
} from '@mui/icons-material';
import AuthContext from '../contexts/AuthContext';
import { getProject, updateProject } from '../firebase/projects';
import { generateTeamCharter } from '../services/aiService';
import LoadingSpinner from '../components/LoadingSpinner';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectData = await getProject(id);
        if (projectData) {
          setProject(projectData);
        } else {
          setError('Project not found');
        }
      } catch (error) {
        setError('Failed to load project');
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleRegenerateCharter = async () => {
    setRegenerating(true);
    setError('');

    try {
      const newCharter = await generateTeamCharter(project);
      const updatedProject = {
        ...project,
        teamCharter: newCharter,
        updatedAt: new Date()
      };
      
      await updateProject(id, updatedProject);
      setProject(updatedProject);
    } catch (error) {
      setError('Failed to regenerate team charter');
      console.error('Error regenerating charter:', error);
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownloadCharter = () => {
    if (!project.teamCharter) return;

    const element = document.createElement('a');
    const file = new Blob([project.teamCharter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${project.name}_Team_Charter.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (loading) {
    return <LoadingSpinner message="Loading project details..." />;
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Project not found
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {project.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {project.description}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Share />}
              onClick={() => setShareDialogOpen(true)}
            >
              Share
            </Button>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => navigate(`/edit-project/${id}`)}
            >
              Edit
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<Group />}
            label={`${project.members?.length || 0} members`}
            variant="outlined"
          />
          <Chip
            icon={<CalendarToday />}
            label={`Created ${formatDate(project.createdAt)}`}
            variant="outlined"
          />
          <Chip
            label={project.status || 'Active'}
            color={project.status === 'Active' ? 'success' : 'default'}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Project Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Overview
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Goals
                </Typography>
                <Typography variant="body2">
                  {project.goals || 'No goals specified'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Timeline
                </Typography>
                <Typography variant="body2">
                  {project.timeline || 'No timeline specified'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Team Members
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {project.memberEmails?.map((email) => (
                    <Chip
                      key={email}
                      label={email}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Roles
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {project.roles?.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Team Charter */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Team Charter
                </Typography>
                <Box>
                  <IconButton
                    size="small"
                    onClick={handleRegenerateCharter}
                    disabled={regenerating}
                    title="Regenerate Charter"
                  >
                    <AutoAwesome />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={handleDownloadCharter}
                    disabled={!project.teamCharter}
                    title="Download Charter"
                  >
                    <Download />
                  </IconButton>
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {project.teamCharter ? (
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    maxHeight: '400px',
                    overflow: 'auto',
                    p: 2,
                    backgroundColor: 'grey.50',
                    borderRadius: 1
                  }}
                >
                  {project.teamCharter}
                </Typography>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    No team charter generated yet
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AutoAwesome />}
                    onClick={handleRegenerateCharter}
                    disabled={regenerating}
                  >
                    {regenerating ? 'Generating...' : 'Generate Charter'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Project Breakdown */}
        {project.projectBreakdown && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Project Breakdown & Timeline
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    maxHeight: '400px',
                    overflow: 'auto',
                    p: 2,
                    backgroundColor: 'grey.50',
                    borderRadius: 1
                  }}
                >
                  {project.projectBreakdown}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Project</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Share this project with team members by sending them the project link:
          </Typography>
          <TextField
            fullWidth
            value={window.location.href}
            InputProps={{
              readOnly: true,
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setShareDialogOpen(false);
            }}
          >
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectDetail;

