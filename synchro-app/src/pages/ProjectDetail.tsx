import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Divider,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  Paper
} from '@mui/material';
import {
  ArrowBack,
  AccountCircle,
  ExitToApp,
  Group,
  CalendarToday,
  Add,
  Edit,
  Delete,
  PersonAdd,
  Assignment
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getProject, updateProject, addProjectMember, removeProjectMember } from '../services/projectService';
import { getProjectTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import { Project, Task } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Dialog states
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newTask, setNewTask] = useState({
    description: '',
    assignedTo: '',
    dueDate: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;
      
      try {
        const [projectData, projectTasks] = await Promise.all([
          getProject(id),
          getProjectTasks(id)
        ]);
        
        if (projectData) {
          setProject(projectData);
          setTasks(projectTasks);
        } else {
          setError('Project not found');
        }
      } catch (error) {
        setError('Failed to load project data');
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

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

  const handleAddMember = async () => {
    if (!project || !newMemberEmail.trim()) return;
    
    try {
      // In a real app, you'd search for the user by email first
      // For now, we'll just add them with a placeholder ID
      const memberId = `user_${Date.now()}`;
      await addProjectMember(project.id, memberId, newMemberEmail, 'Member');
      
      // Refresh project data
      const updatedProject = await getProject(project.id);
      if (updatedProject) {
        setProject(updatedProject);
      }
      
      setNewMemberEmail('');
      setAddMemberDialogOpen(false);
    } catch (error) {
      setError('Failed to add member');
      console.error('Error adding member:', error);
    }
  };

  const handleAddTask = async () => {
    if (!project || !newTask.description.trim()) return;
    
    try {
      const taskData = {
        projectId: project.id,
        description: newTask.description,
        status: 'To Do' as const,
        assignedTo: newTask.assignedTo || undefined,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
        createdBy: user!.uid
      };
      
      await createTask(taskData);
      
      // Refresh tasks
      const updatedTasks = await getProjectTasks(project.id);
      setTasks(updatedTasks);
      
      setNewTask({ description: '', assignedTo: '', dueDate: '' });
      setAddTaskDialogOpen(false);
    } catch (error) {
      setError('Failed to create task');
      console.error('Error creating task:', error);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      await updateTask(taskId, { status: newStatus });
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error) {
      setError('Failed to update task');
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      
      // Update local state
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      setError('Failed to delete task');
      console.error('Error deleting task:', error);
    }
  };

  const formatDate = (date: Date) => {
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

  const isOwner = project && project.createdBy === user?.uid;
  const isMember = project && user && project.teamMembers[user.uid];

  if (loading) {
    return <LoadingSpinner message="Loading project details..." />;
  }

  if (error || !project) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Project not found'}
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

  // Group tasks by status
  const tasksByStatus = {
    'To Do': tasks.filter(task => task.status === 'To Do'),
    'In Progress': tasks.filter(task => task.status === 'In Progress'),
    'Review': tasks.filter(task => task.status === 'Review'),
    'Done': tasks.filter(task => task.status === 'Done')
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
            {project.projectName}
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
        {/* Project Overview */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {project.projectName}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {project.goal}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                icon={<Group />}
                label={`${Object.keys(project.teamMembers).length} members`}
                variant="outlined"
              />
              <Chip
                icon={<CalendarToday />}
                label={`Created ${formatDate(project.createdAt)}`}
                variant="outlined"
              />
              <Chip
                label={project.visibility}
                color={project.visibility === 'public' ? 'success' : 'default'}
              />
            </Box>

            {/* Team Members */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Team Members
              </Typography>
              <List>
                {Object.entries(project.teamMembers).map(([userId, member]) => (
                  <ListItem key={userId}>
                    <ListItemText
                      primary={member.role}
                      secondary={`Joined ${formatDate(member.joinedAt)}`}
                    />
                    {isOwner && userId !== user?.uid && (
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => removeProjectMember(project.id, userId)}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            </Box>
          </CardContent>
        </Card>

        {/* Task Board */}
        <Typography variant="h5" gutterBottom>
          Task Board
        </Typography>
        
        <Grid container spacing={2}>
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
            <Grid item xs={12} sm={6} md={3} key={status}>
              <Paper sx={{ p: 2, minHeight: 400 }}>
                <Typography variant="h6" gutterBottom>
                  {status} ({statusTasks.length})
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {statusTasks.map((task) => (
                  <Card key={task.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="body2" gutterBottom>
                        {task.description}
                      </Typography>
                      {task.assignedTo && (
                        <Chip
                          icon={<PersonAdd />}
                          label="Assigned"
                          size="small"
                          sx={{ mb: 1 }}
                        />
                      )}
                      {task.dueDate && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Due: {formatDate(task.dueDate)}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      {isMember && (
                        <>
                          <Button
                            size="small"
                            onClick={() => handleTaskStatusChange(task.id, 'In Progress')}
                            disabled={task.status === 'In Progress'}
                          >
                            Start
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleTaskStatusChange(task.id, 'Done')}
                            disabled={task.status === 'Done'}
                          >
                            Complete
                          </Button>
                        </>
                      )}
                      {isOwner && (
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </CardActions>
                  </Card>
                ))}
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Add Task FAB */}
        {isMember && (
          <Fab
            color="primary"
            aria-label="add task"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
            }}
            onClick={() => setAddTaskDialogOpen(true)}
          >
            <Add />
          </Fab>
        )}
      </Container>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onClose={() => setAddMemberDialogOpen(false)}>
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddMember} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={addTaskDialogOpen} onClose={() => setAddTaskDialogOpen(false)}>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTaskDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTask} variant="contained">Add Task</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetail;
