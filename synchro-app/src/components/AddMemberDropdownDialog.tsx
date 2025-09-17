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
  Chip
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { findUserByEmail } from '../services/userService';
import { createInvitation } from '../services/invitationService';
import { User } from '../types';

interface AddMemberDropdownDialogProps {
  open: boolean;
  project: any;
  onClose: () => void;
  onInvitationSent?: () => void;
}

const AddMemberDropdownDialog: React.FC<AddMemberDropdownDialogProps> = ({
  open,
  project,
  onClose,
  onInvitationSent
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Member' | 'Viewer'>('Member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [searchMode, setSearchMode] = useState<'email' | 'dropdown'>('dropdown');

  // Get existing project members for dropdown
  const existingMembers = project ? Object.keys(project.teamMembers || {}) : [];
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  useEffect(() => {
    if (open && project) {
      // Reset form when dialog opens
      setEmail('');
      setRole('Member');
      setError('');
      setFoundUser(null);
      setSearchMode('dropdown');
      loadAvailableUsers();
    }
  }, [open, project]);

  const loadAvailableUsers = async () => {
    // For now, we'll keep the email search functionality
    // In a real app, you might want to load a list of all users or recently invited users
    setAvailableUsers([]);
  };

  const handleEmailChange = async (newEmail: string) => {
    setEmail(newEmail);
    setError('');
    setFoundUser(null);

    if (newEmail.trim() && newEmail.includes('@')) {
      setLoading(true);
      try {
        const user = await findUserByEmail(newEmail.trim().toLowerCase());
        if (user) {
          // Check if user is already a member
          if (existingMembers.includes(user.uid)) {
            setError('This user is already a member of the project');
          } else {
            setFoundUser(user);
          }
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

  const handleAdd = async () => {
    if (foundUser && project) {
      try {
        await createInvitation(
          project.id,
          project.projectName,
          project.createdBy,
          project.createdByEmail || 'Unknown',
          foundUser.uid,
          foundUser.email,
          role
        );
        
        if (onInvitationSent) {
          onInvitationSent();
        }
        
        setEmail('');
        setRole('Member');
        setFoundUser(null);
        setError('');
      } catch (error) {
        console.error('Error creating invitation:', error);
        setError('Failed to send invitation. Please try again.');
      }
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('Member');
    setFoundUser(null);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAdd color="primary" />
          <Typography variant="h6">Add Team Member</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose how to add a new member:
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant={searchMode === 'dropdown' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setSearchMode('dropdown')}
            >
              Quick Add
            </Button>
            <Button
              variant={searchMode === 'email' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setSearchMode('email')}
            >
              Search by Email
            </Button>
          </Box>
        </Box>

        {searchMode === 'dropdown' ? (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Quick Add: Select from recently invited users or type an email below
            </Alert>
            
            <TextField
              fullWidth
              label="Email Address"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="Enter email address to search"
              sx={{ mb: 2 }}
              disabled={loading}
            />
          </Box>
        ) : (
          <Box>
            <TextField
              fullWidth
              label="Email Address"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="Enter complete email address"
              sx={{ mb: 2 }}
              disabled={loading}
            />
          </Box>
        )}

        {foundUser && (
          <Box sx={{ 
            p: 2, 
            border: '1px solid', 
            borderColor: 'primary.main', 
            borderRadius: 1, 
            mb: 2,
            bgcolor: 'primary.50'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {foundUser.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {foundUser.displayName || 'Unknown User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {foundUser.email}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value as 'Member' | 'Viewer')}
            label="Role"
          >
            <MenuItem value="Member">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="Member" size="small" color="primary" />
                <Typography variant="body2">
                  Can create and edit tasks, view all project content
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="Viewer">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="Viewer" size="small" color="default" />
                <Typography variant="body2">
                  Can view project content but cannot edit tasks
                </Typography>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={!foundUser || loading}
          startIcon={<PersonAdd />}
        >
          {loading ? 'Searching...' : 'Send Invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMemberDropdownDialog;
