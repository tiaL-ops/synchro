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

// Search users by partial email or name
export const searchUsers = async (searchTerm: string, limit: number = 10): Promise<User[]> => {
  try {
    const cleanSearchTerm = searchTerm.toLowerCase().trim();
    
    if (cleanSearchTerm.length < 2) {
      return []; // Don't search for terms shorter than 2 characters
    }
    
    console.log('Searching users with term:', cleanSearchTerm);
    
    // Search by email (partial match)
    const emailQuery = query(
      collection(db, 'users'),
      where('email', '>=', cleanSearchTerm),
      where('email', '<=', cleanSearchTerm + '\uf8ff')
    );
    
    const emailSnapshot = await getDocs(emailQuery);
    
    const users: User[] = [];
    const seenUids = new Set<string>();
    
    // Process email matches
    emailSnapshot.forEach((doc) => {
      const data = doc.data();
      const user: User = {
        uid: doc.id,
        email: data.email || '',
        displayName: data.displayName || '',
        preferences: data.preferences || {},
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
      
      if (!seenUids.has(user.uid)) {
        users.push(user);
        seenUids.add(user.uid);
      }
    });
    
    // If we have fewer results than the limit, also search by displayName
    if (users.length < limit) {
      const nameQuery = query(
        collection(db, 'users'),
        where('displayName', '>=', cleanSearchTerm),
        where('displayName', '<=', cleanSearchTerm + '\uf8ff')
      );
      
      const nameSnapshot = await getDocs(nameQuery);
      
      nameSnapshot.forEach((doc) => {
        const data = doc.data();
        const user: User = {
          uid: doc.id,
          email: data.email || '',
          displayName: data.displayName || '',
          preferences: data.preferences || {},
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
        
        if (!seenUids.has(user.uid) && users.length < limit) {
          users.push(user);
          seenUids.add(user.uid);
        }
      });
    }
    
    console.log('Search result:', users.length, 'users found');
    return users.slice(0, limit);
    
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};
