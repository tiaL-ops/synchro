import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User } from '../types';

// Find user by email
export const findUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const cleanEmail = email.toLowerCase().trim();
    console.log('Looking up user with email:', cleanEmail);
    
    const q = query(
      collection(db, 'users'),
      where('email', '==', cleanEmail)
    );
    const querySnapshot = await getDocs(q);
    
    console.log('Query result:', querySnapshot.size, 'users found');
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const data = userDoc.data();
      const user = {
        uid: userDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as User;
      console.log('Found user:', user);
      return user;
    }
    
    console.log('No user found with email:', cleanEmail);
    return null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid: userDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};
