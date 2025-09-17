import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

// Debug function to list all users in Firestore
export const debugListAllUsers = async () => {
  console.log('🔍 Debug: Listing all users in Firestore...');
  
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`📊 Debug: Found ${usersSnapshot.size} users total`);
    
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`👤 User ID: ${doc.id}`);
      console.log(`   Email: ${data.email}`);
      console.log(`   Display Name: ${data.displayName}`);
      console.log(`   Created: ${data.createdAt?.toDate?.() || 'N/A'}`);
      console.log('---');
    });
    
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('💥 Debug: Error listing users:', error);
    throw error;
  }
};

// Expose to window for easy console testing
(window as any).debugListAllUsers = debugListAllUsers;
