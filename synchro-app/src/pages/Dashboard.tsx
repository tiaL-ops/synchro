import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Fab,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Snackbar
} from '@mui/material';
import {
  Add,
  AccountCircle,
  ExitToApp
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getUserProjects, updateProject } from '../services/projectService';
import { getUserTasks, createTask } from '../services/taskService';
import { Project, Task } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ProjectCard from '../components/ProjectCard';
import TaskList from '../components/TaskList';
import EditProjectDialog from '../components/EditProjectDialog';
import AddMemberDialog from '../components/AddMemberDialog';
import AddTaskDialog from '../components/AddTaskDialog';
import InvitationNotification from '../components/InvitationNotification';

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
  const [newTask, setNewTask] = useState({
    title: '',
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
        setLoading(true);
        const [projectsData, tasksData] = await Promise.all([
          getUserProjects(user.uid),
          getUserTasks(user.uid)
        ]);
        setProjects(projectsData);
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
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
    setAddMemberDialog(true);
  };

  const openAddTaskDialog = (project: Project) => {
    setSelectedProject(project);
    setNewTask({
      title: '',
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
      
      if (editForm.deadline) {
        updateData.deadline = new Date(editForm.deadline);
      }
      
      await updateProject(selectedProject.id, updateData);
      
      const updatedProjects = await getUserProjects(user!.uid);
      setProjects(updatedProjects);
      
      setEditProjectDialog(false);
      showSnackbar('Project updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating project:', error);
      showSnackbar('Failed to update project', 'error');
    }
  };

  const handleInvitationSent = () => {
    setAddMemberDialog(false);
    showSnackbar('Invitation sent successfully!', 'success');
  };

  const handleAddTask = async () => {
    if (!selectedProject || !newTask.title.trim() || !newTask.description.trim()) return;
    
    try {
      const taskData: any = {
        projectId: selectedProject.id,
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        status: 'To Do' as const,
        createdBy: user!.uid
      };
      
      if (newTask.assignedTo && newTask.assignedTo.trim()) {
        taskData.assignedTo = newTask.assignedTo.trim();
      }
      
      if (newTask.dueDate) {
        taskData.dueDate = new Date(newTask.dueDate);
      }
      
      await createTask(taskData);
      
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

        {/* Invitation Notifications */}
        <InvitationNotification />

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
                    <ProjectCard
                      project={project}
                      currentUserId={user!.uid}
                      onViewDetails={(project) => navigate(`/project/${project.id}`)}
                      onEditProject={openEditProjectDialog}
                      onAddMember={openAddMemberDialog}
                      onAddTask={openAddTaskDialog}
                      formatDate={formatDate}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>

          {/* Tasks Section */}
          <Grid item xs={12} md={4}>
            <TaskList
              tasks={tasks}
              formatDate={formatDate}
              getTaskStatusColor={getTaskStatusColor}
            />
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

      {/* Dialogs */}
      <EditProjectDialog
        open={editProjectDialog}
        project={selectedProject}
        formData={editForm}
        onClose={() => setEditProjectDialog(false)}
        onSave={handleEditProject}
        onFormChange={(field, value) => setEditForm({ ...editForm, [field]: value })}
      />

      <AddMemberDialog
        open={addMemberDialog}
        project={selectedProject}
        onClose={() => setAddMemberDialog(false)}
        onInvitationSent={handleInvitationSent}
      />

      <AddTaskDialog
        open={addTaskDialog}
        project={selectedProject}
        formData={newTask}
        onClose={() => setAddTaskDialog(false)}
        onSave={handleAddTask}
        onFormChange={(field, value) => setNewTask({ ...newTask, [field]: value })}
      />

      {/* Snackbar */}
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
