# StudySync

**AI-Powered Study Group Organizer**

StudySync is a full-stack web application that uses AI to analyze study materials (PDF/TXT), generate summaries and flashcards, and intelligently match students into study groups based on shared topics. Students can collaborate in real-time group chats while benefiting from AI-generated study tools.

## Key Features

- ✅ **User Authentication** - Secure registration and login with JWT-based authentication
- ✅ **Course & Material Management** - Organize study materials by course with drag-and-drop file upload
- ✅ **AI-Generated Summaries** - Automatic comprehensive summaries of uploaded materials using Google Gemini AI
- ✅ **AI-Generated Flashcards** - Interactive quiz mode with 3D flip card animations for effective studying
- ✅ **Intelligent Group Matching** - Smart study group recommendations based on keyword overlap from your materials
- ✅ **Study Group Management** - Create, join, and manage study groups with other students
- ✅ **Real-time Group Chat** - Live messaging with Socket.IO, typing indicators, and WhatsApp-like interface
- ✅ **File Deletion** - Remove unwanted materials with confirmation modals
- ✅ **Responsive Design** - Mobile-first design with Tailwind CSS, including slide-out mobile navigation
- ✅ **Asynchronous Processing** - Non-blocking AI processing with real-time status updates

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first styling with purple/blue gradient theme
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time WebSocket communication
- **Lucide React** - Icon library
- **React Context API** - Global state management

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **PostgreSQL** - Relational database (hosted on Supabase)
- **Prisma ORM** - Database toolkit and query builder
- **Google Gemini AI** - AI model for summaries, flashcards, and keyword extraction
- **Socket.IO** - Real-time bidirectional communication
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcrypt** - Password hashing
- **pdfjs-dist** - PDF text extraction
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

## Project Structure

```
StudySync2/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   │   └── CreateCourseModal.jsx
|   |   |   |__
│   │   ├── pages/             # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CourseDetail.jsx
│   │   │   ├── ViewSummary.jsx
│   │   │   ├── StudyFlashcards.jsx
│   │   │   ├── FindGroups.jsx
│   │   │   ├── MyGroups.jsx
│   │   │   └── GroupChat.jsx
│   │   ├── context/           # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx            # Main app component
│   │   └── index.css          # Tailwind configuration
│   ├── package.json
│   └── vite.config.js
├── server/                     # Express backend
│   ├── routes/                # API route handlers
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── materials.js
│   │   └── groups.js
│   ├── middleware/            # Authentication middleware
│   │   └── auth.js
│   ├── services/              # Business logic
│   │   └── aiService.js       # Google Gemini integration
│   ├── prisma/                # Database schema
│   │   └── schema.prisma
│   ├── uploads/               # Temporary file storage
│   ├── index.js               # Server entry point
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** database (local or hosted on Supabase)
- **Google Gemini API Key** - [Get one here](https://makersuite.google.com/app/apikey)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ASyadav070/StudySYNC-APP.git
   cd StudySync2
   ```

2. **Install dependencies for both client and server**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**

   Create `.env` files in both `client` and `server` directories based on the `.env.example` files:

   **Server `.env`** (`server/.env`):
   ```env
   PORT=5000
   NODE_ENV=development
   
   # PostgreSQL connection strings (Supabase or local)
   DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"
   DIRECT_URL="postgresql://username:password@host:5432/database?schema=public"
   
   # Generate a secure random string (use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   
   # Google Gemini API key
   GEMINI_API_KEY="your-gemini-api-key-here"
   
   # Client URL
   CLIENT_URL="http://localhost:5173"
   ```

   **Client `.env`** (`client/.env`):
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Run Prisma migrations**
   ```bash
   cd server
   npx prisma generate
   npx prisma migrate deploy
   # Or for development:
   npx prisma migrate dev
   ```

5. **Start the development servers**

   **Terminal 1 - Start the backend server:**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Start the frontend client:**
   ```bash
   cd client
   npm run dev
   ```

6. **Access the application**
   - Open your browser and navigate to `http://localhost:5173`
   - The backend API runs on `http://localhost:5000`

## Environment Variables

### Client Environment Variables (`client/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` |

### Server Environment Variables (`server/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | Yes |
| `NODE_ENV` | Environment mode | Yes |
| `DATABASE_URL` | PostgreSQL connection string (pooled) | Yes |
| `DIRECT_URL` | PostgreSQL direct connection string | Yes |
| `JWT_SECRET` | Secret key for JWT token signing | Yes |
| `GEMINI_API_KEY` | Google Gemini API key for AI features | Yes |
| `CLIENT_URL` | Frontend application URL (for CORS) | Yes |

**Note:** Never commit actual secret values to version control. Use strong, randomly generated values for `JWT_SECRET` in production.

## Usage

### 1. **Create an Account**
   - Navigate to the application (`http://localhost:5173`)
   - Click "Sign up" and register with your email and password
   - Or log in if you already have an account

### 2. **Create a Course**
   - From the Dashboard, click "+ Create Course"
   - Enter a course name (e.g., "Biology 101", "Computer Science 250")
   - Click "Create Course"

### 3. **Upload Study Materials**
   - Click on a course card to view course details
   - Drag and drop a PDF or TXT file into the upload zone, or click to browse
   - The file will be uploaded and processed asynchronously
   - Watch the status change from "Processing..." to "Completed" in real-time

### 4. **Access AI-Generated Study Tools**
   - Once processing is complete, two buttons will appear:
     - **View Summary**: See a comprehensive AI-generated summary of your material
     - **Study Flashcards**: Enter quiz mode with interactive flip cards
   - In flashcard mode, click cards to flip between questions and answers
   - Use navigation buttons to move through the deck

### 5. **Find and Join Study Groups**
   - Click "Find Groups" in the navigation bar
   - Browse AI-recommended groups based on matching topics from your materials
   - View relevance scores and matching keywords
   - Click "Join Group" to become a member

### 6. **Manage Your Groups**
   - Click "My Groups" to see all groups you've joined
   - View group members and descriptions
   - Click "Create Group" to start your own study group
   - Click "Open Chat" to enter the group chat room

### 7. **Collaborate in Real-Time**
   - In group chat, send messages to all group members
   - See typing indicators when others are composing messages
   - Messages appear instantly via WebSocket connection
   - Your messages appear on the right with a purple gradient, others' on the left

### 8. **Delete Materials**
   - From the course detail page, click the trash icon next to any material
   - Confirm deletion in the modal
   - The material and all associated AI-generated content will be permanently removed

## Demo Link

[Link to Live Demo - To be added]

*Deployment coming soon on Vercel (frontend) and Railway/Render (backend)*

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Courses
- `POST /api/courses` - Create a new course
- `GET /api/courses` - Get all courses for authenticated user
- `GET /api/courses/:id` - Get course details with materials

### Materials & AI
- `POST /api/courses/:id/upload` - Upload file (returns 202 Accepted immediately)
- `DELETE /api/materials/:id` - Delete material and associated data
- `GET /api/materials/:id/summary` - Get AI-generated summary
- `GET /api/materials/:id/flashcards` - Get AI-generated flashcards

### Groups
- `GET /api/groups/recommendations` - Get AI-matched group recommendations
- `POST /api/groups` - Create a new study group
- `GET /api/groups/my-groups` - Get user's joined groups
- `POST /api/groups/:id/join` - Join a study group
- `GET /api/groups/:id/messages` - Get group chat messages
- `POST /api/groups/:id/messages` - Send a message to group

### WebSocket Events (Socket.IO)
- `material_processed` - Emitted when AI processing completes
- `new_message` - Emitted when a new chat message is sent
- `user_typing` - Emitted when a user is typing
- `user_stop_typing` - Emitted when a user stops typing

## Architecture Highlights

### Asynchronous AI Processing
The application implements a non-blocking architecture for optimal performance:

1. **Immediate Response**: Upload endpoint returns `202 Accepted` instantly with a material ID
2. **Background Processing**: File parsing and AI API calls happen asynchronously in a separate thread
3. **Atomic Database Transaction**: All AI-generated data (summary, flashcards, keywords) saved together
4. **Real-time Notification**: Socket.IO pushes completion status to the client immediately
5. **Error Handling**: Comprehensive error handling with status tracking in the database

### AI Integration
- **Google Gemini Pro** for all AI operations (summaries, flashcards, keyword extraction)
- **Parallel API Calls** for efficiency (all three AI tasks run concurrently)
- **Structured Output** with JSON parsing for flashcards
- **Retry Logic** and error recovery for API failures
- **Text Extraction** using pdfjs-dist for PDFs

### Real-time Features
- **Socket.IO** for bidirectional WebSocket communication
- **Room-based Chat** for isolated group conversations
- **Typing Indicators** for enhanced user experience
- **Instant Material Status Updates** when AI processing completes

### Security
- **JWT Authentication** for stateless, scalable auth
- **bcrypt Password Hashing** with salt rounds
- **Protected Routes** with middleware validation
- **CORS Configuration** to prevent unauthorized access
- **Input Validation** and sanitization

## Development

### Running the Application

**Server** (Port 5000):
```bash
cd server
npm run dev
```

**Client** (Port 5173):
```bash
cd client
npm run dev
```

**Database Studio** (Optional):
```bash
cd server
npx prisma studio
```

### Useful Commands

**Prisma Commands** (run in `server` directory):
- `npx prisma generate` - Generate Prisma Client
- `npx prisma migrate dev` - Create and apply migrations
- `npx prisma migrate deploy` - Apply migrations in production
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma db push` - Push schema changes without migrations

**Format Code**:
```bash
# Format server code
cd server
npm run format

# Format client code
cd client
npm run format
```

## Troubleshooting

### Common Issues

**❌ Server won't start**
- Ensure PostgreSQL is running and accessible
- Verify `DATABASE_URL` in `server/.env` is correct
- Run `npx prisma generate` to regenerate Prisma Client
- Check if port 5000 is already in use

**❌ File upload fails**
- Verify `GEMINI_API_KEY` is valid and has quota remaining
- Ensure file size is under 10MB
- Check server logs for detailed error messages
- Confirm file is PDF or TXT format

**❌ Real-time updates not working**
- Verify Socket.IO connection in browser DevTools Console
- Check firewall settings aren't blocking WebSocket connections
- Ensure `CLIENT_URL` in server `.env` matches your frontend URL
- Confirm `VITE_API_URL` in client `.env` points to the backend

**❌ Database connection errors**
- Verify both `DATABASE_URL` and `DIRECT_URL` are set
- For Supabase: Use pooled connection for `DATABASE_URL` and direct connection for `DIRECT_URL`
- Test connection with `npx prisma db pull`

**❌ Tailwind styles not applying**
- Ensure Tailwind v4 syntax is used (`bg-linear-to-r` not `bg-gradient-to-r`)
- Check `index.css` has `@import "tailwindcss";`
- Clear Vite cache: `rm -rf node_modules/.vite`

**❌ Group recommendations not appearing**
- Upload materials to generate keywords first
- Wait for AI processing to complete (check material status)
- Ensure other users have uploaded materials with overlapping topics
- Check server logs for keyword extraction errors

## Project Status

**✅ Completed Features:**
- Epic 1: User Authentication (Login, Register, JWT)
- Epic 2: Course & Material Management (CRUD operations, file upload)
- Epic 3: AI-Powered Study Tools (Summaries, Flashcards, Keywords)
- Epic 4: Intelligent Group Matching (Recommendations, Join/Create Groups)
- Epic 5: Real-time Group Chat (Socket.IO, Typing indicators)
- Step 7: Final Polish & Cleanup (Tailwind CSS v4 styling, Responsive design)

**🎨 Design System:**
- Purple/blue gradient theme (`from-purple-500 to-blue-600`)
- Consistent component styling across all pages
- Mobile-responsive with slide-out navigation drawer
- 3D flip card animations for flashcards
- WhatsApp-like chat interface

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Google Gemini AI** for powerful AI capabilities
- **Supabase** for PostgreSQL hosting
- **Tailwind CSS** for utility-first styling
- **Prisma** for excellent database tooling
- **Socket.IO** for real-time communication

## Contact

**Project Repository:** [https://github.com/ASyadav070/StudySYNC-APP](https://github.com/ASyadav070/StudySYNC-APP)

**Developer:** ASyadav070

---

**Built with ❤️ for students who want to study smarter, not harder.**
