import { getCacheStats, clearUserCache } from '../services/userService';

// Debug utility for user cache performance
export const debugUserCache = () => {
  const stats = getCacheStats();
  console.log('📊 User Cache Statistics:', {
    totalEntries: stats.totalEntries,
    validEntries: stats.validEntries,
    expiredEntries: stats.expiredEntries,
    hitRate: stats.validEntries > 0 ? `${Math.round((stats.validEntries / stats.totalEntries) * 100)}%` : '0%'
  });
  
  return stats;
};

// Clear cache manually
export const clearCache = () => {
  clearUserCache();
  console.log('🗑️ User cache cleared manually');
};

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).debugUserCache = debugUserCache;
  (window as any).clearUserCache = clearCache;
}
