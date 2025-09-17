import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton
} from '@mui/material';
import {
  CalendarToday,
  Schedule,
  Edit,
  PersonAdd,
  Task as TaskIcon
} from '@mui/icons-material';
import { Project } from '../types';
import TeamMembersList from './TeamMembersList';

interface ProjectCardProps {
  project: Project;
  currentUserId: string;
  onViewDetails: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onAddMember: (project: Project) => void;
  onAddTask: (project: Project) => void;
  formatDate: (date: Date | undefined | null) => string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  currentUserId,
  onViewDetails,
  onEditProject,
  onAddMember,
  onAddTask,
  formatDate
}) => {
  const isOwner = project.createdBy === currentUserId;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {project.projectName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {project.goal}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <TeamMembersList
            teamMembers={project.teamMembers}
            createdBy={project.createdBy}
            currentUserId={currentUserId}
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<CalendarToday />}
            label={formatDate(project.createdAt)}
            size="small"
            variant="outlined"
          />
          {project.deadline && (
            <Chip
              icon={<Schedule />}
              label={`Due ${formatDate(project.deadline)}`}
              size="small"
              variant="outlined"
              color="warning"
            />
          )}
        </Box>

        <Chip
          label={project.visibility}
          size="small"
          color={project.visibility === 'public' ? 'success' : 'default'}
        />
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Button
          size="small"
          onClick={() => onViewDetails(project)}
        >
          View Details
        </Button>
        
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {isOwner && (
            <>
              <IconButton
                size="small"
                onClick={() => onEditProject(project)}
                title="Edit Project"
              >
                <Edit />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onAddMember(project)}
                title="Add Member"
              >
                <PersonAdd />
              </IconButton>
            </>
          )}
          <IconButton
            size="small"
            onClick={() => onAddTask(project)}
            title="Add Task"
          >
            <TaskIcon />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
};

export default ProjectCard;
