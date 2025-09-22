import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Task } from '../types';
import { emailService } from './emailService';

// Get task count for a project
export const getProjectTaskCount = async (projectId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('projectId', '==', projectId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting project task count:', error);
    return 0;
  }
};

// Create a new task with 100-task limit per project
export const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    // Check if project has reached the 100-task limit
    const projectTaskCount = await getProjectTaskCount(taskData.projectId);
    
    if (projectTaskCount >= 100) {
      throw new Error('This project has reached the maximum limit of 100 tasks. Please delete some existing tasks before creating new ones.');
    }
    
    const taskRef = await addDoc(collection(db, 'tasks'), {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Send email notification if task is assigned to someone
    if (taskData.assignedTo || (taskData.assignedToUsers && taskData.assignedToUsers.length > 0)) {
      try {
        // Get project details for email
        const projectDoc = await getDoc(doc(db, 'projects', taskData.projectId));
        const project = projectDoc.data();
        
        if (project) {
          // Get creator details
          const creatorDoc = await getDoc(doc(db, 'users', taskData.createdBy));
          const creatorData = creatorDoc.data();
          
          // Get assignee details
          const assigneeIds = taskData.assignedToUsers || [taskData.assignedTo];
          for (const assigneeId of assigneeIds) {
            if (assigneeId) {
              const assigneeDoc = await getDoc(doc(db, 'users', assigneeId));
              const assigneeData = assigneeDoc.data();
              
              if (assigneeData?.email) {
                await emailService.sendTaskAssignmentEmail({
                  assigneeEmail: assigneeData.email,
                  taskTitle: taskData.title,
                  taskDescription: taskData.description,
                  projectName: project.projectName,
                  createdByEmail: creatorData?.email || 'Unknown',
                  priority: taskData.priority,
                  dueDate: taskData.dueDate,
                  projectId: taskData.projectId
                });
              }
            }
          }
        }
      } catch (emailError) {
        console.error('Failed to send task assignment email:', emailError);
        // Don't fail the task creation if email fails
      }
    }
    
    return taskRef.id;
  } catch (error) {
    throw error;
  }
};

// Get all tasks for a project
export const getProjectTasks = async (projectId: string): Promise<Task[]> => {
  try {
    // Try the optimized query first (with index)
    try {
      const q = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const tasks: Task[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate() || undefined
        } as Task);
      });
      
      return tasks;
    } catch (indexError) {
      // Fallback: get all tasks and filter/sort in memory
      console.warn('Index not ready, using fallback query for project tasks:', indexError);
      const q = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId)
      );
      const querySnapshot = await getDocs(q);
      const tasks: Task[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate() || undefined
        } as Task);
      });
      
      return tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  } catch (error) {
    throw error;
  }
};

// Get tasks assigned to a user (including multiple assignees)
export const getUserTasks = async (userId: string): Promise<Task[]> => {
  try {
    console.log('🔍 Getting tasks for user:', userId);
    
    // Get all tasks and filter in memory since Firestore doesn't support
    // array-contains queries with orderBy on different fields efficiently
    const q = query(collection(db, 'tasks'));
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const task = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        dueDate: data.dueDate?.toDate() || undefined
      } as Task;
      
      // Check if user is assigned to this task (single or multiple assignees)
      const isAssigned = 
        task.assignedTo === userId || 
        (task.assignedToUsers && task.assignedToUsers.includes(userId));
      
      if (isAssigned) {
        tasks.push(task);
        console.log('✅ Found assigned task:', task.id, task.description);
      }
    });
    
    // Sort by creation date (newest first)
    const sortedTasks = tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    console.log('📋 Total tasks found for user:', sortedTasks.length);
    
    return sortedTasks;
  } catch (error) {
    console.error('❌ Error getting user tasks:', error);
    throw error;
  }
};

// Get a specific task
export const getTask = async (taskId: string): Promise<Task | null> => {
  try {
    const taskDoc = await getDoc(doc(db, 'tasks', taskId));
    if (taskDoc.exists()) {
      const data = taskDoc.data();
      return {
        id: taskDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        dueDate: data.dueDate?.toDate() || undefined
      } as Task;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Update a task
export const updateTask = async (taskId: string, updateData: Partial<Task>): Promise<void> => {
  try {
    // Get current task data to check for status changes
    const currentTaskDoc = await getDoc(doc(db, 'tasks', taskId));
    const currentTask = currentTaskDoc.data();
    
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    
    // Send email notification if task was completed
    if (currentTask && updateData.status === 'Done' && currentTask.status !== 'Done') {
      try {
        // Get project details
        const projectDoc = await getDoc(doc(db, 'projects', currentTask.projectId));
        const project = projectDoc.data();
        
        if (project) {
          // Get task creator details
          const creatorDoc = await getDoc(doc(db, 'users', currentTask.createdBy));
          const creatorData = creatorDoc.data();
          
          // Get project owner details
          const ownerDoc = await getDoc(doc(db, 'users', project.createdBy));
          const ownerData = ownerDoc.data();
          
          if (ownerData?.email) {
            await emailService.sendTaskCompletionEmail({
              ownerEmail: ownerData.email,
              taskTitle: currentTask.title,
              projectName: project.projectName,
              completedByEmail: creatorData?.email || 'Unknown',
              projectId: currentTask.projectId
            });
          }
        }
      } catch (emailError) {
        console.error('Failed to send task completion email:', emailError);
        // Don't fail the task update if email fails
      }
    }
  } catch (error) {
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
  } catch (error) {
    throw error;
  }
};

// Update task status (for drag and drop)
export const updateTaskStatus = async (taskId: string, status: Task['status']): Promise<void> => {
  try {
    await updateTask(taskId, { status });
  } catch (error) {
    throw error;
  }
};

// Assign task to user
export const assignTask = async (taskId: string, userId: string): Promise<void> => {
  try {
    await updateTask(taskId, { assignedTo: userId });
  } catch (error) {
    throw error;
  }
};
