import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Brain, MessageCircle, Users, ArrowRight, Sparkles, CheckCircle2, Zap, BookOpen, Share2 } from 'lucide-react';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const TestimonialCard = ({ name, role, quote, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:border-purple-500/30 transition-colors"
  >
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
        {name.charAt(0)}
      </div>
      <div>
        <h4 className="text-white font-semibold">{name}</h4>
        <p className="text-slate-400 text-sm">{role}</p>
      </div>
    </div>
    <p className="text-slate-300 italic">"{quote}"</p>
  </motion.div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden selection:bg-purple-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">StudySync</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all backdrop-blur-sm"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 pb-32">
        
        {/* Hero Section */}
        <div className="text-center max-w-5xl mx-auto mb-32 relative">
          {/* Floating Elements (Abstract Shapes) */}
          <motion.div 
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl hidden md:block"
          />
          <motion.div 
            animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-40 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl hidden md:block"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
              The all-in-one study platform <br />
              <span className="animate-pulse bg-linear-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent bg-size-[200%_auto]">
                for students of one.
              </span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl md:text-2xl text-slate-400 font-light mb-10 max-w-2xl mx-auto"
          >
            Join thousands of students who use StudySync to run their academic life, organize notes, and ace exams.
          </motion.p>

          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            className="group relative px-8 py-4 bg-white text-slate-950 rounded-full font-bold text-lg overflow-hidden shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Learning Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-linear-to-r from-purple-200 to-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
          </motion.button>
        </div>

        {/* Social Proof Section */}
        <div className="w-full max-w-7xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Their grades finally found a home. <br />
              <span className="text-slate-400">So can yours.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TestimonialCard 
              name="Sarah J." 
              role="Medical Student" 
              quote="StudySync transformed how I prepare for anatomy exams. The AI summaries are a lifesaver."
              delay={0}
            />
            <TestimonialCard 
              name="Michael C." 
              role="Computer Science" 
              quote="Finding a study group used to be impossible. Now I code with peers every night."
              delay={0.1}
            />
            <TestimonialCard 
              name="Emily R." 
              role="Law Student" 
              quote="The flashcard generation feature saves me hours of manual typing. Highly recommended!"
              delay={0.2}
            />
            <TestimonialCard 
              name="David K." 
              role="History Major" 
              quote="Finally, an app that keeps all my research papers and notes in one organized place."
              delay={0.3}
            />
          </div>
        </div>

        {/* Feature Deep Dive 1: AI Summaries */}
        <div className="w-full max-w-7xl mx-auto mb-32 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 bg-white/5 rounded-3xl p-8 border border-white/10 h-[400px] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Brain className="w-32 h-32 text-purple-400 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="flex-1 space-y-6">
            <span className="text-purple-400 font-semibold tracking-wider text-sm uppercase">AI-Powered Learning</span>
            <h2 className="text-4xl font-bold">Study without limits.</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Don't settle for skimming. Upload any PDF or document and let our Gemini AI engine extract the key concepts, summaries, and action items instantly.
            </p>
          </div>
        </div>

        {/* Feature Deep Dive 2: Flashcards (Reversed) */}
        <div className="w-full max-w-7xl mx-auto mb-32 flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1 bg-white/5 rounded-3xl p-8 border border-white/10 h-[400px] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-bl from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Zap className="w-32 h-32 text-blue-400 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="flex-1 space-y-6">
            <span className="text-blue-400 font-semibold tracking-wider text-sm uppercase">Active Recall</span>
            <h2 className="text-4xl font-bold">Master any subject.</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Turn your summaries into interactive flashcards with a single click. Test your knowledge with spaced repetition and track your mastery over time.
            </p>
          </div>
        </div>

        {/* Feature Deep Dive 3: Group Matching */}
        <div className="w-full max-w-7xl mx-auto mb-32 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 bg-white/5 rounded-3xl p-8 border border-white/10 h-[400px] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Users className="w-32 h-32 text-pink-400 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="flex-1 space-y-6">
            <span className="text-pink-400 font-semibold tracking-wider text-sm uppercase">Community</span>
            <h2 className="text-4xl font-bold">Find your study tribe.</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Learning is better together. Our smart matching algorithm connects you with peers studying the same material, so you never have to study alone again.
            </p>
          </div>
        </div>

        {/* Checklist Section */}
        <div className="w-full max-w-7xl mx-auto mb-32 bg-slate-900/50 rounded-3xl p-12 border border-white/5">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Everything you need to ace your exams, <br />
              <span className="text-slate-400">right out of the box.</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {[
                "AI-Powered Summarization",
                "Real-time Collaboration",
                "Interactive Flashcards",
                "Smart Group Matching",
                "PDF & Document Support",
                "Secure Private Chat",
                "Mobile Responsive Design",
                "Cloud Storage"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Studying is much simpler when <br />
            everything is in one place.
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            See for yourself. Join StudySync today.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-10 py-4 bg-white text-slate-950 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-2xl shadow-white/10"
          >
            Get started
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-950/50 backdrop-blur-xl py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-slate-400" />
            <span className="text-lg font-bold text-slate-300">StudySync</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <p>© 2025 StudySync Labs, Inc.</p>
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
