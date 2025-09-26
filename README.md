## Synchro - Project Management using LLM to breaks big project in smaller task

Synchro is a web application designed to help student groups and teams create comprehensive project charters and manage their collaborative work. The app integrates Gemini Prompt technology to generate detailed team charters and break down projects into manageable tasks.

This was also my first time using Cursor, I wanted to see how " quick" am i able to ship product!

[![Live Demo](https://synchro-core.web.app/)]


### Features

#### Gemini Prompt Task Generation
- **Smart Project Analysis**: AI analyzes project goals and generates specific, actionable tasks
- **Clarification Questions**: Interactive questions to refine vague project goals
- **Intelligent Task Breakdown**: Creates 12-20 micro-tasks (1-8 hours each)
- **Priority Assignment**: AI assigns High/Medium/Low priorities based on context
- **Time Estimation**: Provides realistic time estimates for each task
- **Category Organization**: Groups tasks by type (Research, Development, Testing, etc.)

#### Team Collaboration
- **Role-Based Access**: Owner, Member, and Viewer roles with appropriate permissions
- **Team Invitations**: Add members by email with role assignment
- **Real-time Updates**: Changes sync across all team members
- **Project Visibility**: Private and public project options

#### Task Management
- **Kanban Board**: Drag-and-drop task management with status columns
- **Task Roadmap**: Visual timeline view of project progress
- **Status Tracking**: To Do → In Progress → Review → Done workflow
- **Task Assignment**: Assign tasks to specific team members
- **Due Date Management**: Set and track task deadlines
- **Progress Tracking**: Visual indicators for project completion

#### Security & Permissions
- **Firestore Security Rules**: Database-level access control
- **Role-Based Permissions**: Granular access control based on user roles
- **Member-Only Access**: Non-members cannot view project data
- **Project Ownership**: Only owners can delete projects and manage team

### Tech Stack

- **Frontend**: React 18, TypeScript, Material-UI
- **Backend**: Firebase (Authentication, Firestore, Hosting)
- **AI**: Google Gemini AI for intelligent task generation
- **State Management**: React Context API
- **Routing**: React Router v6
- **Deployment**: Firebase Hosting

### Quick Start

#### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Gemini API key (optional, for AI features)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/synchro.git
cd synchro/synchro-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required Environment Variables:**
```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Gemini AI Configuration (Optional)
REACT_APP_GEMINI_API_KEY=your-gemini-api-key-here
```

### 4. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password + Google)
4. Create Firestore Database
5. Get your configuration from Project Settings

#### Deploy Security Rules
```bash
# From the project root
firebase deploy --only firestore:rules,firestore:indexes
```

### 5. Run the Application
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Usage Guide

### Creating Your First Project
1. **Sign Up**: Create an account using Google or email/password
2. **Create Project**: Click "Create Project" and enter your project details
3. **AI Task Generation**: Use the AI Task Generator to automatically create tasks
4. **Add Team Members**: Invite collaborators by email
5. **Manage Tasks**: Use the Kanban board to track progress

### AI Task Generation
1. **Enter Project Goal**: Describe what you want to achieve
2. **Answer Clarification Questions**: AI will ask specific questions to refine your goal
3. **Review Generated Tasks**: AI creates 12-20 specific, actionable tasks
4. **Customize Tasks**: Edit, add, or remove tasks as needed
5. **Assign Tasks**: Assign tasks to team members

### Project Structure

```
synchro/
├── synchro-app/                 # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── AITaskGenerator.tsx
│   │   │   ├── DeleteProjectDialog.tsx
│   │   │   ├── ClarificationQuestionsDialog.tsx
│   │   │   └── ...
│   │   ├── pages/              # Main application pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   └── CreateProject.tsx
│   │   ├── services/           # API and business logic
│   │   │   ├── aiService.ts
│   │   │   ├── projectService.ts
│   │   │   └── taskService.ts
│   │   └── types/              # TypeScript type definitions
│   ├── .env.example           # Environment variables template
│   └── package.json
├── functions/                  # Firebase Cloud Functions
│   ├── index.js               # Email notification functions
│   └── package.json
├── firebase.json              # Firebase configuration
├── firestore.rules           # Database security rules
└── firestore.indexes.json    # Database indexes
```

## 🔒 Security

### Firestore Security Rules
The application uses comprehensive Firestore security rules:

- **Users**: Can only read/write their own user document
- **Projects**: Only members can read, only owners can edit/delete
- **Tasks**: Only project members can read/create, only owners or assignees can update
- **Invitations**: Only project owners can create invitations

### Data Privacy
- All user data is encrypted in transit and at rest
- No sensitive information is stored in the frontend
- API keys are managed through environment variables
- User authentication is handled by Firebase Auth

## 🚀 Deployment

### Firebase Hosting
```bash
# Build the application
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### Environment Variables for Production
Ensure all environment variables are properly configured in your hosting environment:
- Firebase configuration
- Gemini API key (if using AI features)
- Email service credentials (for notifications)

## 🧪 Testing

### Test Scenarios
1. **User Registration**: Test both Google and email/password authentication
2. **Project Creation**: Create a project and verify owner assignment
3. **Team Collaboration**: Add team members and test role-based access
4. **Task Management**: Create, assign, and update tasks
5. **AI Features**: Test task generation with different project types
6. **Security**: Verify non-members cannot access private projects

### Running Tests
```bash
npm test
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use Material-UI components consistently
- Write comprehensive tests for new features
- Update documentation for API changes
- Follow the existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [Firebase](https://firebase.google.com/docs) and [React](https://reactjs.org/docs) documentation
- **Issues**: Open an issue in the repository for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

## 🎉 Acknowledgments

- **Firebase** for backend infrastructure
- **Google Gemini AI** for intelligent task generation
- **Material-UI** for beautiful UI components
- **React** for the amazing frontend framework




---

**Made with ❤️ for better project management**

[Live Demo](https://synchro-core.web.app) | [Report Bug](https://github.com/tiaL-ops/synchro/issues) | [Request Feature](https://github.com/tiaL-ops/synchro/issues)