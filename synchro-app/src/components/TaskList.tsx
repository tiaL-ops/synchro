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
  Divider
} from '@mui/material';
import { Assignment } from '@mui/icons-material';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  formatDate: (date: Date | undefined | null) => string;
  getTaskStatusColor: (status: Task['status']) => 'default' | 'primary' | 'warning' | 'success';
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  formatDate,
  getTaskStatusColor
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
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Assignment fontSize="small" />
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {task.description}
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
