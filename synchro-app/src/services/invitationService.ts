import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';

export interface Invitation {
  id: string;
  projectId: string;
  projectName: string;
  invitedBy: string;
  invitedByEmail: string;
  invitedTo: string;
  invitedToEmail: string;
  role: 'Member' | 'Viewer';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  updatedAt: Date;
}

// Create an invitation
export const createInvitation = async (
  projectId: string,
  projectName: string,
  invitedBy: string,
  invitedByEmail: string,
  invitedTo: string,
  invitedToEmail: string,
  role: 'Member' | 'Viewer'
): Promise<string> => {
  try {
    console.log('📧 Creating invitation:', {
      projectId,
      projectName,
      invitedBy,
      invitedByEmail,
      invitedTo,
      invitedToEmail,
      role
    });
    
    const invitationData = {
      projectId,
      projectName,
      invitedBy,
      invitedByEmail,
      invitedTo,
      invitedToEmail,
      role,
      status: 'pending' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'invitations'), invitationData);
    console.log('✅ Invitation created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating invitation:', error);
    throw error;
  }
};

// Get pending invitations for a user
export const getUserInvitations = async (userId: string): Promise<Invitation[]> => {
  try {
    console.log('🔍 Getting invitations for user:', userId);
    
    const q = query(
      collection(db, 'invitations'),
      where('invitedTo', '==', userId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    
    console.log('📋 Executing query for invitations...');
    const querySnapshot = await getDocs(q);
    console.log('📊 Query result:', querySnapshot.size, 'documents found');
    
    const invitations: Invitation[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📄 Processing invitation doc:', doc.id, data);
      invitations.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Invitation);
    });
    
    console.log('✅ Found invitations:', invitations.length, invitations);
    return invitations;
  } catch (error) {
    console.error('❌ Error getting user invitations:', error);
    throw error;
  }
};

// Accept an invitation
export const acceptInvitation = async (invitationId: string): Promise<void> => {
  try {
    const invitationRef = doc(db, 'invitations', invitationId);
    await updateDoc(invitationRef, {
      status: 'accepted',
      updatedAt: serverTimestamp()
    });
    console.log('Invitation accepted:', invitationId);
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw error;
  }
};

// Decline an invitation
export const declineInvitation = async (invitationId: string): Promise<void> => {
  try {
    const invitationRef = doc(db, 'invitations', invitationId);
    await updateDoc(invitationRef, {
      status: 'declined',
      updatedAt: serverTimestamp()
    });
    console.log('Invitation declined:', invitationId);
  } catch (error) {
    console.error('Error declining invitation:', error);
    throw error;
  }
};

// Delete an invitation (for cleanup)
export const deleteInvitation = async (invitationId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'invitations', invitationId));
    console.log('Invitation deleted:', invitationId);
  } catch (error) {
    console.error('Error deleting invitation:', error);
    throw error;
  }
};
