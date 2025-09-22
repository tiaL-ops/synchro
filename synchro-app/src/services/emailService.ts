// Email service for notifications
// This is a placeholder service that logs email notifications
// In production, this would integrate with Firebase Functions or a third-party email service

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  type: 'invitation' | 'task_assignment' | 'task_completion';
}

export interface InvitationEmailData {
  invitedToEmail: string;
  invitedByEmail: string;
  projectName: string;
  role: 'Member' | 'Viewer';
}

export interface TaskAssignmentEmailData {
  assigneeEmail: string;
  taskTitle: string;
  taskDescription: string;
  projectName: string;
  createdByEmail: string;
  priority?: 'High' | 'Medium' | 'Low';
  dueDate?: Date;
  projectId: string;
}

export interface TaskCompletionEmailData {
  ownerEmail: string;
  taskTitle: string;
  projectName: string;
  completedByEmail: string;
  projectId: string;
}

// Mock email service for development
class EmailService {
  private notifications: EmailNotification[] = [];

  // Send invitation email
  async sendInvitationEmail(data: InvitationEmailData): Promise<void> {
    const email: EmailNotification = {
      to: data.invitedToEmail,
      subject: `You've been invited to join "${data.projectName}" project`,
      type: 'invitation',
      html: this.generateInvitationEmailHTML(data)
    };

    this.notifications.push(email);
    console.log('📧 [MOCK] Invitation email would be sent from landy@synchro.solutions:', email);
    
    // In production, this would call Firebase Functions or email API
    // await this.sendEmail(email);
  }

  // Send task assignment email
  async sendTaskAssignmentEmail(data: TaskAssignmentEmailData): Promise<void> {
    const email: EmailNotification = {
      to: data.assigneeEmail,
      subject: `New task assigned: "${data.taskTitle}" in "${data.projectName}"`,
      type: 'task_assignment',
      html: this.generateTaskAssignmentEmailHTML(data)
    };

    this.notifications.push(email);
    console.log('📧 [MOCK] Task assignment email would be sent from landy@synchro.solutions:', email);
    
    // In production, this would call Firebase Functions or email API
    // await this.sendEmail(email);
  }

  // Send task completion email
  async sendTaskCompletionEmail(data: TaskCompletionEmailData): Promise<void> {
    const email: EmailNotification = {
      to: data.ownerEmail,
      subject: `Task completed: "${data.taskTitle}" in "${data.projectName}"`,
      type: 'task_completion',
      html: this.generateTaskCompletionEmailHTML(data)
    };

    this.notifications.push(email);
    console.log('📧 [MOCK] Task completion email would be sent from landy@synchro.solutions:', email);
    
    // In production, this would call Firebase Functions or email API
    // await this.sendEmail(email);
  }

  // Get all notifications (for debugging)
  getNotifications(): EmailNotification[] {
    return [...this.notifications];
  }

  // Clear notifications (for testing)
  clearNotifications(): void {
    this.notifications = [];
  }

  // Generate invitation email HTML
  private generateInvitationEmailHTML(data: InvitationEmailData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Project Invitation</h2>
        <p>Hello!</p>
        <p><strong>${data.invitedByEmail}</strong> has invited you to join the project <strong>"${data.projectName}"</strong> as a <strong>${data.role}</strong>.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">What you can do:</h3>
          <ul>
            <li>View project details and tasks</li>
            <li>Collaborate with team members</li>
            ${data.role === 'Member' ? '<li>Create and manage tasks</li>' : ''}
            ${data.role === 'Member' ? '<li>Update project status</li>' : ''}
          </ul>
        </div>
        
        <p>To accept this invitation, please log in to your Synchro account and check your notifications.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000" 
             style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Go to Synchro
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          If you don't have a Synchro account yet, you can create one at 
          <a href="http://localhost:3000/signup">localhost:3000/signup</a>
        </p>
      </div>
    `;
  }

  // Generate task assignment email HTML
  private generateTaskAssignmentEmailHTML(data: TaskAssignmentEmailData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">New Task Assignment</h2>
        <p>Hello!</p>
        <p><strong>${data.createdByEmail}</strong> has assigned you a new task in the project <strong>"${data.projectName}"</strong>.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1976d2;">Task Details</h3>
          <p><strong>Title:</strong> ${data.taskTitle}</p>
          <p><strong>Description:</strong> ${data.taskDescription}</p>
          ${data.priority ? `<p><strong>Priority:</strong> <span style="color: ${data.priority === 'High' ? '#d32f2f' : data.priority === 'Medium' ? '#f57c00' : '#388e3c'};">${data.priority}</span></p>` : ''}
          ${data.dueDate ? `<p><strong>Due Date:</strong> ${data.dueDate.toLocaleDateString()}</p>` : ''}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000/project/${data.projectId}" 
             style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View Task in Project
          </a>
        </div>
      </div>
    `;
  }

  // Generate task completion email HTML
  private generateTaskCompletionEmailHTML(data: TaskCompletionEmailData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4caf50;">Task Completed! 🎉</h2>
        <p>Hello <strong>${data.ownerEmail}</strong>!</p>
        <p>The task <strong>"${data.taskTitle}"</strong> in your project <strong>"${data.projectName}"</strong> has been marked as completed.</p>
        
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
          <h3 style="margin-top: 0; color: #2e7d32;">Task Details</h3>
          <p><strong>Title:</strong> ${data.taskTitle}</p>
          <p><strong>Completed by:</strong> ${data.completedByEmail}</p>
          <p><strong>Status:</strong> <span style="color: #4caf50; font-weight: bold;">✅ Done</span></p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000/project/${data.projectId}" 
             style="background-color: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View Project Progress
          </a>
        </div>
      </div>
    `;
  }

  // In production, this would actually send the email
  private async sendEmail(email: EmailNotification): Promise<void> {
    // This would integrate with:
    // - Firebase Functions (sendInvitationEmail, sendTaskAssignmentEmail, etc.)
    // - Third-party services like SendGrid, Mailgun, etc.
    // - Or direct SMTP configuration
    
    console.log('📧 Sending email:', email);
    // Implementation would go here
  }
}

// Export singleton instance
export const emailService = new EmailService();
