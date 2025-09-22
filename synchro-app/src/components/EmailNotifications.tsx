import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Collapse,
  Divider,
  Alert
} from '@mui/material';
import {
  Email,
  ExpandMore,
  ExpandLess,
  Clear,
  Visibility
} from '@mui/icons-material';
import { emailService, EmailNotification } from '../services/emailService';

const EmailNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Load notifications on component mount
    setNotifications(emailService.getNotifications());
    
    // Set up interval to check for new notifications
    const interval = setInterval(() => {
      setNotifications(emailService.getNotifications());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClearAll = () => {
    emailService.clearNotifications();
    setNotifications([]);
  };

  const getTypeColor = (type: EmailNotification['type']) => {
    switch (type) {
      case 'invitation': return 'primary';
      case 'task_assignment': return 'warning';
      case 'task_completion': return 'success';
      default: return 'default';
    }
  };

  const getTypeLabel = (type: EmailNotification['type']) => {
    switch (type) {
      case 'invitation': return 'Invitation';
      case 'task_assignment': return 'Task Assignment';
      case 'task_completion': return 'Task Completion';
      default: return 'Notification';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email color="primary" />
            <Typography variant="h6">
              Email Notifications ({notifications.length})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={handleClearAll}
              title="Clear all notifications"
            >
              <Clear />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            📧 <strong>Development Mode:</strong> These are mock email notifications. 
            In production, these would be sent via Firebase Functions to actual email addresses.
          </Typography>
        </Alert>

        <Collapse in={expanded}>
          <Box>
            {notifications.map((notification, index) => (
              <React.Fragment key={index}>
                <Box sx={{ 
                  p: 2, 
                  border: '1px solid', 
                  borderColor: 'divider', 
                  borderRadius: 1, 
                  mb: 1,
                  backgroundColor: 'background.paper'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={getTypeLabel(notification.type)}
                        size="small"
                        color={getTypeColor(notification.type)}
                      />
                      <Typography variant="body2" color="text.secondary">
                        To: {notification.to}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      title="View email content"
                      onClick={() => {
                        const newWindow = window.open('', '_blank');
                        if (newWindow) {
                          newWindow.document.write(notification.html);
                          newWindow.document.title = notification.subject;
                        }
                      }}
                    >
                      <Visibility />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {notification.subject}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    {notification.html.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </Typography>
                </Box>
                {index < notifications.length - 1 && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            ))}
          </Box>
        </Collapse>

        {!expanded && notifications.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Click expand to view {notifications.length} email notification{notifications.length !== 1 ? 's' : ''}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailNotifications;
