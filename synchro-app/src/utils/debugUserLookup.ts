import { findUserByEmail } from '../services/userService';

// Debug function to test user lookup
export const debugUserLookup = async (email: string) => {
  console.log('🔍 Debug: Testing user lookup for:', email);
  
  try {
    const user = await findUserByEmail(email);
    if (user) {
      console.log('✅ Debug: User found:', user);
      return user;
    } else {
      console.log('❌ Debug: No user found');
      return null;
    }
  } catch (error) {
    console.error('💥 Debug: Error during lookup:', error);
    throw error;
  }
};

// Expose to window for easy console testing
(window as any).debugUserLookup = debugUserLookup;
