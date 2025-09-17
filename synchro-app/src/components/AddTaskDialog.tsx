import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';

interface AddTaskDialogProps {
  open: boolean;
  project: any;
  formData: {
    title: string;
    description: string;
    assignedTo: string;
    dueDate: string;
  };
  onClose: () => void;
  onSave: () => void;
  onFormChange: (field: string, value: string) => void;
}

const AddTaskDialog: React.FC<AddTaskDialogProps> = ({
  open,
  project,
  formData,
  onClose,
  onSave,
  onFormChange
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Task</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Task Title"
          fullWidth
          variant="outlined"
          value={formData.title}
          onChange={(e) => onFormChange('title', e.target.value)}
          placeholder="Enter a clear, concise title..."
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Task Description"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={formData.description}
          onChange={(e) => onFormChange('description', e.target.value)}
          placeholder="Describe what needs to be done..."
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
          <InputLabel>Assign To</InputLabel>
          <Select
            value={formData.assignedTo}
            onChange={(e) => onFormChange('assignedTo', e.target.value)}
            label="Assign To"
          >
            <MenuItem value="">
              <em>Unassigned</em>
            </MenuItem>
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
                    {member.displayName ? member.displayName.charAt(0).toUpperCase() : 'U'}
                  </Box>
                  {member.displayName || member.email || 'Unknown User'}
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
          value={formData.dueDate}
          onChange={(e) => onFormChange('dueDate', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">Create Task</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTaskDialog;
