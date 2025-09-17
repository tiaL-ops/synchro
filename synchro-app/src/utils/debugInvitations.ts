import { getUserInvitations, createInvitation } from '../services/invitationService';

// Debug function to test invitation system
export const debugInvitations = async () => {
  console.log('🔍 Debug: Testing invitation system...');
  
  try {
    // Test getting invitations for current user
    const currentUserId = 'test-user-id'; // Replace with actual user ID
    console.log('Getting invitations for user:', currentUserId);
    
    const invitations = await getUserInvitations(currentUserId);
    console.log('Found invitations:', invitations);
    
    // Test creating an invitation
    console.log('Creating test invitation...');
    const invitationId = await createInvitation(
      'test-project-id',
      'Test Project',
      'inviter-user-id',
      'inviter@example.com',
      'invited-user-id',
      'invited@example.com',
      'Member'
    );
    console.log('Created invitation with ID:', invitationId);
    
  } catch (error) {
    console.error('Error testing invitations:', error);
  }
};

// Make it available in browser console
(window as any).debugInvitations = debugInvitations;
