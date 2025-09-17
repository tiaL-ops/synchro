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
import { db } from './config';

// Create a new project
export const createProject = async (projectData) => {
  try {
    const projectRef = await addDoc(collection(db, 'projects'), {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return projectRef.id;
  } catch (error) {
    throw error;
  }
};

// Get all projects for a user
export const getUserProjects = async (userId) => {
  try {
    const q = query(
      collection(db, 'projects'),
      where('members', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    return projects;
  } catch (error) {
    throw error;
  }
};

// Get a specific project
export const getProject = async (projectId) => {
  try {
    const projectDoc = await getDoc(doc(db, 'projects', projectId));
    if (projectDoc.exists()) {
      return { id: projectDoc.id, ...projectDoc.data() };
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Update a project
export const updateProject = async (projectId, updateData) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    throw error;
  }
};

// Delete a project
export const deleteProject = async (projectId) => {
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (error) {
    throw error;
  }
};

// Add member to project
export const addProjectMember = async (projectId, userId, userEmail) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (projectDoc.exists()) {
      const projectData = projectDoc.data();
      const members = projectData.members || [];
      const memberEmails = projectData.memberEmails || [];
      
      if (!members.includes(userId)) {
        members.push(userId);
        memberEmails.push(userEmail);
        
        await updateDoc(projectRef, {
          members,
          memberEmails,
          updatedAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    throw error;
  }
};

// Remove member from project
export const removeProjectMember = async (projectId, userId) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (projectDoc.exists()) {
      const projectData = projectDoc.data();
      const members = projectData.members || [];
      const memberEmails = projectData.memberEmails || [];
      
      const userIndex = members.indexOf(userId);
      if (userIndex > -1) {
        members.splice(userIndex, 1);
        memberEmails.splice(userIndex, 1);
        
        await updateDoc(projectRef, {
          members,
          memberEmails,
          updatedAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    throw error;
  }
};

