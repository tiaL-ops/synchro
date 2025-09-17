import React, { useState, useContext } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  Grid,
  Chip,
  IconButton,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { Add, Delete, AutoAwesome, Description } from '@mui/icons-material';
import AuthContext from '../contexts/AuthContext';
import { createProject } from '../firebase/projects';
import { generateTeamCharter, generateProjectBreakdown } from '../services/aiService';

const steps = ['Project Details', 'Team Setup', 'Goals & Roles', 'Generate Charter'];

const CreateProject = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goals: '',
    timeline: '',
    memberEmails: [],
    roles: [],
    teamCharter: '',
    projectBreakdown: ''
  });

  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('');

  const handleInputChange = (field) => (e) => {
    setFormData({
      ...formData,
      [field]: e.target.value
    });
  };

  const addMember = () => {
    if (newEmail && !formData.memberEmails.includes(newEmail)) {
      setFormData({
        ...formData,
        memberEmails: [...formData.memberEmails, newEmail]
      });
      setNewEmail('');
    }
  };

  const removeMember = (email) => {
    setFormData({
      ...formData,
      memberEmails: formData.memberEmails.filter(e => e !== email)
    });
  };

  const addRole = () => {
    if (newRole && !formData.roles.includes(newRole)) {
      setFormData({
        ...formData,
        roles: [...formData.roles, newRole]
      });
      setNewRole('');
    }
  };

  const removeRole = (role) => {
    setFormData({
      ...formData,
      roles: formData.roles.filter(r => r !== role)
    });
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const generateCharter = async () => {
    setLoading(true);
    setError('');
    
    try {
      const charter = await generateTeamCharter(formData);
      const breakdown = await generateProjectBreakdown(formData);
      
      setFormData({
        ...formData,
        teamCharter: charter,
        projectBreakdown: breakdown
      });
      setSuccess('Team charter and project breakdown generated successfully!');
    } catch (error) {
      setError('Failed to generate team charter. Please check your AI API configuration.');
      console.error('Error generating charter:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const projectData = {
        ...formData,
        owner: user.uid,
        ownerEmail: user.email,
        members: [user.uid, ...formData.memberEmails],
        status: 'Active',
        createdAt: new Date()
      };

      const projectId = await createProject(projectData);
      setSuccess('Project created successfully!');
      
      setTimeout(() => {
        navigate(`/project/${projectId}`);
      }, 2000);
    } catch (error) {
      setError('Failed to create project');
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleInputChange('description')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Timeline (e.g., 3 months, 1 semester)"
                value={formData.timeline}
                onChange={handleInputChange('timeline')}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Invite Team Members
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addMember()}
                />
                <Button
                  variant="contained"
                  onClick={addMember}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.memberEmails.map((email) => (
                  <Chip
                    key={email}
                    label={email}
                    onDelete={() => removeMember(email)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Goals"
                multiline
                rows={4}
                value={formData.goals}
                onChange={handleInputChange('goals')}
                placeholder="Describe the main objectives and goals of this project..."
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Team Roles
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Role (e.g., Project Manager, Developer, Designer)"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRole()}
                />
                <Button
                  variant="contained"
                  onClick={addRole}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.roles.map((role) => (
                  <Chip
                    key={role}
                    label={role}
                    onDelete={() => removeRole(role)}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={generateCharter}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
                  sx={{ mb: 2 }}
                >
                  {loading ? 'Generating...' : 'Generate Team Charter'}
                </Button>
                <Typography variant="body2" color="text.secondary">
                  AI will create a comprehensive team charter based on your project details
                </Typography>
              </Box>
            </Grid>
            
            {formData.teamCharter && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Generated Team Charter
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
                      {formData.teamCharter}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {formData.projectBreakdown && (
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
                      {formData.projectBreakdown}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Project
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Set up your project and generate an AI-powered team charter
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || !formData.teamCharter}
              startIcon={loading ? <CircularProgress size={20} /> : <Description />}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                (activeStep === 0 && (!formData.name || !formData.description)) ||
                (activeStep === 2 && !formData.goals)
              }
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateProject;

