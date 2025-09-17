import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';
import { Project } from '../types';

interface EditProjectDialogProps {
  open: boolean;
  project: Project | null;
  formData: {
    projectName: string;
    goal: string;
    deadline: string;
  };
  onClose: () => void;
  onSave: () => void;
  onFormChange: (field: string, value: string) => void;
}

const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
  open,
  project,
  formData,
  onClose,
  onSave,
  onFormChange
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Project</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Project Name"
          fullWidth
          variant="outlined"
          value={formData.projectName}
          onChange={(e) => onFormChange('projectName', e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Project Goal"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={formData.goal}
          onChange={(e) => onFormChange('goal', e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Deadline"
          type="date"
          fullWidth
          variant="outlined"
          value={formData.deadline}
          onChange={(e) => onFormChange('deadline', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProjectDialog;
