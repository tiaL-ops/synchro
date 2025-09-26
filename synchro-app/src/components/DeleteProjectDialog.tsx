import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  Warning,
  Delete
} from '@mui/icons-material';

interface DeleteProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  projectName: string;
}

const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({
  open,
  onClose,
  onConfirm,
  projectName
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationText, setConfirmationText] = useState('');

  const handleConfirm = async () => {
    if (confirmationText !== projectName) {
      setError('Project name does not match. Please type the exact project name to confirm deletion.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onConfirm();
      handleClose();
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmationText('');
    setError('');
    setLoading(false);
    onClose();
  };

  const isConfirmButtonDisabled = confirmationText !== projectName || loading;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="error" />
          <Typography variant="h6">Delete Project</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            This action cannot be undone!
          </Typography>
          <Typography variant="body2">
            Deleting this project will permanently remove:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            <li>All project tasks and their data</li>
            <li>All team member associations</li>
            <li>All project settings and configurations</li>
            <li>All project history and activity</li>
          </Box>
        </Alert>

        <Typography variant="body1" sx={{ mb: 2 }}>
          To confirm deletion, please type the project name exactly as shown:
        </Typography>
        
        <Typography variant="h6" sx={{ 
          mb: 2, 
          p: 2, 
          backgroundColor: 'grey.100', 
          borderRadius: 1,
          fontFamily: 'monospace'
        }}>
          "{projectName}"
        </Typography>

        <TextField
          fullWidth
          label="Type project name to confirm"
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
          placeholder={`Type "${projectName}" here`}
          variant="outlined"
          disabled={loading}
          error={!!error && confirmationText !== projectName}
          helperText={error && confirmationText !== projectName ? error : ''}
        />
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={isConfirmButtonDisabled}
          startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
        >
          {loading ? 'Deleting...' : 'Delete Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteProjectDialog;

