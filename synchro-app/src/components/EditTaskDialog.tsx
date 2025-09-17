import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Avatar,
  Chip,
  IconButton
} from '@mui/material';
import { Edit, Person, Close } from '@mui/icons-material';
import { updateTask } from '../services/taskService';
import { getUserById } from '../services/userService';
import { Task, User } from '../types';

interface EditTaskDialogProps {
  open: boolean;
  task: Task | null;
  projectMembers: { [userId: string]: any };
  project?: { createdBy: string; createdByEmail?: string };
  onClose: () => void;
  onTaskUpdated: () => void;
}

const EditTaskDialog: React.FC<EditTaskDialogProps> = ({
  open,
  task,
  projectMembers,
  project,
  onClose,
  onTaskUpdated
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do' as 'To Do' | 'In Progress' | 'Review' | 'Done',
    assignedToUsers: [] as string[],
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [memberDetails, setMemberDetails] = useState<{ [userId: string]: User }>({});

  useEffect(() => {
    if (open && task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'To Do',
        assignedToUsers: task.assignedToUsers || (task.assignedTo ? [task.assignedTo] : []),
        dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : ''
      });
      setError('');
      loadMemberDetails();
    }
  }, [open, task, projectMembers]);

  const loadMemberDetails = async () => {
    const details: { [userId: string]: User } = {};
    const memberIds = Object.keys(projectMembers);
    
    // Add project owner if not already in teamMembers
    if (project?.createdBy && !memberIds.includes(project.createdBy)) {
      memberIds.push(project.createdBy);
    }
    
    const promises = memberIds.map(async (userId) => {
      try {
        const user = await getUserById(userId);
        if (user) {
          details[userId] = user;
        }
      } catch (error) {
        console.error('Error loading member details:', error);
      }
    });
    
    await Promise.all(promises);
    setMemberDetails(details);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAssigneeToggle = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedToUsers: prev.assignedToUsers.includes(userId)
        ? prev.assignedToUsers.filter(id => id !== userId)
        : [...prev.assignedToUsers, userId]
    }));
  };

  const handleSave = async () => {
    if (!task || !formData.title.trim() || !formData.description.trim()) {
      setError('Please enter both task title and description');
      return;
    }

    // Prevent editing completed tasks
    if (task.status === 'Done') {
      setError('Cannot edit completed tasks');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updateData: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        assignedToUsers: formData.assignedToUsers,
        // Keep backward compatibility
        assignedTo: formData.assignedToUsers.length > 0 ? formData.assignedToUsers[0] : null,
        updatedAt: new Date()
      };

      if (formData.dueDate) {
        updateData.dueDate = new Date(formData.dueDate);
      } else {
        updateData.dueDate = null;
      }

      await updateTask(task.id, updateData);
      
      if (onTaskUpdated) {
        onTaskUpdated();
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      status: 'To Do',
      assignedToUsers: [],
      dueDate: ''
    });
    setError('');
    onClose();
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'success';
      case 'In Progress': return 'primary';
      case 'Review': return 'warning';
      case 'To Do': return 'default';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Edit color="primary" />
            <Typography variant="h6">Edit Task</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {/* Show warning for completed tasks */}
          {task?.status === 'Done' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              This task is completed and cannot be edited. You can only delete it.
            </Alert>
          )}
          
          {/* Task Title */}
          <TextField
            fullWidth
            label="Task Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter a clear, concise title for this task..."
            required
            disabled={task?.status === 'Done'}
          />

          {/* Task Description */}
          <TextField
            fullWidth
            label="Task Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe what needs to be done..."
            required
            disabled={task?.status === 'Done'}
          />

          {/* Status */}
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              label="Status"
              disabled={task?.status === 'Done'}
            >
              <MenuItem value="To Do">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="To Do" size="small" color="default" />
                  <Typography variant="body2">Not started</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="In Progress">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="In Progress" size="small" color="primary" />
                  <Typography variant="body2">Currently working on</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="Review">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="Review" size="small" color="warning" />
                  <Typography variant="body2">Ready for review</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="Done">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="Done" size="small" color="success" />
                  <Typography variant="body2">Completed</Typography>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Assignees */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Assign To (Select multiple)
            </Typography>
            <Box sx={{ 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 1, 
              p: 2, 
              maxHeight: 200, 
              overflow: 'auto' 
            }}>
              {Object.entries(memberDetails).map(([userId, user]) => (
                <Box 
                  key={userId} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    p: 1, 
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => task?.status !== 'Done' && handleAssigneeToggle(userId)}
                >
                  <input
                    type="checkbox"
                    checked={formData.assignedToUsers.includes(userId)}
                    onChange={() => handleAssigneeToggle(userId)}
                    disabled={task?.status === 'Done'}
                    style={{ margin: 0 }}
                  />
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {user.displayName || user.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {Object.keys(memberDetails).length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No team members available
                </Typography>
              )}
            </Box>
          </Box>

          {/* Due Date */}
          <TextField
            fullWidth
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={task?.status === 'Done'}
          />

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !formData.title.trim() || !formData.description.trim() || task?.status === 'Done'}
          startIcon={<Edit />}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTaskDialog;
