import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Tooltip,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  Flag,
  Schedule,
  CheckCircle,
  RadioButtonUnchecked,
  PlayArrow,
  Pause
} from '@mui/icons-material';
import { Task } from '../types';

interface TaskRoadmapProps {
  tasks: Task[];
  projectDeadline?: Date;
}

interface TimelineTask extends Task {
  suggestedStartDate?: Date;
  suggestedDueDate?: Date;
  dayFromStart: number;
  duration: number;
  isOverdue?: boolean;
  isUpcoming?: boolean;
  isCurrent?: boolean;
}

const TaskRoadmap: React.FC<TaskRoadmapProps> = ({ tasks, projectDeadline }) => {
  const theme = useTheme();
  const now = new Date();
  
  // Calculate project timeline
  const projectStart = new Date(Math.min(...tasks.map(t => t.createdAt.getTime())));
  const projectEnd = projectDeadline || new Date(Math.max(...tasks.map(t => t.dueDate?.getTime() || now.getTime())));
  const totalProjectDays = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (24 * 60 * 60 * 1000));
  
  // Process tasks for timeline visualization
  const timelineTasks: TimelineTask[] = tasks.map(task => {
    const startDate = task.dueDate ? new Date(task.dueDate.getTime() - 7 * 24 * 60 * 60 * 1000) : projectStart;
    const endDate = task.dueDate || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const dayFromStart = Math.ceil((startDate.getTime() - projectStart.getTime()) / (24 * 60 * 60 * 1000));
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    
    const isOverdue = task.status !== 'Done' && task.dueDate && task.dueDate < now;
    const isUpcoming = task.status === 'To Do' && task.dueDate && task.dueDate > now && task.dueDate < new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const isCurrent = task.status === 'In Progress';
    
    return {
      ...task,
      suggestedStartDate: startDate,
      suggestedDueDate: endDate,
      dayFromStart: Math.max(0, dayFromStart),
      duration: Math.max(1, duration),
      isOverdue,
      isUpcoming,
      isCurrent
    };
  });
  
  // Sort tasks by priority and start date
  const sortedTasks = timelineTasks.sort((a, b) => {
    const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
    const aPriority = a.priority || 'Low'; // Default to Low if undefined
    const bPriority = b.priority || 'Low'; // Default to Low if undefined
    const priorityDiff = priorityOrder[aPriority as keyof typeof priorityOrder] - priorityOrder[bPriority as keyof typeof priorityOrder];
    if (priorityDiff !== 0) return priorityDiff;
    return a.dayFromStart - b.dayFromStart;
  });
  
  // Calculate project progress
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case 'High': return theme.palette.error.main;
      case 'Medium': return theme.palette.warning.main;
      case 'Low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };
  
  const getStatusIcon = (task: TimelineTask) => {
    if (task.status === 'Done') return <CheckCircle sx={{ color: theme.palette.success.main }} />;
    if (task.isCurrent) return <PlayArrow sx={{ color: theme.palette.primary.main }} />;
    if (task.isOverdue) return <Flag sx={{ color: theme.palette.error.main }} />;
    if (task.isUpcoming) return <Schedule sx={{ color: theme.palette.warning.main }} />;
    return <RadioButtonUnchecked sx={{ color: theme.palette.grey[400] }} />;
  };
  
  const getTaskStatusColor = (task: TimelineTask) => {
    if (task.status === 'Done') return theme.palette.success.light;
    if (task.isCurrent) return theme.palette.primary.light;
    if (task.isOverdue) return theme.palette.error.light;
    if (task.isUpcoming) return theme.palette.warning.light;
    return theme.palette.grey[100];
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {/* Project Overview */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Project Roadmap & Timeline
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="body2">
              Progress: {completedTasks}/{totalTasks} tasks completed
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={progressPercentage} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'white'
                  }
                }}
              />
            </Box>
            <Typography variant="body2">
              {Math.round(progressPercentage)}%
            </Typography>
          </Box>
          
          {projectDeadline && (
            <Typography variant="body2">
              📅 Project Deadline: {projectDeadline.toLocaleDateString()}
              {projectDeadline < now && (
                <Chip 
                  label="OVERDUE" 
                  size="small" 
                  sx={{ ml: 1, backgroundColor: theme.palette.error.main, color: 'white' }}
                />
              )}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Priority Legend */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Flag sx={{ color: theme.palette.error.main, fontSize: 20 }} />
          <Typography variant="caption">High Priority</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Schedule sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
          <Typography variant="caption">Medium Priority</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RadioButtonUnchecked sx={{ color: theme.palette.success.main, fontSize: 20 }} />
          <Typography variant="caption">Low Priority</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 20 }} />
          <Typography variant="caption">Completed</Typography>
        </Box>
      </Box>

      {/* Timeline Visualization */}
      <Box sx={{ position: 'relative' }}>
        {/* Timeline Line */}
        <Box
          sx={{
            position: 'absolute',
            left: 40,
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: theme.palette.grey[300],
            zIndex: 0
          }}
        />
        
        {/* Tasks */}
        {sortedTasks.map((task, index) => (
          <Box key={task.id} sx={{ position: 'relative', mb: 3 }}>
            {/* Timeline Dot */}
            <Box
              sx={{
                position: 'absolute',
                left: 32,
                top: 20,
                width: 18,
                height: 18,
                borderRadius: '50%',
                backgroundColor: getPriorityColor(task.priority),
                border: `3px solid ${theme.palette.background.paper}`,
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'white' }} />
            </Box>
            
            {/* Task Card */}
            <Card 
              sx={{ 
                ml: 8, 
                backgroundColor: getTaskStatusColor(task),
                border: task.isCurrent ? `2px solid ${theme.palette.primary.main}` : 
                        task.isOverdue ? `2px solid ${theme.palette.error.main}` :
                        task.isUpcoming ? `2px solid ${theme.palette.warning.main}` : 'none',
                boxShadow: task.isCurrent || task.isOverdue || task.isUpcoming ? 3 : 1
              }}
            >
              <CardContent sx={{ pb: '16px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  {/* Status Icon */}
                  <Box sx={{ mt: 0.5 }}>
                    {getStatusIcon(task)}
                  </Box>
                  
                  {/* Task Content */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {task.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {task.description}
                    </Typography>
                    
                    {/* Task Meta Info */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                      <Chip 
                        label={task.priority} 
                        size="small" 
                        sx={{ 
                          backgroundColor: getPriorityColor(task.priority),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                      
                      <Chip 
                        label={task.status} 
                        size="small" 
                        variant="outlined"
                      />
                      
                      {task.category && (
                        <Chip 
                          label={task.category} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                      
                      {task.dueDate && (
                        <Tooltip title="Due Date">
                          <Chip 
                            icon={<Schedule />}
                            label={task.dueDate.toLocaleDateString()}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              color: task.isOverdue ? theme.palette.error.main : 'inherit',
                              borderColor: task.isOverdue ? theme.palette.error.main : 'inherit'
                            }}
                          />
                        </Tooltip>
                      )}
                      
                      {task.assignedToUsers && task.assignedToUsers.length > 0 && (
                        <Box sx={{ display: 'flex', ml: 1 }}>
                          {task.assignedToUsers.slice(0, 3).map((userId, idx) => (
                            <Avatar
                              key={userId}
                              sx={{ 
                                width: 24, 
                                height: 24, 
                                fontSize: '0.75rem',
                                ml: idx > 0 ? -0.5 : 0,
                                border: '2px solid white'
                              }}
                            >
                              {userId.charAt(0).toUpperCase()}
                            </Avatar>
                          ))}
                          {task.assignedToUsers.length > 3 && (
                            <Avatar
                              sx={{ 
                                width: 24, 
                                height: 24, 
                                fontSize: '0.6rem',
                                ml: -0.5,
                                backgroundColor: theme.palette.grey[400],
                                border: '2px solid white'
                              }}
                            >
                              +{task.assignedToUsers.length - 3}
                            </Avatar>
                          )}
                        </Box>
                      )}
                    </Box>
                    
                    {/* Status Messages */}
                    {task.isOverdue && (
                      <Typography variant="caption" sx={{ color: theme.palette.error.main, fontWeight: 'bold', mt: 1, display: 'block' }}>
                        ⚠️ OVERDUE - Needs immediate attention!
                      </Typography>
                    )}
                    
                    {task.isUpcoming && (
                      <Typography variant="caption" sx={{ color: theme.palette.warning.main, fontWeight: 'bold', mt: 1, display: 'block' }}>
                        ⏰ DUE SOON - Start working on this task
                      </Typography>
                    )}
                    
                    {task.isCurrent && (
                      <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', mt: 1, display: 'block' }}>
                        🚀 IN PROGRESS - Keep up the great work!
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
      
      {/* Summary Stats */}
      <Card sx={{ mt: 3, backgroundColor: theme.palette.grey[50] }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📈 Project Statistics
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h4" color="error.main">
                {tasks.filter(t => t.priority === 'High').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                High Priority Tasks
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="warning.main">
                {tasks.filter(t => t.status === 'In Progress').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Active Tasks
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="error.main">
                {tasks.filter(t => t.dueDate && t.dueDate < now && t.status !== 'Done').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Overdue Tasks
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="success.main">
                {completedTasks}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Completed Tasks
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TaskRoadmap;
