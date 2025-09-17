import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Alert
} from '@mui/material';
import { PersonRemove } from '@mui/icons-material';

interface ConfirmRemoveMemberDialogProps {
  open: boolean;
  memberName: string;
  memberEmail: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmRemoveMemberDialog: React.FC<ConfirmRemoveMemberDialogProps> = ({
  open,
  memberName,
  memberEmail,
  onConfirm,
  onCancel,
  loading = false
}) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonRemove color="error" />
          <Typography variant="h6">Remove Team Member</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This action cannot be undone. The member will lose access to this project and all its tasks.
        </Alert>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Avatar sx={{ bgcolor: 'error.main' }}>
            {memberName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {memberName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {memberEmail}
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body2" sx={{ mt: 2 }}>
          Are you sure you want to remove this member from the project? They will no longer be able to:
        </Typography>
        <ul style={{ marginTop: 8, paddingLeft: 20 }}>
          <li>View project details and tasks</li>
          <li>Create or edit tasks</li>
          <li>Access project files and discussions</li>
        </ul>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onCancel} 
          disabled={loading}
          color="inherit"
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained"
          disabled={loading}
          startIcon={<PersonRemove />}
        >
          {loading ? 'Removing...' : 'Remove Member'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmRemoveMemberDialog;
