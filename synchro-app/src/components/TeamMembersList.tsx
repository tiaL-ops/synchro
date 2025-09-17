import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Typography,
  Avatar,
  Tooltip
} from '@mui/material';
import { Group } from '@mui/icons-material';
import { getUserById } from '../services/userService';
import { User } from '../types';

interface TeamMember {
  role: 'Owner' | 'Member' | 'Viewer';
  joinedAt: Date;
}

interface TeamMembersListProps {
  teamMembers: { [userId: string]: TeamMember };
  createdBy: string;
  currentUserId: string;
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({
  teamMembers,
  createdBy,
  currentUserId
}) => {
  const [memberDetails, setMemberDetails] = useState<{ [userId: string]: User }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      const details: { [userId: string]: User } = {};
      
      // Get details for all team members
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Group fontSize="small" />
        <Typography variant="body2" color="text.secondary">
          Loading members...
        </Typography>
      </Box>
    );
  }

  const memberCount = Object.keys(teamMembers).length;
  const displayMembers = Object.entries(teamMembers).slice(0, 3); // Show first 3 members
  const remainingCount = memberCount - displayMembers.length;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Group fontSize="small" />
      <Typography variant="body2" color="text.secondary">
        {memberCount} member{memberCount !== 1 ? 's' : ''}
      </Typography>
      
      {displayMembers.map(([userId, member]) => {
        const user = memberDetails[userId];
        const isOwner = userId === createdBy;
        const isCurrentUser = userId === currentUserId;
        
        if (!user) {
          return (
            <Chip
              key={userId}
              label="Unknown User"
              size="small"
              variant="outlined"
              color="default"
            />
          );
        }

        return (
          <Tooltip
            key={userId}
            title={`${user.displayName} (${member.role})${isOwner ? ' - Owner' : ''}`}
            arrow
          >
            <Chip
              label={user.displayName}
              size="small"
              variant="outlined"
              color={isOwner ? 'primary' : isCurrentUser ? 'secondary' : 'default'}
              avatar={
                <Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>
                  {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
              }
            />
          </Tooltip>
        );
      })}
      
      {remainingCount > 0 && (
        <Chip
          label={`+${remainingCount} more`}
          size="small"
          variant="outlined"
          color="default"
        />
      )}
    </Box>
  );
};

export default TeamMembersList;
