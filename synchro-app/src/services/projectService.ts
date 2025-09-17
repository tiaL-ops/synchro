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
import { Project, User } from '../types';

// Helper function to convert teamMembers timestamps
const convertTeamMembersTimestamps = (teamMembers: any) => {
  const convertedTeamMembers: { [userId: string]: { role: string; joinedAt: Date } } = {};
  
  for (const [userId, member] of Object.entries(teamMembers || {})) {
    const memberData = member as any;
    convertedTeamMembers[userId] = {
      role: memberData.role,
      joinedAt: memberData.joinedAt?.toDate() || new Date()
    };
  }
  
  return convertedTeamMembers;
};

// Create a new project
export const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
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
export const getUserProjects = async (userId: string): Promise<Project[]> => {
  try {
    // Try the optimized query first (with index)
    try {
      const q = query(
        collection(db, 'projects'),
        where(`teamMembers.${userId}`, '!=', null),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const projects: Project[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Convert teamMembers joinedAt timestamps to Date objects
        const convertedTeamMembers = convertTeamMembersTimestamps(data.teamMembers);
        
        projects.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          deadline: data.deadline?.toDate() || undefined,
          teamMembers: convertedTeamMembers
        } as Project);
      });
      
      return projects;
    } catch (indexError) {
      // Fallback: get all projects and filter/sort in memory
      console.warn('Index not ready, using fallback query:', indexError);
      const q = query(collection(db, 'projects'));
      const querySnapshot = await getDocs(q);
      const projects: Project[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Convert teamMembers joinedAt timestamps to Date objects
        const convertedTeamMembers = convertTeamMembersTimestamps(data.teamMembers);
        
        const project = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          deadline: data.deadline?.toDate() || undefined,
          teamMembers: convertedTeamMembers
        } as Project;
        
        // Check if user is a member of this project
        if (project.teamMembers && project.teamMembers[userId]) {
          projects.push(project);
        }
      });
      
      return projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  } catch (error) {
    throw error;
  }
};

// Get a specific project
export const getProject = async (projectId: string): Promise<Project | null> => {
  try {
    const projectDoc = await getDoc(doc(db, 'projects', projectId));
    if (projectDoc.exists()) {
      const data = projectDoc.data();
      
      // Convert teamMembers joinedAt timestamps to Date objects
      const convertedTeamMembers = convertTeamMembersTimestamps(data.teamMembers);
      
      return {
        id: projectDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        deadline: data.deadline?.toDate() || undefined,
        teamMembers: convertedTeamMembers
      } as Project;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Update a project
export const updateProject = async (projectId: string, updateData: Partial<Project>): Promise<void> => {
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
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (error) {
    throw error;
  }
};

// Add member to project
export const addProjectMember = async (projectId: string, userId: string, userEmail: string, role: 'Owner' | 'Member' | 'Viewer' = 'Member'): Promise<void> => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (projectDoc.exists()) {
      const projectData = projectDoc.data();
      const teamMembers = projectData.teamMembers || {};
      
      teamMembers[userId] = {
        role,
        joinedAt: serverTimestamp()
      };
      
      await updateDoc(projectRef, {
        teamMembers,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    throw error;
  }
};

// Remove member from project
export const removeProjectMember = async (projectId: string, userId: string): Promise<void> => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (projectDoc.exists()) {
      const projectData = projectDoc.data();
      const teamMembers = projectData.teamMembers || {};
      
      delete teamMembers[userId];
      
      await updateDoc(projectRef, {
        teamMembers,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    throw error;
  }
};

// Update member role
export const updateMemberRole = async (projectId: string, userId: string, role: 'Owner' | 'Member' | 'Viewer'): Promise<void> => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (projectDoc.exists()) {
      const projectData = projectDoc.data();
      const teamMembers = projectData.teamMembers || {};
      
      if (teamMembers[userId]) {
        teamMembers[userId].role = role;
        
        await updateDoc(projectRef, {
          teamMembers,
          updatedAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    throw error;
  }
};
