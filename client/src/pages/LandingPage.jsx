import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Environment, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

// 3D Floating Sphere Component
function FloatingShape() {
  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={1}
      floatingRange={[-0.5, 0.5]}
    >
      <Sphere args={[1.5, 100, 100]} scale={1.2}>
        <MeshDistortMaterial
          color="#8b5cf6"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

// Secondary floating shapes
function AccentShape({ position, color, scale = 0.5 }) {
  return (
    <Float
      speed={1.5}
      rotationIntensity={0.3}
      floatIntensity={0.8}
      floatingRange={[-0.3, 0.3]}
    >
      <mesh position={position} scale={scale}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.7}
          wireframe
        />
      </mesh>
    </Float>
  );
}

function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleLearnMore = () => {
    // Scroll to features section or navigate to about page
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-linear-to-b from-gray-900 via-purple-900 to-blue-900">
      {/* 3D Canvas Background */}
      <div className="fixed inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          style={{ background: 'transparent' }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#a78bfa" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#60a5fa" />
          <spotLight position={[0, 5, 0]} angle={0.3} intensity={1} color="#8b5cf6" />

          {/* 3D Elements */}
          <FloatingShape />
          <AccentShape position={[-3, 2, -2]} color="#a78bfa" scale={0.4} />
          <AccentShape position={[3, -1, -3]} color="#60a5fa" scale={0.3} />
          <AccentShape position={[2, 2, -1]} color="#c084fc" scale={0.35} />

          {/* Environment for realistic lighting */}
          <Environment preset="sunset" />

          {/* Orbit Controls for subtle interaction */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2.5}
          />
        </Canvas>
      </div>

      {/* HTML Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center max-w-5xl mx-auto">
          {/* Logo Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 mb-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl">
            <BookOpen className="w-10 h-10 text-white" />
          </div>

          {/* Main Heading with Gradient */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold mb-6 bg-linear-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text leading-tight">
            StudySync
          </h1>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl md:text-3xl text-white/90 mb-4 font-light">
            AI-Powered Study Group Organizer
          </p>
          <p className="text-base sm:text-lg md:text-xl text-white/70 mb-12 max-w-3xl mx-auto">
            Transform your study materials into AI-generated summaries and flashcards. 
            Connect with peers studying similar topics through intelligent group matching.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={handleGetStarted}
              className="group relative px-8 py-4 bg-linear-to-r from-purple-500 to-blue-600 text-white text-lg font-semibold rounded-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-linear-to-r from-purple-600 to-blue-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button
              onClick={handleLearnMore}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white text-lg font-semibold rounded-lg border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              Learn More
            </button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 border border-white/20">
              🤖 AI Summaries
            </span>
            <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 border border-white/20">
              📚 Smart Flashcards
            </span>
            <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 border border-white/20">
              👥 Group Matching
            </span>
            <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 border border-white/20">
              💬 Real-time Chat
            </span>
          </div>
        </div>
      </div>

      {/* Features Section (for scroll anchor) */}
      <div id="features" className="relative z-10 min-h-screen bg-linear-to-b from-transparent to-gray-900/50 px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16 bg-linear-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
            Key Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="p-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 mb-4 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">AI-Generated Summaries</h3>
              <p className="text-white/70">
                Upload PDFs or text files and get instant, comprehensive summaries powered by Google Gemini AI.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="p-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 mb-4 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Interactive Flashcards</h3>
              <p className="text-white/70">
                Study smarter with AI-generated flashcards featuring 3D flip animations and quiz mode.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="p-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 mb-4 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Intelligent Matching</h3>
              <p className="text-white/70">
                Find study groups based on topic overlap from your uploaded materials using smart keyword matching.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="p-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 mb-4 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Real-time Chat</h3>
              <p className="text-white/70">
                Collaborate with group members through live messaging with typing indicators and instant updates.
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="p-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 mb-4 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-3xl">📁</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Course Organization</h3>
              <p className="text-white/70">
                Organize your study materials by course with drag-and-drop file upload and easy management.
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="p-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 mb-4 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Responsive Design</h3>
              <p className="text-white/70">
                Study anywhere with a mobile-first design that adapts beautifully to all screen sizes.
              </p>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-20">
            <button
              onClick={handleGetStarted}
              className="px-10 py-5 bg-linear-to-r from-purple-500 to-blue-600 text-white text-xl font-semibold rounded-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              Start Your Journey
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/80 backdrop-blur-sm border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-400" />
              <span className="text-white font-semibold text-lg">StudySync</span>
            </div>
            <p className="text-white/60 text-sm">
              © 2025 StudySync. Built with ❤️ for students.
            </p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/login')}
                className="text-white/80 hover:text-white transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
