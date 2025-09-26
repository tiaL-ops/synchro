# Synchro – Project Management with LLM

**Synchro** is a web app that helps student groups and teams plan projects, create team charters, and manage work together. It uses **Gemini AI** to turn big project goals into smaller, actionable tasks.
Let's say a more mature that my first attemtp last year haha [toDoList] (https://github.com/tiaL-ops/toDoList)
This was also my first time building with **Cursor** :D ,I wanted to see how fast I could ship a working product.

[Live Demo](https://synchro-core.web.app/) 

---

## Features

### AI-Powered Project Setup

* Breaks project goals into 12–20 clear micro-tasks
* Asks clarifying questions for vague goals
* Assigns priorities and time estimates
* Groups tasks into categories (Research, Development, Testing, etc.)

### Collaboration Tools

* Role-based access (Owner, Member, Viewer)
* Invite teammates by email
* Real-time sync and updates
* Public or private project visibility

### Task Management

* Kanban board with drag-and-drop workflow
* Visual roadmap and progress tracking
* Task assignment with due dates
* Status flow: To Do → In Progress → Review → Done

### Security

* Firestore security rules for safe data access
* Role-based permissions and project ownership
* Encrypted user data, managed with Firebase Auth

---

## Tech Stack

* **Frontend**: React 18, TypeScript, Material-UI
* **Backend**: Firebase (Auth, Firestore, Hosting)
* **AI**: Google Gemini for task generation
* **Other**: React Router, Context API

---

## Quick Start

```bash
git clone https://github.com/tiaL-ops/synchro.git
cd synchro/synchro-app
npm install
cp .env.example .env
npm start
```

---

## Usage

1. Sign up (Google or email)
2. Create a project
3. Use AI to generate tasks
4. Invite team members
5. Track progress with the Kanban board

---

## Contributing

Fork the repo, create a feature branch, push changes, and open a PR. Contributions are welcome!

---

Made for better project management.
[Live Demo](https://synchro-core.web.app) | [Report Bug](https://github.com/tiaL-ops/synchro/issues) | [Request Feature](https://github.com/tiaL-ops/synchro/issues)
