import React, { useState } from 'react';
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
  Alert,
  Box,
  Typography
} from '@mui/material';
import { findUserByEmail } from '../services/userService';
import { User } from '../types';

interface AddMemberDialogProps {
  open: boolean;
  project: any;
  onClose: () => void;
  onAddMember: (userId: string, userEmail: string, role: 'Member' | 'Viewer') => void;
}

const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
  open,
  project,
  onClose,
  onAddMember
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Member' | 'Viewer'>('Member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundUser, setFoundUser] = useState<User | null>(null);

  const handleEmailChange = async (newEmail: string) => {
    setEmail(newEmail);
    setError('');
    setFoundUser(null);

    if (newEmail.trim() && newEmail.includes('@')) {
      setLoading(true);
      try {
        const user = await findUserByEmail(newEmail.trim());
        if (user) {
          setFoundUser(user);
        } else {
          setError('User not found. Please make sure the user has an account.');
        }
      } catch (err) {
        console.error('User lookup error:', err);
        setError(`Error looking up user: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAdd = () => {
    if (foundUser) {
      onAddMember(foundUser.uid, foundUser.email, role);
      setEmail('');
      setRole('Member');
      setFoundUser(null);
      setError('');
    }
  };

  const handleClose = () => {
    onClose();
    setEmail('');
    setRole('Member');
    setFoundUser(null);
    setError('');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Team Member</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Email Address"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          sx={{ mb: 2 }}
          disabled={loading}
        />
        
        {loading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Looking up user...
            </Typography>
          </Box>
        )}

        {foundUser && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Found user: {foundUser.displayName} ({foundUser.email})
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select
            value={role}
            label="Role"
            onChange={(e) => setRole(e.target.value as 'Member' | 'Viewer')}
          >
            <MenuItem value="Member">Member</MenuItem>
            <MenuItem value="Viewer">Viewer</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleAdd} 
          variant="contained"
          disabled={!foundUser}
        >
          Add Member
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMemberDialog;
