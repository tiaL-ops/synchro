const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin
admin.initializeApp();

// Define secrets for email configuration
const emailUser = defineSecret('EMAIL_USER');
const emailPassword = defineSecret('EMAIL_PASSWORD');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser.value() || 'landy@synchro.solutions',
    pass: emailPassword.value() || 'your-app-password'
  }
});

// Function to send invitation email
exports.sendInvitationEmail = onDocumentCreated('invitations/{invitationId}', async (event) => {
    const invitation = event.data.data();
    
    try {
      const mailOptions = {
        from: `"Synchro Team" <${emailUser.value() || 'landy@synchro.solutions'}>`,
        to: invitation.invitedToEmail,
        subject: `You've been invited to join "${invitation.projectName}" project`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1976d2;">Project Invitation</h2>
            <p>Hello!</p>
            <p><strong>${invitation.invitedByEmail}</strong> has invited you to join the project <strong>"${invitation.projectName}"</strong> as a <strong>${invitation.role}</strong>.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">What you can do:</h3>
              <ul>
                <li>View project details and tasks</li>
                <li>Collaborate with team members</li>
                ${invitation.role === 'Member' ? '<li>Create and manage tasks</li>' : ''}
                ${invitation.role === 'Member' ? '<li>Update project status</li>' : ''}
              </ul>
            </div>
            
            <p>To accept this invitation, please log in to your Synchro account and check your notifications.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://synchro-core.web.app" 
                 style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Go to Synchro
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              If you don't have a Synchro account yet, you can create one at 
              <a href="https://synchro-core.web.app/signup">synchro-core.web.app/signup</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              This email was sent by Synchro Team Management System. 
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('Invitation email sent successfully to:', invitation.invitedToEmail);
      
    } catch (error) {
      console.error('Error sending invitation email:', error);
    }
  });

// Function to send task assignment email
exports.sendTaskAssignmentEmail = onDocumentCreated('tasks/{taskId}', async (event) => {
    const task = event.data.data();
    
    // Only send email if task is assigned to someone
    if (!task.assignedTo && (!task.assignedToUsers || task.assignedToUsers.length === 0)) {
      return;
    }

    try {
      // Get project details
      const projectDoc = await admin.firestore().collection('projects').doc(task.projectId).get();
      const project = projectDoc.data();
      
      if (!project) {
        console.log('Project not found for task:', task.projectId);
        return;
      }

      // Get assignee details
      const assigneeIds = task.assignedToUsers || [task.assignedTo];
      const assigneeEmails = [];
      
      for (const assigneeId of assigneeIds) {
        if (assigneeId) {
          const userDoc = await admin.firestore().collection('users').doc(assigneeId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            if (userData.email) {
              assigneeEmails.push(userData.email);
            }
          }
        }
      }

      if (assigneeEmails.length === 0) {
        console.log('No valid assignee emails found for task:', task.id);
        return;
      }

      // Get task creator details
      const creatorDoc = await admin.firestore().collection('users').doc(task.createdBy).get();
      const creatorData = creatorDoc.exists ? creatorDoc.data() : { email: 'Unknown', displayName: 'Unknown' };

      const mailOptions = {
        from: `"Synchro Team" <${emailUser.value() || 'landy@synchro.solutions'}>`,
        to: assigneeEmails.join(', '),
        subject: `New task assigned: "${task.title}" in "${project.projectName}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1976d2;">New Task Assignment</h2>
            <p>Hello!</p>
            <p><strong>${creatorData.displayName || creatorData.email}</strong> has assigned you a new task in the project <strong>"${project.projectName}"</strong>.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1976d2;">Task Details</h3>
              <p><strong>Title:</strong> ${task.title}</p>
              <p><strong>Description:</strong> ${task.description}</p>
              <p><strong>Status:</strong> <span style="color: #666;">${task.status}</span></p>
              ${task.priority ? `<p><strong>Priority:</strong> <span style="color: ${task.priority === 'High' ? '#d32f2f' : task.priority === 'Medium' ? '#f57c00' : '#388e3c'};">${task.priority}</span></p>` : ''}
              ${task.dueDate ? `<p><strong>Due Date:</strong> ${new Date(task.dueDate.seconds * 1000).toLocaleDateString()}</p>` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://synchro-core.web.app/project/${task.projectId}" 
                 style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                View Task in Project
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              You can update the task status, add comments, or collaborate with your team members in the project.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              This email was sent by Synchro Team Management System. 
              You can manage your notification preferences in your account settings.
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('Task assignment email sent successfully to:', assigneeEmails);
      
    } catch (error) {
      console.error('Error sending task assignment email:', error);
    }
  });

// Function to send task update email
exports.sendTaskUpdateEmail = onDocumentUpdated('tasks/{taskId}', async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();
    
    // Only send email if status changed to Done
    if (before.status !== 'Done' && after.status === 'Done') {
      try {
        // Get project details
        const projectDoc = await admin.firestore().collection('projects').doc(after.projectId).get();
        const project = projectDoc.data();
        
        if (!project) {
          console.log('Project not found for task:', after.projectId);
          return;
        }

        // Get task creator details
        const creatorDoc = await admin.firestore().collection('users').doc(after.createdBy).get();
        const creatorData = creatorDoc.exists ? creatorDoc.data() : { email: 'Unknown', displayName: 'Unknown' };

        // Get project owner details
        const ownerDoc = await admin.firestore().collection('users').doc(project.createdBy).get();
        const ownerData = ownerDoc.exists ? ownerDoc.data() : { email: 'Unknown', displayName: 'Unknown' };

        const mailOptions = {
          from: `"Synchro Team" <${emailUser.value() || 'landy@synchro.solutions'}>`,
          to: ownerData.email,
          subject: `Task completed: "${after.title}" in "${project.projectName}"`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4caf50;">Task Completed! 🎉</h2>
              <p>Hello <strong>${ownerData.displayName || ownerData.email}</strong>!</p>
              <p>The task <strong>"${after.title}"</strong> in your project <strong>"${project.projectName}"</strong> has been marked as completed.</p>
              
              <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
                <h3 style="margin-top: 0; color: #2e7d32;">Task Details</h3>
                <p><strong>Title:</strong> ${after.title}</p>
                <p><strong>Description:</strong> ${after.description}</p>
                <p><strong>Completed by:</strong> ${creatorData.displayName || creatorData.email}</p>
                <p><strong>Status:</strong> <span style="color: #4caf50; font-weight: bold;">✅ Done</span></p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://synchro-core.web.app/project/${after.projectId}" 
                   style="background-color: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  View Project Progress
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                Great job on keeping the project moving forward! You can view the updated project status and remaining tasks.
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #999; font-size: 12px;">
                This email was sent by Synchro Team Management System. 
                You can manage your notification preferences in your account settings.
              </p>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log('Task completion email sent successfully to:', ownerData.email);
        
      } catch (error) {
        console.error('Error sending task completion email:', error);
      }
    }
  });
