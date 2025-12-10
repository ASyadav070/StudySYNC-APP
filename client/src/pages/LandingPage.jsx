import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles, Float, Text } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { Brain, Zap, Users, BookOpen, ArrowRight, Activity, Share2, FileText } from 'lucide-react';
import * as THREE from 'three';

// Neural Node Component - Represents a knowledge point
function NeuralNode({ position, color, scale = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.2;
    meshRef.current.rotation.y = Math.cos(t * 0.2) * 0.2;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
          wireframe
        />
      </mesh>
      <mesh position={position} scale={scale * 0.6}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial 
          color="white" 
          emissive="white"
          emissiveIntensity={1}
        />
      </mesh>
    </Float>
  );
}

// Connection Lines - Represents neural pathways
function Connections() {
  const points = useMemo(() => [
    new THREE.Vector3(-4, 2, -2),
    new THREE.Vector3(4, -2, -3),
    new THREE.Vector3(0, 3, -5),
    new THREE.Vector3(-3, -3, -2),
    new THREE.Vector3(3, 2, -4),
  ], []);

  return (
    <group>
      {points.map((start, i) => (
        points.map((end, j) => {
          if (i >= j) return null; // Avoid duplicate lines
          return (
            <line key={`${i}-${j}`}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([...start.toArray(), ...end.toArray()])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#6366f1" transparent opacity={0.15} />
            </line>
          );
        })
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#818cf8" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#c084fc" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={100} scale={12} size={4} speed={0.4} opacity={0.5} color="#818cf8" />
      
      <NeuralNode position={[-4, 2, -2]} color="#818cf8" scale={0.8} />
      <NeuralNode position={[4, -2, -3]} color="#c084fc" scale={0.7} />
      <NeuralNode position={[0, 3, -5]} color="#2dd4bf" scale={0.6} />
      <NeuralNode position={[-3, -3, -2]} color="#f472b6" scale={0.5} />
      <NeuralNode position={[3, 2, -4]} color="#fbbf24" scale={0.4} />
      
      <Connections />
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 2.2}
      />
    </>
  );
}

function FeatureCard({ icon: Icon, title, description, delay }) {
  return (
    <div 
      className="group p-6 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:border-indigo-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-lg hover:shadow-indigo-500/20"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 mb-4 rounded-lg bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-indigo-400 group-hover:text-indigo-300" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-screen bg-slate-950 overflow-x-hidden">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <Scene />
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-indigo-200">
              StudySync
            </span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Log In
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="px-6 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="container mx-auto px-6 pt-20 pb-32">
          <div className="max-w-4xl mx-auto text-center mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 text-sm mb-8 backdrop-blur-sm animate-fade-in-up">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Gemini AI</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
              Connect Your <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400">
                Knowledge Network
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Transform isolated study materials into a connected neural network of knowledge. 
              AI-powered summaries, smart flashcards, and intelligent group matching.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={() => navigate('/register')}
                className="group relative px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-indigo-50 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)]"
              >
                <span className="flex items-center gap-2">
                  Start Learning Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <button 
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 text-white border border-white/20 rounded-full font-medium hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Explore Features
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FeatureCard 
              icon={FileText}
              title="AI Summarization"
              description="Upload any PDF or text file. Our neural engine instantly extracts key concepts and generates concise summaries."
              delay={0}
            />
            <FeatureCard 
              icon={Zap}
              title="Smart Flashcards"
              description="Automatically generate active recall flashcards from your materials to reinforce neural pathways."
              delay={100}
            />
            <FeatureCard 
              icon={Users}
              title="Group Matching"
              description="Find study partners whose learning graphs overlap with yours. Connect based on shared topics."
              delay={200}
            />
            <FeatureCard 
              icon={Activity}
              title="Progress Tracking"
              description="Visualize your learning journey with detailed analytics and mastery tracking."
              delay={300}
            />
            <FeatureCard 
              icon={Share2}
              title="Resource Sharing"
              description="Seamlessly share notes and materials within your study groups."
              delay={400}
            />
            <FeatureCard 
              icon={BookOpen}
              title="Course Management"
              description="Organize materials by course and topic for structured learning paths."
              delay={500}
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-slate-950/50 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-indigo-400" />
                <span className="text-lg font-bold text-white">StudySync</span>
              </div>
              <p className="text-gray-500 text-sm">
                © 2025 StudySync. Neural Nexus Edition.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;