# Email Notifications Setup

This document explains how to set up email notifications for the Synchro application.

## Current Implementation

### Development Mode (Mock Emails)
- **Location**: `synchro-app/src/services/emailService.ts`
- **Functionality**: Logs email notifications to console and displays them in the UI
- **Testing**: Use the EmailNotifications component on the Dashboard to view mock emails

### Production Mode (Firebase Functions)
- **Location**: `functions/index.js`
- **Functionality**: Sends actual emails using Nodemailer and Gmail SMTP
- **Triggers**: 
  - `sendInvitationEmail`: When a new invitation is created
  - `sendTaskAssignmentEmail`: When a new task is assigned
  - `sendTaskUpdateEmail`: When a task is marked as completed

## Setup Instructions

### 1. Configure Email Credentials

For production deployment, you need to set up email credentials:

```bash
# Set Gmail credentials (use App Password, not regular password)
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your-app-password"
```

### 2. Gmail App Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account settings > Security > App passwords
3. Generate an app password for "Mail"
4. Use this app password (not your regular Gmail password)

### 3. Deploy Functions

```bash
# Deploy Firebase Functions
firebase deploy --only functions
```

### 4. Test Email Notifications

1. **Invitation Emails**: Add a member to a project
2. **Task Assignment Emails**: Create a task and assign it to someone
3. **Task Completion Emails**: Mark a task as "Done"

## Email Templates

The system sends three types of emails:

### 1. Project Invitation
- **Trigger**: When someone is invited to a project
- **Recipients**: Invited user
- **Content**: Project details, role, and invitation acceptance instructions

### 2. Task Assignment
- **Trigger**: When a task is assigned to someone
- **Recipients**: Task assignee(s)
- **Content**: Task details, priority, due date, and project link

### 3. Task Completion
- **Trigger**: When a task is marked as "Done"
- **Recipients**: Project owner
- **Content**: Completion notification and project progress link

## Development Testing

In development mode, you can:

1. View mock emails in the EmailNotifications component on the Dashboard
2. Click the "View" button to see the full email HTML in a new window
3. Clear all notifications for testing
4. Check browser console for email logs

## Customization

### Email Templates
Edit the HTML templates in:
- `functions/index.js` (production)
- `synchro-app/src/services/emailService.ts` (development)

### Email Service Provider
To use a different email service (SendGrid, Mailgun, etc.):

1. Install the appropriate npm package
2. Update the transporter configuration in `functions/index.js`
3. Modify the email sending logic as needed

### Notification Preferences
Future enhancement: Add user preferences to control which email notifications they receive.

## Troubleshooting

### Common Issues

1. **"Invalid login" error**: Use App Password instead of regular Gmail password
2. **Functions not triggering**: Check Firebase Functions logs
3. **Emails not sending**: Verify SMTP configuration and credentials
4. **Development emails not showing**: Check browser console for logs

### Debugging

```bash
# View Firebase Functions logs
firebase functions:log

# Test functions locally
firebase emulators:start --only functions
```

## Security Notes

- Never commit email credentials to version control
- Use Firebase Functions config for sensitive data
- Consider rate limiting for email sending
- Implement proper error handling for failed email sends
