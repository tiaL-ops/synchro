## Synchro - MVP Day 1

Synchro is a web application designed to help student groups and teams create comprehensive project charters and manage their collaborative work. The app integrates AI technology to generate detailed team charters, break down projects into manageable tasks, and provide structured guidance for successful team collaboration.


### Project Overview

This is a Day-1 MVP that enables:
- User authentication (Google + Email/Password)
- Project creation and management
- Team member invitations with roles
- Task management with status tracking
- Secure access control with Firestore rules

### Features

#### Authentication
- **Google Sign-In**: Quick authentication with Google accounts
- **Email/Password**: Traditional email-based authentication
- **User Profiles**: Display names, preferences, and account management

#### Project Management
- **Create Projects**: Set project name, goals, and deadlines
- **Team Invitations**: Add members by email with role assignment
- **Role-Based Access**: Owner, Member, and Viewer roles
- **Project Visibility**: Private and public project options

#### Task Management
- **Task Board**: Kanban-style board with status columns
- **Status Tracking**: To Do → In Progress → Review → Done
- **Task Assignment**: Assign tasks to team members
- **Due Dates**: Set and track task deadlines

#### Security
- **Firestore Rules**: Enforce access control at database level
- **Role-Based Permissions**: Only owners can edit projects, assignees can update tasks
- **Member-Only Access**: Non-members cannot view project data

###  Tech Stack

- **Frontend**: React 18, TypeScript, Material-UI
- **Backend**: Firebase (Authentication, Firestore)
- **Routing**: React Router v6
- **State Management**: React Context API
- **Deployment**: Firebase Hosting

### Project Structure

```
synchro-app/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   └── LoadingSpinner.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── AuthScreen.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ProjectDetail.tsx
│   │   └── CreateProject.tsx
│   ├── services/
│   │   ├── firebase.ts
│   │   ├── authService.ts
│   │   ├── projectService.ts
│   │   └── taskService.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── index.tsx
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
└── package.json
```

### Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### 1. Clone and Install

```bash
cd synchro-app
npm install
```

### 2. Firebase Setup

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project named "synchro-core"

2. **Enable Authentication**:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password" and "Google" providers

3. **Create Firestore Database**:
   - Go to Firestore Database
   - Create database in production mode
   - Choose a location (e.g., us-central1)

4. **Get Configuration**:
   - Go to Project Settings → General
   - Scroll down to "Your apps" section
   - Click "Add app" → Web app
   - Copy the Firebase configuration

#### 3. Configure Firebase

The Firebase configuration is already set up in `src/services/firebase.ts` with your project credentials:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyCjGC6KoJQMrQNeYSa5PetcOJq0Qn-HS6E",
  authDomain: "synchro-core.firebaseapp.com",
  projectId: "synchro-core",
  // ... other config
};
```

### 4. Deploy Security Rules

```bash
# From the project root directory
firebase deploy --only firestore:rules
```

### 5. Run the Application

```bash
npm start
```

The application will be available at `http://localhost:3000`

### Testing the MVP

### Test Scenario 1: User Registration and Project Creation

1. **Sign Up**: Create a new account with email/password or use Google sign-in
2. **Create Project**: Click "Create Project" and fill in project details
3. **Verify**: Check that you're automatically assigned as the project owner

### Test Scenario 2: Team Collaboration

1. **User A**: Create a project and note the project ID from the URL
2. **User B**: Sign up with a different account
3. **User A**: Add User B's email to the project (Note: This is a simplified version - in production, you'd implement proper user search)
4. **User B**: Navigate to the project URL and verify access
5. **User B**: Create and update tasks

### Test Scenario 3: Security Rules

1. **User C**: Sign up with a third account
2. **User C**: Try to access the project URL from Test Scenario 2
3. **Verify**: User C should not be able to see the project data

##  Data Model

### Users Collection (`/users/{userId}`)
```typescript
{
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
```

### Projects Collection (`/projects/{projectId}`)
```typescript
{
  projectName: string;
  goal: string;
  deadline?: Date;
  createdBy: string;
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
```

### Tasks Collection (`/tasks/{taskId}`)
```typescript
{
  projectId: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
  assignedTo?: string;
  dueDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔒 Security Rules

The Firestore security rules enforce:

- **Users**: Can only read/write their own user document
- **Projects**: Only members can read, only owners can edit/delete
- **Tasks**: Only project members can read/create, only owners or assignees can update

## 🚀 Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Environment Variables

For production deployment, ensure your Firebase configuration is properly set in the hosting environment.

## 🧪 Running Tests

```bash
npm test
```

## 📝 Development Notes

### Current Limitations (Day-1 MVP)
- User search by email is simplified (placeholder implementation)
- No real-time notifications
- No file uploads
- No advanced permissions beyond basic roles
- No activity feeds or audit logs

### Future Enhancements (Day 2+)
- Real-time collaboration features
- Advanced user search and invitations
- File attachments and comments
- Activity feeds and notifications
- Advanced permission system
- User presence indicators
- Project templates
- Time tracking and reporting

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Open an issue in the repository
- Check the Firebase documentation
- Review the React and Material-UI documentation

## 🎉 Success Criteria

 **Two users can successfully sign in** using both Google and Email/Password providers  
**User A can create a new project** and is automatically assigned the 'Owner' role  
**User A can add User B to the project** with a role  
 **Tasks can be created and assigned** to User B, visible to both users  
**User B can change task status** but cannot edit project details  
 **User C (non-member) cannot access** project data  
**Security rules are properly enforced** at the database level  
 **Application runs locally** with Firebase emulators  

This MVP successfully demonstrates a functional team project management system with proper security, role-based access control, and collaborative features.