import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';

interface AddTaskDialogProps {
  open: boolean;
  project: any;
  formData: {
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
          label="Task Description"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={formData.description}
          onChange={(e) => onFormChange('description', e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Assign To (User ID)"
          fullWidth
          variant="outlined"
          value={formData.assignedTo}
          onChange={(e) => onFormChange('assignedTo', e.target.value)}
          sx={{ mb: 2 }}
          placeholder="Leave empty to assign to yourself"
        />
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
