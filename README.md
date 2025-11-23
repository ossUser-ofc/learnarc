[![Please Star](https://img.shields.io/badge/⭐_Star_this_repo!-FFD700?style=flat)](https://github.com/ossUser-Swift/study-progress-hub/stargazers)
[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-4CAF50?style=flat)](https://study-progress-hub.lovable.app)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat)](LICENSE.md)

# 📚 Homework Tracker Pro

[![Built with Lovable](https://img.shields.io/badge/Built_with-Lovable-6366f1?style=flat&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMiA3TDEyIDEyTDIyIDdMMTIgMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yIDEyTDEyIDE3TDIyIDEyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTIgMTdMMTIgMjJMMjIgMTciIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K)](https://lovable.dev)
[![GitHub User](https://img.shields.io/badge/ossUser-0078D4?style=flat&logo=github&logoColor=white)](https://github.com/ossUser-Swift)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **A comprehensive, AI-powered task management system designed specifically for students to organize homework, track progress, manage study time, and boost productivity.**

🌐 **[Try it Live](https://study-progress-hub.lovable.app)** | 📖 **[Documentation](#-features)** | 🐛 **[Report Bug](https://github.com/ossUser-Swift/study-progress-hub/issues)** | 💡 **[Request Feature](https://github.com/ossUser-Swift/study-progress-hub/issues)**

## ✨ Features

### 📝 Task Management
- **Create & Organize Tasks**: Categorize by homework, revision, projects, or other
- **Priority Levels**: Set low, medium, or high priority for better focus
- **Progress Tracking**: Track completion percentage with visual sliders
- **Subtask Management**: Break down large tasks into manageable subtasks
- **Task Dependencies**: Link related tasks to maintain proper workflow
- **Recurring Tasks**: Set up daily, weekly, or monthly recurring assignments
- **Full Markdown Support**: Rich text formatting in task descriptions and notes

### 🎯 Multiple Views
- **List View**: Traditional task list with detailed information
- **Kanban Board**: Drag-and-drop cards across Todo, In Progress, and Done columns
- **Calendar View**: See all tasks on a monthly calendar with due dates
- **Timeline View**: Visualize task schedules and dependencies on a timeline

### 🤖 AI-Powered Features
- **Smart Task Analysis**: AI analyzes task complexity and suggests time estimates
- **Study Tips**: Get personalized tips based on task category and difficulty
- **Priority Recommendations**: AI suggests optimal priority levels
- **Weekly Summaries**: Automatic AI-generated weekly performance reports
- **Subtask Generation**: AI breaks down complex tasks into subtasks

### ⏱️ Time Tracking
- **Built-in Timer**: Track study time for each task with start/stop timer
- **Session History**: View all time tracking sessions
- **Total Time Spent**: See cumulative time across all tasks
- **Completion Analytics**: Compare estimated vs actual time spent

### 📓 Note-Taking System
- **Rich Text Notes**: Create notes with full markdown support
- **Folder Organization**: Organize notes in custom folders
- **Tag System**: Tag notes for easy filtering and search
- **Task Linking**: Associate notes with specific tasks
- **Markdown Toolbar**: Quick formatting buttons for markdown syntax

### 📊 Analytics & Insights
- **Progress Charts**: Visual graphs showing task completion over time
- **Category Breakdown**: See time distribution across different categories
- **Completion Statistics**: Track tasks completed, in progress, and pending
- **Study Patterns**: Identify your most productive days and categories

### ⚙️ Advanced Settings
- **Profile Customization**: Set display name and preferences
- **Notification Controls**: Toggle email notifications and task reminders
- **View Preferences**: Choose your default view (list, kanban, calendar, timeline)
- **Theme Selection**: Light, dark, or system-based theme
- **Timezone & Language**: Regional settings for accurate due dates
- **Data Export**: Export all your tasks and notes to JSON

### 🔒 Security & Privacy
- **User Authentication**: Secure email/password authentication
- **Row-Level Security**: Database-level isolation between users
- **Encrypted Storage**: All data encrypted at rest
- **Session Management**: Automatic token refresh and secure logout

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ossUser-Swift/study-progress-hub.git
cd study-progress-hub
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (automatically provided in Lovable)

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:8080`

### First Time Setup

1. **Create an Account**: Sign up with your email and password
2. **Create Your First Task**: Click the "Add Task" button
3. **Explore Views**: Try out different views (List, Kanban, Calendar, Timeline)
4. **Set Up Notes**: Navigate to the Notebook tab to create your first note
5. **Adjust Settings**: Click the Settings icon to customize your experience

## 🛠️ Technologies Used

### Frontend
- **React 18**: Modern UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Shadcn UI**: High-quality component library
- **React Router**: Client-side routing
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **Date-fns**: Date manipulation
- **Recharts**: Data visualization
- **React Markdown**: Full markdown support with KaTeX math

### Backend (Lovable Cloud)
- **PostgreSQL**: Relational database with full ACID compliance
- **Row-Level Security (RLS)**: User data isolation at database level
- **Edge Functions**: Serverless functions for AI integration
- **Authentication**: JWT-based authentication with automatic refresh

### AI Integration
- **Lovable AI Gateway**: Multi-model AI access
- **Gemini 2.5 Flash**: Fast AI analysis and summaries
- **Streaming Responses**: Real-time AI output

## 📁 Project Structure

```
homework-tracker/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Shadcn UI components
│   │   ├── TaskCard.tsx
│   │   ├── KanbanView.tsx
│   │   ├── CalendarView.tsx
│   │   ├── NotebookView.tsx
│   │   ├── MarkdownRenderer.tsx
│   │   └── ...
│   ├── pages/            # Route pages
│   │   ├── Index.tsx     # Main dashboard
│   │   ├── Auth.tsx      # Login/signup
│   │   └── Settings.tsx  # User settings
│   ├── hooks/            # Custom React hooks
│   │   ├── useTasks.ts   # Task management hook
│   │   └── useLocalStorage.ts
│   ├── types/            # TypeScript type definitions
│   │   └── task.ts
│   ├── lib/              # Utility functions
│   │   └── utils.ts
│   └── integrations/     # External integrations
│       └── supabase/
├── supabase/
│   ├── functions/        # Edge functions
│   │   ├── analyze-task/
│   │   └── generate-weekly-summary/
│   └── migrations/       # Database migrations
├── public/               # Static assets
└── package.json
```

## 🔐 Security Features

- **Authentication Required**: All features require user login
- **User Data Isolation**: Users can only access their own data via RLS policies
- **Secure Edge Functions**: JWT verification on all API endpoints
- **Input Validation**: Comprehensive validation on all user inputs
- **XSS Protection**: Markdown sanitization to prevent script injection
- **SQL Injection Prevention**: Parameterized queries and RLS policies
- **Session Security**: Automatic token refresh and secure logout

## 🎨 Customization

### Themes
The app supports light and dark themes with automatic system detection. Customize colors in `src/index.css`.

### Categories
Modify task categories in `src/types/task.ts`:

```typescript
export type TaskCategory = 'homework' | 'revision' | 'projects' | 'other';
```

## 📊 Database Schema

### Main Tables
- **tasks**: Core task data with progress tracking and markdown support
- **subtasks**: Task breakdowns
- **notes**: Rich text notes with markdown rendering
- **tags**: Custom tags for organization
- **task_tags**: Many-to-many relationship
- **task_time_sessions**: Time tracking records
- **ai_analysis**: AI-generated insights
- **weekly_summaries**: AI-generated weekly reports
- **user_settings**: User preferences and settings

All tables have proper RLS policies ensuring user data isolation.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev) - AI-powered development platform
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Backend by Lovable Cloud (powered by Supabase)
- AI powered by Lovable AI Gateway (Gemini models)

## 📧 Support

For support, [open an issue](https://github.com/ossUser-Swift/study-progress-hub/issues) on GitHub or visit our [live demo](https://study-progress-hub.lovable.app).

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Collaborative study groups
- [ ] Pomodoro timer integration
- [ ] Study habit analytics dashboard
- [ ] Integration with external calendars
- [ ] PDF annotation tools
- [ ] Flashcard system
- [ ] Grade tracking
- [ ] Course schedule management
- [ ] Voice notes and dictation

---

Made with ❤️ for students everywhere.
