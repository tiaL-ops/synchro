import { getUserTasks } from '../services/taskService';

// Debug function to test task visibility
export const debugTaskVisibility = async (userId: string) => {
  console.log('🔍 DEBUG: Testing task visibility for user:', userId);
  
  try {
    const tasks = await getUserTasks(userId);
    console.log('📋 Tasks found for user:', tasks.length);
    
    tasks.forEach((task, index) => {
      console.log(`📝 Task ${index + 1}:`, {
        id: task.id,
        description: task.description,
        assignedTo: task.assignedTo,
        assignedToUsers: task.assignedToUsers,
        status: task.status,
        projectId: task.projectId
      });
    });
    
    return tasks;
  } catch (error) {
    console.error('❌ Error debugging task visibility:', error);
    throw error;
  }
};

// Make it available in browser console
(window as any).debugTaskVisibility = debugTaskVisibility;
