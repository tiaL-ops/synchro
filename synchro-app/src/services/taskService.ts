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

// Create a new task
export const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const taskRef = await addDoc(collection(db, 'tasks'), {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return taskRef.id;
  } catch (error) {
    throw error;
  }
};

// Get all tasks for a project
export const getProjectTasks = async (projectId: string): Promise<Task[]> => {
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
  } catch (error) {
    throw error;
  }
};

// Get tasks assigned to a user
export const getUserTasks = async (userId: string): Promise<Task[]> => {
  try {
    // Try the optimized query first (with index)
    try {
      const q = query(
        collection(db, 'tasks'),
        where('assignedTo', '==', userId),
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
      console.warn('Index not ready, using fallback query:', indexError);
      const q = query(
        collection(db, 'tasks'),
        where('assignedTo', '==', userId)
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
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
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
