// Utility to test if Firestore indexes are ready
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

export const testIndexes = async () => {
  console.log('🔍 Testing Firestore indexes...');
  
  const tests = [
    {
      name: 'assignedTo + createdAt',
      query: query(
        collection(db, 'tasks'),
        where('assignedTo', '==', 'test-user'),
        orderBy('createdAt', 'desc')
      )
    },
    {
      name: 'teamMembers + createdAt',
      query: query(
        collection(db, 'projects'),
        where('teamMembers.test-user', '!=', null),
        orderBy('createdAt', 'desc')
      )
    },
    {
      name: 'projectId + status',
      query: query(
        collection(db, 'tasks'),
        where('projectId', '==', 'test-project'),
        orderBy('status', 'asc')
      )
    }
  ];
  
  for (const test of tests) {
    try {
      await getDocs(test.query);
      console.log(`✅ ${test.name} index is READY`);
    } catch (error: any) {
      if (error.code === 'failed-precondition') {
        console.log(`⏳ ${test.name} index is BUILDING`);
      } else {
        console.log(`❌ ${test.name} index error:`, error.message);
      }
    }
  }
  
  console.log('🎯 Index test complete!');
};

// Make it available globally for browser console testing
(window as any).testIndexes = testIndexes;
