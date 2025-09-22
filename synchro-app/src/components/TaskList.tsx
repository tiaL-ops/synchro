import React from 'react';
import {
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Typography,
  Box,
  Divider,
  ListItemButton
} from '@mui/material';
import { Assignment } from '@mui/icons-material';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  formatDate: (date: Date | undefined | null) => string;
  getTaskStatusColor: (status: Task['status']) => 'default' | 'primary' | 'warning' | 'success';
  onTaskClick?: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  formatDate,
  getTaskStatusColor,
  onTaskClick
}) => {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No tasks assigned to you yet
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Your Tasks
        </Typography>
        <List>
          {tasks.slice(0, 5).map((task, index) => (
            <React.Fragment key={task.id}>
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={() => onTaskClick?.(task)}
                  sx={{ 
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Assignment fontSize="small" />
                        <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 'medium' }}>
                          {task.title || 'Untitled Task'}
                        </Typography>
                        <Chip
                          label={task.status}
                          size="small"
                          color={getTaskStatusColor(task.status)}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                          {task.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Project: {task.projectId}
                        </Typography>
                        {task.dueDate && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Due: {formatDate(task.dueDate)}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
              {index < Math.min(tasks.length, 5) - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
        {tasks.length > 5 && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              And {tasks.length - 5} more tasks...
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskList;
