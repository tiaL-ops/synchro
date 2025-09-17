import React, { useState, useEffect } from 'react';
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
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Snackbar
} from '@mui/material';
import {
  Add,
  AccountCircle,
  ExitToApp,
  Group,
  CalendarToday,
  Assignment,
  Person,
  Edit,
  PersonAdd,
  Task as TaskIcon,
  Schedule
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getUserProjects, updateProject, addProjectMember } from '../services/projectService';
import { getUserTasks, createTask } from '../services/taskService';
import { Project, Task } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Dialog states
  const [editProjectDialog, setEditProjectDialog] = useState(false);
  const [addMemberDialog, setAddMemberDialog] = useState(false);
  const [addTaskDialog, setAddTaskDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Form states
  const [editForm, setEditForm] = useState({
    projectName: '',
    goal: '',
    deadline: ''
  });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Member' | 'Viewer'>('Member');
  const [newTask, setNewTask] = useState({
    description: '',
    assignedTo: '',
    dueDate: ''
  });
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const [userProjects, userTasks] = await Promise.all([
          getUserProjects(user.uid),
          getUserTasks(user.uid)
        ]);
        setProjects(userProjects);
        setTasks(userTasks);
      } catch (error) {
        setError('Failed to load data');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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

  const formatDate = (date: Date | undefined | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString();
  };

  const getTaskStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'To Do': return 'default';
      case 'In Progress': return 'primary';
      case 'Review': return 'warning';
      case 'Done': return 'success';
      default: return 'default';
    }
  };

  // New handler functions
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const openEditProjectDialog = (project: Project) => {
    setSelectedProject(project);
    setEditForm({
      projectName: project.projectName,
      goal: project.goal,
      deadline: project.deadline ? project.deadline.toISOString().split('T')[0] : ''
    });
    setEditProjectDialog(true);
  };

  const openAddMemberDialog = (project: Project) => {
    setSelectedProject(project);
    setNewMemberEmail('');
    setNewMemberRole('Member');
    setAddMemberDialog(true);
  };

  const openAddTaskDialog = (project: Project) => {
    setSelectedProject(project);
    setNewTask({
      description: '',
      assignedTo: '',
      dueDate: ''
    });
    setAddTaskDialog(true);
  };

  const handleEditProject = async () => {
    if (!selectedProject) return;
    
    try {
      const updateData: any = {
        projectName: editForm.projectName,
        goal: editForm.goal
      };
      
      // Only add deadline if it's provided
      if (editForm.deadline) {
        updateData.deadline = new Date(editForm.deadline);
      }
      
      await updateProject(selectedProject.id, updateData);
      
      // Refresh projects
      const updatedProjects = await getUserProjects(user!.uid);
      setProjects(updatedProjects);
      
      setEditProjectDialog(false);
      showSnackbar('Project updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating project:', error);
      showSnackbar('Failed to update project', 'error');
    }
  };

  const handleAddMember = async () => {
    if (!selectedProject || !newMemberEmail.trim()) return;
    
    try {
      // For now, we'll use the email as the user ID
      // In a real app, you'd look up the user by email first
      const userId = newMemberEmail.trim();
      
      await addProjectMember(selectedProject.id, userId, newMemberEmail, newMemberRole);
      
      // Refresh projects
      const updatedProjects = await getUserProjects(user!.uid);
      setProjects(updatedProjects);
      
      setAddMemberDialog(false);
      showSnackbar('Team member added successfully!', 'success');
    } catch (error) {
      console.error('Error adding team member:', error);
      showSnackbar('Failed to add team member', 'error');
    }
  };

  const handleAddTask = async () => {
    if (!selectedProject || !newTask.description.trim()) return;
    
    try {
      const taskData: any = {
        projectId: selectedProject.id,
        description: newTask.description.trim(),
        status: 'To Do' as const,
        createdBy: user!.uid
      };
      
      // Only add assignedTo if it's not empty
      if (newTask.assignedTo && newTask.assignedTo.trim()) {
        taskData.assignedTo = newTask.assignedTo.trim();
      }
      
      // Only add dueDate if it's provided
      if (newTask.dueDate) {
        taskData.dueDate = new Date(newTask.dueDate);
      }
      
      await createTask(taskData);
      
      // Refresh tasks
      const updatedTasks = await getUserTasks(user!.uid);
      setTasks(updatedTasks);
      
      setAddTaskDialog(false);
      showSnackbar('Task created successfully!', 'success');
    } catch (error) {
      console.error('Error creating task:', error);
      showSnackbar('Failed to create task', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your projects and tasks..." />;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Team Projects MVP
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

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {user?.displayName || 'User'}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your team projects and track your tasks
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Projects Section */}
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              Your Projects
            </Typography>
            {projects.length === 0 ? (
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
            ) : (
              <Grid container spacing={2}>
                {projects.map((project) => (
                  <Grid item xs={12} sm={6} key={project.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                          {project.projectName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {project.goal}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip
                            icon={<Group />}
                            label={`${Object.keys(project.teamMembers).length} members`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            icon={<CalendarToday />}
                            label={formatDate(project.createdAt)}
                            size="small"
                            variant="outlined"
                          />
                          {project.deadline && (
                            <Chip
                              icon={<Schedule />}
                              label={`Due ${formatDate(project.deadline)}`}
                              size="small"
                              variant="outlined"
                              color="warning"
                            />
                          )}
                        </Box>

                        <Chip
                          label={project.visibility}
                          size="small"
                          color={project.visibility === 'public' ? 'success' : 'default'}
                        />
                      </CardContent>
                      
                      <CardActions sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Button
                          size="small"
                          onClick={() => navigate(`/project/${project.id}`)}
                        >
                          View Details
                        </Button>
                        
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {/* Only show edit buttons if user is the project owner */}
                          {project.createdBy === user?.uid && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => openEditProjectDialog(project)}
                                title="Edit Project"
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => openAddMemberDialog(project)}
                                title="Add Member"
                              >
                                <PersonAdd />
                              </IconButton>
                            </>
                          )}
                          <IconButton
                            size="small"
                            onClick={() => openAddTaskDialog(project)}
                            title="Add Task"
                          >
                            <TaskIcon />
                          </IconButton>
                        </Box>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>

          {/* Tasks Section */}
          <Grid item xs={12} md={4}>
            <Typography variant="h5" gutterBottom>
              Your Tasks
            </Typography>
            {tasks.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No tasks assigned to you yet
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <List>
                  {tasks.slice(0, 5).map((task, index) => (
                    <React.Fragment key={task.id}>
                      <ListItem>
                        <ListItemText
                          primary={task.description}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              <Chip
                                label={task.status}
                                size="small"
                                color={getTaskStatusColor(task.status) as any}
                              />
                              {task.dueDate && (
                                <Typography variant="caption" color="text.secondary">
                                  Due: {formatDate(task.dueDate)}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < tasks.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                {tasks.length > 5 && (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      And {tasks.length - 5} more tasks...
                    </Typography>
                  </Box>
                )}
              </Card>
            )}
          </Grid>
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

      {/* Edit Project Dialog */}
      <Dialog open={editProjectDialog} onClose={() => setEditProjectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            variant="outlined"
            value={editForm.projectName}
            onChange={(e) => setEditForm({ ...editForm, projectName: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Project Goal"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={editForm.goal}
            onChange={(e) => setEditForm({ ...editForm, goal: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Deadline"
            type="date"
            fullWidth
            variant="outlined"
            value={editForm.deadline}
            onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditProjectDialog(false)}>Cancel</Button>
          <Button onClick={handleEditProject} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialog} onClose={() => setAddMemberDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Team Member</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            fullWidth
            variant="outlined"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={newMemberRole}
              label="Role"
              onChange={(e) => setNewMemberRole(e.target.value as 'Member' | 'Viewer')}
            >
              <MenuItem value="Member">Member</MenuItem>
              <MenuItem value="Viewer">Viewer</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberDialog(false)}>Cancel</Button>
          <Button onClick={handleAddMember} variant="contained">Add Member</Button>
        </DialogActions>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={addTaskDialog} onClose={() => setAddTaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Assign To (User ID)"
            fullWidth
            variant="outlined"
            value={newTask.assignedTo}
            onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
            sx={{ mb: 2 }}
            placeholder="Leave empty to assign to yourself"
          />
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            variant="outlined"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTaskDialog(false)}>Cancel</Button>
          <Button onClick={handleAddTask} variant="contained">Create Task</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
