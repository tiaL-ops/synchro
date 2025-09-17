# Synchro - AI-Powered Team Project Management

Synchro is a web application designed to help student groups and teams create comprehensive project charters and manage their collaborative work. The app integrates AI technology to generate detailed team charters, break down projects into manageable tasks, and provide structured guidance for successful team collaboration.

## Features

- **User Authentication**: Secure login and registration system
- **Project Creation**: Create and manage team projects with detailed information
- **Team Invitations**: Invite team members via email
- **AI-Powered Charter Generation**: Generate comprehensive team charters using Google AI
- **Project Breakdown**: AI-assisted task breakdown and timeline creation
- **Modern UI**: Clean, responsive interface built with Material-UI
- **Real-time Collaboration**: Firebase-powered real-time updates

## Tech Stack

- **Frontend**: React 18, Material-UI, React Router
- **Backend**: Firebase (Authentication, Firestore, Functions)
- **AI Integration**: Google AI API (Gemini Pro)
- **Deployment**: Firebase Hosting

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Google AI API key

### 1. Clone and Install Dependencies

```bash
cd synchro-app
npm install
```

### 2. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Firebase Hosting

### 3. Environment Configuration

Create a `.env` file in the `synchro-app` directory:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Google AI API
REACT_APP_GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### 4. Google AI API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the key to your `.env` file

### 5. Deploy Firebase Rules

```bash
firebase deploy --only firestore:rules
```

### 6. Run the Application

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
synchro-app/
├── public/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React contexts
│   ├── firebase/           # Firebase configuration and services
│   ├── pages/              # Main application pages
│   ├── services/           # External API services
│   ├── App.js              # Main application component
│   └── index.js            # Application entry point
├── firebase.json           # Firebase configuration
├── firestore.rules         # Firestore security rules
└── firestore.indexes.json  # Firestore indexes
```

## Usage

1. **Sign Up/Login**: Create an account or sign in
2. **Create Project**: Click "Create Project" to start a new project
3. **Add Team Members**: Invite team members by email
4. **Define Goals**: Specify project goals and team roles
5. **Generate Charter**: Use AI to generate a comprehensive team charter
6. **Manage Project**: View project details, regenerate charters, and collaborate

## AI Features

The application uses Google's Gemini Pro model to:

- Generate comprehensive team charters including:
  - Project overview and objectives
  - Team structure and roles
  - Communication guidelines
  - Meeting schedules
  - Decision-making processes
  - Conflict resolution procedures
  - Success metrics and deliverables
  - Timeline and milestones
  - Risk management strategies
  - Code of conduct

- Break down projects into manageable tasks with:
  - Task lists and milestones
  - Suggested timelines
  - Team member assignments
  - Task dependencies
  - Risk assessment

## Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Environment Variables for Production

Make sure to set the environment variables in your Firebase project settings or hosting configuration.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.
