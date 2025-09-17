import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Divider,
  Alert,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Group,
  Check,
  Close,
  ExpandMore,
  ExpandLess,
  PersonAdd
} from '@mui/icons-material';
import { getUserInvitations, acceptInvitation, declineInvitation, Invitation } from '../services/invitationService';
import { addProjectMember } from '../services/projectService';
import { useAuth } from '../contexts/AuthContext';

const InvitationNotification: React.FC = () => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadInvitations();
    }
  }, [user]);

  const loadInvitations = async () => {
    if (!user) return;
    
    console.log('🔍 Loading invitations for user:', user.uid);
    setLoading(true);
    try {
      const userInvitations = await getUserInvitations(user.uid);
      console.log('📧 Found invitations:', userInvitations);
      setInvitations(userInvitations);
    } catch (error) {
      console.error('❌ Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitation: Invitation) => {
    if (!user) return;
    
    setProcessing(invitation.id);
    try {
      // Accept the invitation
      await acceptInvitation(invitation.id);
      
      // Add user to project
      await addProjectMember(
        invitation.projectId,
        user.uid,
        user.email || '',
        invitation.role
      );
      
      // Remove from local state
      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
      
      console.log('Invitation accepted and user added to project');
    } catch (error) {
      console.error('Error accepting invitation:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (invitation: Invitation) => {
    setProcessing(invitation.id);
    try {
      await declineInvitation(invitation.id);
      
      // Remove from local state
      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
      
      console.log('Invitation declined');
    } catch (error) {
      console.error('Error declining invitation:', error);
    } finally {
      setProcessing(null);
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

  if (!user || invitations.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Card sx={{ border: '2px solid', borderColor: 'primary.main' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonAdd color="primary" />
              <Typography variant="h6" color="primary">
                Project Invitations ({invitations.length})
              </Typography>
            </Box>
            <IconButton
              onClick={() => setExpanded(!expanded)}
              size="small"
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          
          <Collapse in={expanded}>
            <Box sx={{ mt: 2 }}>
              {invitations.map((invitation, index) => (
                <Box key={invitation.id}>
                  {index > 0 && <Divider sx={{ my: 2 }} />}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Group />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {invitation.projectName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Invited by {invitation.invitedByEmail} as {invitation.role}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(invitation.createdAt)}
                      </Typography>
                    </Box>
                    <Chip
                      label={invitation.role}
                      size="small"
                      color={invitation.role === 'Member' ? 'primary' : 'default'}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<Close />}
                      onClick={() => handleDecline(invitation)}
                      disabled={processing === invitation.id}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<Check />}
                      onClick={() => handleAccept(invitation)}
                      disabled={processing === invitation.id}
                    >
                      Accept
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InvitationNotification;
