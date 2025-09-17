import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  Collapse
} from '@mui/material';
import {
  PersonAdd,
  ExpandMore,
  ExpandLess,
  Email
} from '@mui/icons-material';
import { getProjectInvitations } from '../services/invitationService';
import { Invitation } from '../services/invitationService';

interface PendingInvitationsListProps {
  projectId: string;
  isOwner: boolean;
}

const PendingInvitationsList: React.FC<PendingInvitationsListProps> = ({
  projectId,
  isOwner
}) => {
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadPendingInvitations();
    }
  }, [projectId]);

  const loadPendingInvitations = async () => {
    setLoading(true);
    try {
      const invitations = await getProjectInvitations(projectId);
      setPendingInvitations(invitations);
    } catch (error) {
      console.error('Error loading pending invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOwner || pendingInvitations.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          cursor: 'pointer',
          '&:hover': { backgroundColor: 'action.hover' },
          p: 1,
          borderRadius: 1
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <PersonAdd color="warning" />
        <Typography variant="subtitle2" color="warning.main">
          Pending Invitations ({pendingInvitations.length})
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        <Box sx={{ ml: 2, mt: 1 }}>
          {pendingInvitations.map((invitation, index) => (
            <Box key={invitation.id} sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: 'warning.light' }}>
                  <Email fontSize="small" />
                </Avatar>
                <Typography variant="body2">
                  {invitation.invitedToEmail}
                </Typography>
                <Chip
                  label={invitation.role}
                  size="small"
                  color={invitation.role === 'Member' ? 'primary' : 'default'}
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
                <Typography variant="caption" color="text.secondary">
                  {formatDate(invitation.createdAt)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default PendingInvitationsList;
