// User types
export interface User {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  preferences: {
    workHours?: string;
    communicationStyle?: string;
    skills?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Project types
export interface Project {
  id: string;
  projectName: string;
  goal: string;
  deadline?: Date;
  createdBy: string;
  createdByEmail?: string;
  createdAt: Date;
  updatedAt: Date;
  teamMembers: {
    [userId: string]: {
      role: 'Owner' | 'Member' | 'Viewer';
      joinedAt: Date;
    };
  };
  visibility: 'private' | 'public';
}

// Task types
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
  assignedTo?: string; // Keep for backward compatibility
  assignedToUsers?: string[]; // New field for multiple assignees
  dueDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Component props types
export interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

export interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  canEdit: boolean;
}

export interface TaskBoardProps {
  projectId: string;
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  canEdit: boolean;
}
