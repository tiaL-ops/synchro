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
  Paper,
  FormControl,
  InputLabel,
  Select
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
import { getUserById } from '../services/userService';
import { Project, Task } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import TeamMembersDetail from '../components/TeamMembersDetail';
import PendingInvitationsList from '../components/PendingInvitationsList';
import AddMemberDropdownDialog from '../components/AddMemberDropdownDialog';
import EditTaskDialog from '../components/EditTaskDialog';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [assigneeDetails, setAssigneeDetails] = useState<{ [userId: string]: any }>({});
  
  // Dialog states
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
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

  // Load assignee details when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      loadAssigneeDetails();
    }
  }, [tasks]);

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

  const handleLeaveProject = async () => {
    if (!project || !user) return;
    
    try {
      await removeProjectMember(project.id, user.uid);
      
      // Navigate back to dashboard after leaving
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to leave project');
      console.error('Error leaving project:', error);
    }
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
    if (!project || !newTask.title.trim() || !newTask.description.trim()) return;
    
    try {
      const taskData = {
        projectId: project.id,
        title: newTask.title,
        description: newTask.description,
        status: 'To Do' as const,
        assignedTo: newTask.assignedTo && newTask.assignedTo.trim() ? newTask.assignedTo : undefined,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
        createdBy: user!.uid
      };
      
      await createTask(taskData);
      
      // Refresh tasks
      const updatedTasks = await getProjectTasks(project.id);
      setTasks(updatedTasks);
      
      setNewTask({ title: '', description: '', assignedTo: '', dueDate: '' });
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

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditTaskDialogOpen(true);
  };

  const handleTaskUpdated = async () => {
    // Refresh tasks after update
    if (id && user) {
      try {
        const updatedTasks = await getProjectTasks(id);
        setTasks(updatedTasks);
      } catch (error) {
        console.error('Error refreshing tasks:', error);
      }
    }
  };

  const handleInvitationSent = () => {
    setAddMemberDialogOpen(false);
    // Could show a success message here
  };

  const formatDate = (date: Date | undefined | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString();
  };

  const loadAssigneeDetails = async () => {
    if (!tasks.length) return;
    
    const details: { [userId: string]: any } = {};
    const allAssigneeIds = new Set<string>();
    
    // Collect all unique assignee IDs from tasks
    tasks.forEach(task => {
      if (task.assignedToUsers) {
        task.assignedToUsers.forEach(userId => allAssigneeIds.add(userId));
      } else if (task.assignedTo) {
        allAssigneeIds.add(task.assignedTo);
      }
    });
    
    // Load user details for all assignees
    const promises = Array.from(allAssigneeIds).map(async (userId) => {
      try {
        const user = await getUserById(userId);
        if (user) {
          details[userId] = user;
        }
      } catch (error) {
        console.error('Error loading assignee details:', error);
      }
    });
    
    await Promise.all(promises);
    setAssigneeDetails(details);
  };

  const getAssigneeNames = (task: Task) => {
    const assigneeIds = task.assignedToUsers || (task.assignedTo ? [task.assignedTo] : []);
    return assigneeIds.map(userId => {
      const userDetails = assigneeDetails[userId];
      if (userDetails) {
        return userDetails.displayName || userDetails.email || 'Unknown User';
      }
      // Fallback to user ID if details not loaded yet
      return `User ${userId.substring(0, 8)}`;
    });
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

  const isOwner = Boolean(project && project.createdBy === user?.uid);
  const isMember = Boolean(project && user && project.teamMembers[user.uid]);

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

            {/* Pending Invitations (for owners) */}
            <PendingInvitationsList 
              projectId={project.id} 
              isOwner={isOwner} 
            />

            {/* Team Members */}
            <TeamMembersDetail
              teamMembers={project.teamMembers}
              createdBy={project.createdBy}
              currentUserId={user?.uid || ''}
              onRemoveMember={isOwner ? (userId) => removeProjectMember(project.id, userId) : undefined}
              onLeaveProject={!isOwner && isMember ? handleLeaveProject : undefined}
              formatDate={formatDate}
            />
          </CardContent>
        </Card>

        {/* Task Board */}
        <Typography variant="h5" gutterBottom>
          Task Board
        </Typography>
        
        <Grid container spacing={2}>
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
            const currentStatus = status as 'To Do' | 'In Progress' | 'Review' | 'Done';
            return (
            <Grid item xs={12} sm={6} md={3} key={status}>
              <Paper sx={{ p: 2, minHeight: 400 }}>
                <Typography variant="h6" gutterBottom>
                  {status} ({statusTasks.length})
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {statusTasks.map((task) => (
                  <Card key={task.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {task.title || 'Untitled Task'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {task.description}
                      </Typography>
                      
                      {/* Multiple Assignees */}
                      {(task.assignedToUsers && task.assignedToUsers.length > 0) || task.assignedTo ? (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            Assigned to:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {getAssigneeNames(task).map((name, index) => (
                              <Chip
                                key={index}
                                label={name}
                                size="small"
                                color="primary"
                                variant="outlined"
                                icon={<PersonAdd />}
                              />
                            ))}
                          </Box>
                        </Box>
                      ) : null}
                      
                      {task.dueDate && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Due: {formatDate(task.dueDate)}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      {isMember && status !== 'Done' && (
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
                            disabled={status === 'Done'}
                          >
                            Complete
                          </Button>
                          <IconButton
                            size="small"
                            onClick={() => handleEditTask(task)}
                            title="Edit task"
                          >
                            <Edit />
                          </IconButton>
                        </>
                      )}
                      {isMember && status === 'Done' && (
                        <Typography variant="caption" color="success.main" sx={{ fontStyle: 'italic' }}>
                          ✓ Task completed
                        </Typography>
                      )}
                      {isOwner && (
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTask(task.id)}
                          title="Delete task"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </CardActions>
                  </Card>
                ))}
              </Paper>
            </Grid>
            );
          })}
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
      <AddMemberDropdownDialog
        open={addMemberDialogOpen}
        project={project}
        onClose={() => setAddMemberDialogOpen(false)}
        onInvitationSent={handleInvitationSent}
      />

      {/* Add Task Dialog */}
      <Dialog open={addTaskDialogOpen} onClose={() => setAddTaskDialogOpen(false)}>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            variant="outlined"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Enter a clear, concise title..."
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Task Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            placeholder="Describe what needs to be done..."
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Assign To</InputLabel>
            <Select
              value={newTask.assignedTo}
              onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
              label="Assign To"
            >
              <MenuItem value="">
                <em>Unassigned</em>
              </MenuItem>
              {/* Project Owner */}
              {project?.createdBy && (
                <MenuItem key={project.createdBy} value={project.createdBy}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}
                    >
                    {project.createdByEmail ? project.createdByEmail.charAt(0).toUpperCase() : 'O'}
                  </Box>
                  {project.createdByEmail || `Owner (${project.createdBy.substring(0, 8)}...)`}
                    <Box sx={{ ml: 'auto', fontSize: '0.75rem', color: 'text.secondary' }}>
                      Owner
                    </Box>
                  </Box>
                </MenuItem>
              )}
              
              {/* Team Members */}
              {project?.teamMembers && Object.entries(project.teamMembers).map(([userId, member]: [string, any]) => (
                <MenuItem key={userId} value={userId}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {userId.charAt(0).toUpperCase()}
                    </Box>
                    {`Member (${userId.substring(0, 8)}...)`}
                    <Box sx={{ ml: 'auto', fontSize: '0.75rem', color: 'text.secondary' }}>
                      {member.role}
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
          <Button 
            onClick={handleAddTask} 
            variant="contained"
            disabled={!newTask.title.trim() || !newTask.description.trim()}
          >
            Add Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog */}
      <EditTaskDialog
        open={editTaskDialogOpen}
        task={selectedTask}
        projectMembers={project?.teamMembers || {}}
        project={project ? { createdBy: project.createdBy, createdByEmail: project.createdByEmail } : undefined}
        onClose={() => setEditTaskDialogOpen(false)}
        onTaskUpdated={handleTaskUpdated}
      />
    </Box>
  );
};

export default ProjectDetail;
