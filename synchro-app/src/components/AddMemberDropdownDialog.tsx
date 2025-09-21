import React, { useState, useEffect, useRef } from 'react';
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
  Autocomplete,
  CircularProgress
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { searchUsers } from '../services/userService';
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [role, setRole] = useState<'Member' | 'Viewer'>('Member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Get existing project members to filter out
  const existingMembers = project ? Object.keys(project.teamMembers || {}) : [];

  useEffect(() => {
    if (open && project) {
      // Reset form when dialog opens
      setSelectedUser(null);
      setRole('Member');
      setError('');
      setSearchTerm('');
      setSearchResults([]);
    }
  }, [open, project]);

  // Debounced search function
  const performSearch = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchUsers(term, 10);
      // Filter out existing members
      const filteredResults = results.filter(user => !existingMembers.includes(user.uid));
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (newValue: string) => {
    setSearchTerm(newValue);
    setSelectedUser(null);
    setError('');

    // Clear previous debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the search
    debounceRef.current = setTimeout(() => {
      performSearch(newValue);
    }, 300);
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleAdd = async () => {
    if (selectedUser && project) {
      setLoading(true);
      try {
        await createInvitation(
          project.id,
          project.projectName,
          project.createdBy,
          project.createdByEmail || 'Unknown',
          selectedUser.uid,
          selectedUser.email,
          role
        );
        
        if (onInvitationSent) {
          onInvitationSent();
        }
        
        setSelectedUser(null);
        setRole('Member');
        setSearchTerm('');
        setSearchResults([]);
        setError('');
      } catch (error) {
        console.error('Error creating invitation:', error);
        setError('Failed to send invitation. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    setRole('Member');
    setSearchTerm('');
    setSearchResults([]);
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
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Search for a user by email or name to invite them to the project:
        </Typography>

        <Autocomplete
          freeSolo
          options={searchResults}
          getOptionLabel={(option) => {
            if (typeof option === 'string') return option;
            return option.displayName ? `${option.displayName} (${option.email})` : option.email;
          }}
          value={selectedUser}
          onChange={(event, newValue) => {
            if (typeof newValue === 'object' && newValue) {
              setSelectedUser(newValue);
              setError('');
            } else {
              setSelectedUser(null);
            }
          }}
          onInputChange={(event, newInputValue) => {
            handleSearchChange(newInputValue);
          }}
          loading={searchLoading}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search for user"
              placeholder="Type email or name..."
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  {option.displayName?.charAt(0)?.toUpperCase() || option.email.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" fontWeight="medium">
                    {option.displayName || 'No name'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {option.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
          sx={{ mb: 2 }}
        />

        {selectedUser && (
          <Box sx={{ 
            p: 2, 
            border: '1px solid', 
            borderColor: 'success.main', 
            borderRadius: 1, 
            mb: 2,
            backgroundColor: 'success.50'
          }}>
            <Typography variant="subtitle2" gutterBottom color="success.main">
              Selected User:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                {selectedUser.displayName?.charAt(0)?.toUpperCase() || selectedUser.email.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {selectedUser.displayName || 'No name'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedUser.email}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
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
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={!selectedUser || loading}
          startIcon={<PersonAdd />}
        >
          {loading ? 'Sending...' : 'Send Invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMemberDropdownDialog;