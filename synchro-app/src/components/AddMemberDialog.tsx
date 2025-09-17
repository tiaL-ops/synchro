import React, { useState, useEffect, useRef } from 'react';
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
import { createInvitation } from '../services/invitationService';
import { User } from '../types';

interface AddMemberDialogProps {
  open: boolean;
  project: any;
  onClose: () => void;
  onInvitationSent?: () => void; // Optional callback for when invitation is sent
}

const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
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
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const emailLookupCache = useRef<Map<string, User | null>>(new Map());
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Email validation function - more strict to avoid premature lookups
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // Check if email is complete enough to trigger lookup
  const isEmailComplete = (email: string): boolean => {
    const trimmed = email.trim();
    if (!trimmed) return false;
    
    // Must have @ and at least one character after it
    const atIndex = trimmed.indexOf('@');
    if (atIndex === -1 || atIndex === 0) return false;
    
    // Must have at least one character after @
    const afterAt = trimmed.substring(atIndex + 1);
    if (!afterAt) return false;
    
    // Must have at least one dot after @
    const dotIndex = afterAt.indexOf('.');
    if (dotIndex === -1 || dotIndex === 0) return false;
    
    // Must have at least one character after the dot
    const afterDot = afterAt.substring(dotIndex + 1);
    if (!afterDot) return false;
    
    return true;
  };

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    setError('');
    setFoundUser(null);

    // Clear previous debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Only start lookup if email is complete enough (has @, domain, and extension)
    if (newEmail.trim() && isEmailComplete(newEmail)) {
      const cleanEmail = newEmail.trim().toLowerCase();
      
      // Check local cache first
      if (emailLookupCache.current.has(cleanEmail)) {
        const cachedUser = emailLookupCache.current.get(cleanEmail);
        setFoundUser(cachedUser || null);
        if (!cachedUser) {
          setError('User not found. Please make sure the user has an account.');
        }
        // Maintain focus after cached lookup
        setTimeout(() => {
          if (emailInputRef.current) {
            emailInputRef.current.focus();
          }
        }, 0);
        return;
      }
      
      setLoading(true);
      
      // Debounce the lookup by 300ms (reduced for better responsiveness)
      debounceRef.current = setTimeout(async () => {
        try {
          const user = await findUserByEmail(cleanEmail);
          
          // Store result in local cache
          emailLookupCache.current.set(cleanEmail, user);
          
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
          // Maintain focus after lookup completes
          setTimeout(() => {
            if (emailInputRef.current) {
              emailInputRef.current.focus();
            }
          }, 0);
        }
      }, 300);
    } else if (newEmail.trim() && newEmail.includes('@') && !isEmailComplete(newEmail)) {
      // Show helpful message for incomplete emails
      setError('Please enter a complete email address (e.g., user@example.com)');
    } else {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (foundUser && project) {
      try {
        // Create invitation instead of directly adding member
        await createInvitation(
          project.id,
          project.projectName,
          project.createdBy, // Current user (inviter)
          project.createdByEmail || 'Unknown', // Current user email
          foundUser.uid,
          foundUser.email,
          role
        );
        
        // Call optional callback for UI updates
        if (onInvitationSent) {
          onInvitationSent();
        }
        
        setEmail('');
        setRole('Member');
        setFoundUser(null);
        setError('');
        // Clear local cache after successful invitation
        emailLookupCache.current.clear();
      } catch (error) {
        console.error('Error creating invitation:', error);
        setError('Failed to send invitation. Please try again.');
      }
    }
  };

  const handleClose = () => {
    onClose();
    setEmail('');
    setRole('Member');
    setFoundUser(null);
    setError('');
    // Clear local email lookup cache when dialog closes
    emailLookupCache.current.clear();
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Ensure focus when dialog opens
  useEffect(() => {
    if (open && emailInputRef.current) {
      // Small delay to ensure dialog is fully rendered
      setTimeout(() => {
        if (emailInputRef.current) {
          emailInputRef.current.focus();
        }
      }, 100);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Team Member</DialogTitle>
      <DialogContent>
        <TextField
          inputRef={emailInputRef}
          autoFocus
          margin="dense"
          label="Email Address"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          sx={{ mb: 2 }}
          disabled={loading}
          placeholder="Enter complete email address (e.g., user@example.com)"
          helperText={email && !isEmailComplete(email) && email.includes('@') ? "Please enter a complete email address" : ""}
          error={Boolean(email && !isEmailComplete(email) && email.includes('@'))}
          onBlur={(e) => {
            // Maintain focus if user clicks outside but email is incomplete or if we're still loading
            if ((email && !isEmailComplete(email) && email.includes('@') ) || loading) {
              setTimeout(() => {
                if (emailInputRef.current) {
                  emailInputRef.current.focus();
                }
              }, 0);
            }
          }}
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
          Send Invitation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMemberDialog;
