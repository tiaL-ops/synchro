import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User } from '../types';

// Cache for user lookups to reduce latency
const userCache = new Map<string, { user: User | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Clear cache entries older than CACHE_DURATION
const cleanCache = () => {
  const now = Date.now();
  userCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_DURATION) {
      userCache.delete(key);
    }
  });
};

// Find user by email with caching
export const findUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const cleanEmail = email.toLowerCase().trim();
    
    // Clean old cache entries
    cleanCache();
    
    // Check cache first
    const cached = userCache.get(cleanEmail);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('Cache hit for email:', cleanEmail);
      return cached.user;
    }
    
    console.log('Cache miss, looking up user with email:', cleanEmail);
    
    const q = query(
      collection(db, 'users'),
      where('email', '==', cleanEmail)
    );
    const querySnapshot = await getDocs(q);
    
    console.log('Query result:', querySnapshot.size, 'users found');
    
    let user: User | null = null;
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const data = userDoc.data();
      user = {
        uid: userDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as User;
      console.log('Found user:', user);
    } else {
      console.log('No user found with email:', cleanEmail);
    }
    
    // Cache the result (both found and not found)
    userCache.set(cleanEmail, { user, timestamp: Date.now() });
    
    return user;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
};

// Get user by ID with caching
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    // Clean old cache entries
    cleanCache();
    
    // Check cache first (using userId as key)
    const cached = userCache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('Cache hit for userId:', userId);
      return cached.user;
    }
    
    console.log('Cache miss, looking up user with ID:', userId);
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    let user: User | null = null;
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      user = {
        uid: userDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as User;
      console.log('Found user by ID:', user);
    } else {
      console.log('No user found with ID:', userId);
    }
    
    // Cache the result
    userCache.set(userId, { user, timestamp: Date.now() });
    
    return user;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

// Clear the user cache (useful for logout or when user data changes)
export const clearUserCache = () => {
  userCache.clear();
  console.log('User cache cleared');
};

// Get cache statistics for debugging
export const getCacheStats = () => {
  const now = Date.now();
  let validEntries = 0;
  
  userCache.forEach((value) => {
    if ((now - value.timestamp) < CACHE_DURATION) {
      validEntries++;
    }
  });
  
  return {
    totalEntries: userCache.size,
    validEntries: validEntries,
    expiredEntries: userCache.size - validEntries
  };
};
