# StudySync

AI-powered web application for students to study more effectively with automatic study tool generation and intelligent group matching.

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **AI**: Google Gemini API
- **Real-time**: Socket.IO

## Project Structure

```
StudySync2/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context for state management
│   │   └── App.jsx        # Main app component
│   ├── package.json
│   └── vite.config.js
└── server/                # Express backend
    ├── routes/           # API route handlers
    ├── middleware/       # Authentication & validation middleware
    ├── services/         # Business logic (AI processing)
    ├── prisma/          # Database schema
    │   └── schema.prisma
    ├── uploads/         # Temporary file storage
    └── index.js         # Server entry point
```

## Features Implemented

### ✅ Epic 1: User Authentication
- User registration with email and password
- JWT-based authentication
- Login and logout functionality
- Session persistence

### ✅ Epic 2: Course & Material Management
- Create and view courses
- Upload study materials (PDF, TXT)
- View materials with processing status
- Real-time status updates via Socket.IO

### ✅ Epic 3: AI-Powered Study Tools
- **Asynchronous AI Processing**: Non-blocking file upload and background processing
- **PDF & TXT Parsing**: Extracts text content from uploaded files using pdfjs-dist
- **AI-Generated Summaries**: Comprehensive summaries using Google Gemini
- **AI-Generated Keywords**: Automatic topic extraction for group matching
- **AI-Generated Flashcards**: Interactive quiz mode with flip animation
- **Real-time Notifications**: Socket.IO alerts when processing completes

### 🚧 Epic 4: Intelligent Group Matching (Coming Next)
- Smart group recommendations based on keyword overlap
- Join study groups
- View group members

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Server Setup

1. Navigate to server directory:
   ```powershell
   cd server
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):
   ```powershell
   cp .env.example .env
   ```

4. Update `.env` with your credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Your PostgreSQL connection string
   DATABASE_URL="postgresql://username:password@localhost:5432/studysync?schema=public"
   
   # Generate a secure random string for JWT
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   
   # Your Google Gemini API key
   GEMINI_API_KEY="your-gemini-api-key-here"
   
   CLIENT_URL="http://localhost:5173"
   ```

5. Generate Prisma Client and run migrations:
   ```powershell
   npm run prisma:generate
   npm run prisma:migrate
   ```

6. Start the server:
   ```powershell
   npm run dev
   ```

### Client Setup

1. Navigate to client directory:
   ```powershell
   cd client
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):
   ```powershell
   cp .env.example .env
   ```

4. Verify `.env` contains:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

5. Start the development server:
   ```powershell
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Usage Guide

### 1. Register/Login
- Visit `http://localhost:5173`
- Create a new account or log in

### 2. Create a Course
- Click "+ Create Course" on the dashboard
- Enter a course name (e.g., "Biology 101")

### 3. Upload Study Material
- Click on a course card
- Drag & drop a PDF or TXT file into the upload zone
- Watch the real-time status update from "Processing..." to "Completed"

### 4. View AI-Generated Content
- Once processing is complete, click "View Summary" to see the AI-generated summary
- Click "Study Flashcards" to enter quiz mode
- Use the flip animation to study questions and answers

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login

### Courses
- `POST /api/courses` - Create a course
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course with materials

### Materials & AI
- `POST /api/courses/:id/upload` - Upload file (returns 202 immediately)
- `GET /api/materials/:id/summary` - Get AI summary
- `GET /api/materials/:id/flashcards` - Get AI flashcards

## Development

- Server runs on: `http://localhost:5000`
- Client runs on: `http://localhost:5173`
- Database Studio (optional): `npm run prisma:studio` (in server directory)

## Architecture Highlights

### Asynchronous AI Processing
The app implements a non-blocking architecture as specified in the PRD:

1. **Immediate Response**: Upload endpoint returns 202 Accepted instantly
2. **Background Processing**: File parsing and AI calls happen asynchronously
3. **Database Transaction**: All AI data saved atomically
4. **Real-time Notification**: Socket.IO pushes completion status to client

### AI Integration
- Uses Google Gemini Pro for all AI operations
- Parallel API calls for efficiency
- Comprehensive error handling
- Automatic retry logic

## Troubleshooting

### Server won't start
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` in `.env`
- Run `npm run prisma:generate` again

### File upload fails
- Check `GEMINI_API_KEY` is valid
- Ensure file is under 10MB
- Check server logs for detailed error

### Real-time updates not working
- Verify Socket.IO connection in browser console
- Check firewall settings
- Ensure client and server URLs match

---

**Status**: Steps 1-3 and most of Step 4 complete. Ready for Epic 4 (Group Matching).
