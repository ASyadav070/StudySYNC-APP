import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CourseDetail from './pages/CourseDetail'
import ViewSummary from './pages/ViewSummary'
import StudyFlashcards from './pages/StudyFlashcards'
import FindGroups from './pages/FindGroups'
import MyGroups from './pages/MyGroups'
import GroupChat from './pages/GroupChat'
import PrivateRoute from './components/PrivateRoute'

function HomeRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/courses/:id" 
            element={
              <PrivateRoute>
                <CourseDetail />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/materials/:id/summary" 
            element={
              <PrivateRoute>
                <ViewSummary />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/materials/:id/flashcards" 
            element={
              <PrivateRoute>
                <StudyFlashcards />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/find-groups" 
            element={
              <PrivateRoute>
                <FindGroups />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/my-groups" 
            element={
              <PrivateRoute>
                <MyGroups />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/groups/:id/chat" 
            element={
              <PrivateRoute>
                <GroupChat />
              </PrivateRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
