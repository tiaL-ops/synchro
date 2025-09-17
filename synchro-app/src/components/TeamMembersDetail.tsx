import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  Typography,
  Box
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { getUserById } from '../services/userService';
import { User } from '../types';

interface TeamMember {
  role: 'Owner' | 'Member' | 'Viewer';
  joinedAt: Date;
}

interface TeamMembersDetailProps {
  teamMembers: { [userId: string]: TeamMember };
  createdBy: string;
  currentUserId: string;
  onRemoveMember?: (userId: string) => void;
  formatDate: (date: Date | undefined | null) => string;
}

const TeamMembersDetail: React.FC<TeamMembersDetailProps> = ({
  teamMembers,
  createdBy,
  currentUserId,
  onRemoveMember,
  formatDate
}) => {
  const [memberDetails, setMemberDetails] = useState<{ [userId: string]: User }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      const details: { [userId: string]: User } = {};
      
      const userIds = Object.keys(teamMembers);
      const promises = userIds.map(async (userId) => {
        try {
          const user = await getUserById(userId);
          if (user) {
            details[userId] = user;
          }
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
        }
      });

      await Promise.all(promises);
      setMemberDetails(details);
      setLoading(false);
    };

    fetchMemberDetails();
  }, [teamMembers]);

  if (loading) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Team Members
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Loading members...
        </Typography>
      </Box>
    );
  }

  const isOwner = currentUserId === createdBy;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Team Members
      </Typography>
      <List>
        {Object.entries(teamMembers).map(([userId, member]) => {
          const user = memberDetails[userId];
          const isProjectOwner = userId === createdBy;
          const isCurrentUser = userId === currentUserId;
          
          if (!user) {
            return (
              <ListItem key={userId}>
                <Avatar sx={{ mr: 2 }}>
                  ?
                </Avatar>
                <ListItemText
                  primary="Unknown User"
                  secondary={`${member.role} • Joined ${formatDate(member.joinedAt)}`}
                />
              </ListItem>
            );
          }

          return (
            <ListItem key={userId}>
              <Avatar sx={{ mr: 2 }}>
                {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1">
                      {user.displayName}
                    </Typography>
                    {isProjectOwner && (
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
                        (Owner)
                      </Typography>
                    )}
                    {isCurrentUser && !isProjectOwner && (
                      <Typography variant="caption" color="secondary">
                        (You)
                      </Typography>
                    )}
                  </Box>
                }
                secondary={`${member.role} • Joined ${formatDate(member.joinedAt)}`}
              />
              {isOwner && userId !== currentUserId && onRemoveMember && (
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => onRemoveMember(userId)}
                    title="Remove member"
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default TeamMembersDetail;
