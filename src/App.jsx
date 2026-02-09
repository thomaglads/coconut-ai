import React, { useEffect, useState } from 'react';
import ChatInterface from './components/ChatInterface';
import VisualizationCanvas from './components/VisualizationCanvas';
import insightEngine from './services/InsightEngine';
import useAppStore from './stores/useAppStore';
import { AlertCircle } from 'lucide-react';

// Force Dark Mode 
document.documentElement.classList.add('dark');

const App = () => {
  const [isEngineReady, setEngineReady] = useState(false);
  const { error, setError } = useAppStore();

  useEffect(() => {
    const init = async () => {
      try {
        await insightEngine.initialize(null);
        // Coconut AI - Initialize Hybrid-RAG System
        // Direct Math Engine + SQL LLM for optimal performance
        setEngineReady(true);
      } catch (err) {
        console.error("Failed to start InsightEngine:", err);
        setError("Failed to initialize the AI Engine. Please restart the app.");
      }
    };
    init();
  }, [setError]);

  if (error) {
    return (
      <div className="h-screen w-screen bg-red-950 flex items-center justify-center text-red-200">
        <div className="flex flex-col items-center gap-4 p-8 bg-red-900/50 rounded-xl border border-red-800">
          <AlertCircle size={48} />
          <h1 className="text-2xl font-bold">Critical Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!isEngineReady) {
    return (
      <div className="h-screen w-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 bg-blue-900/10 radial-gradient-center"></div>

        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 shadow-2xl relative group">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
            <div className="w-12 h-12 border-2 border-blue-500/50 border-t-blue-400 rounded-full animate-spin"></div>
          </div>

          <div className="text-center">
            <h1 className="text-xl font-light text-slate-200 tracking-[0.2em] uppercase mb-2">Coconut AI</h1>
            <p className="text-xs text-slate-500 font-mono animate-pulse">Initializing Neural Core...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Left Panel: Chat & Control */}
      <ChatInterface />

      {/* Right Panel: Visualization & Data */}
      <VisualizationCanvas />
    </div>
  );
};

export default App;