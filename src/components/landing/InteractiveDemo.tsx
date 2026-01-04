"use client";

import { useState } from 'react';
import { Sparkles, ArrowRight, AlertTriangle, CheckCircle2, Loader2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const EXAMPLES = ["Sushi", "Beef Jerky", "Kombucha", "Mayo", "Cooked Ham"];

export default function InteractiveDemo() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{hazard: string; control: string} | null>(null);

  const handleAnalyze = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    const product = typeof e === 'string' ? e : input;
    if (!product) return;

    if (typeof e === 'string') setInput(product);
    
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/generate-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product })
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Demo failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-1 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-[2.5rem] shadow-2xl">
      <div className="bg-slate-950 rounded-[2.3rem] p-8 md:p-10 space-y-8 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="text-center space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-blue-500/20">
            <Sparkles className="w-3 h-3" /> AI Live Preview
          </div>
          <h3 className="text-white text-3xl font-black tracking-tight">
            Try it right now
          </h3>
          <p className="text-slate-400 font-medium">
            Enter a product to see how our AI identifies specific hazards.
          </p>
        </div>

        <div className="space-y-4 relative z-10">
            <form onSubmit={handleAnalyze} className="relative group">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g., Cold Brew Coffee..."
                    className="w-full bg-slate-900 border-2 border-slate-800 group-focus-within:border-blue-500 text-white rounded-2xl px-6 py-5 pr-36 focus:outline-none transition-all text-lg font-medium shadow-inner"
                />
                <button
                    type="submit"
                    disabled={loading || !input}
                    className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-black transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                    {loading ? 'Analyzing' : 'Analyze'}
                </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">Quick Start:</span>
                {EXAMPLES.map(ex => (
                    <button 
                        key={ex} 
                        onClick={() => handleAnalyze(ex)}
                        className="text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg hover:border-blue-500 transition-all"
                    >
                        {ex}
                    </button>
                ))}
            </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
                key="loading"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="py-10 text-center space-y-4"
            >
                <div className="flex justify-center gap-1">
                    {[0, 1, 2].map(i => (
                        <motion.div 
                            key={i}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                            className="w-2 h-2 bg-blue-500 rounded-full"
                        />
                    ))}
                </div>
                <p className="text-blue-400 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">Scanning Bio-Hazards...</p>
            </motion.div>
          ) : result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/50 rounded-3xl p-8 border border-slate-800 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
              
              <div className="grid gap-8 relative z-10">
                <div className="space-y-3">
                  <div className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Detected Hazard
                  </div>
                  <p className="text-white text-xl font-bold leading-tight">{result.hazard}</p>
                </div>
                
                <div className="h-px bg-slate-800 w-full"></div>

                <div className="space-y-3">
                  <div className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Recommended Control
                  </div>
                  <p className="text-slate-300 text-lg font-medium leading-relaxed italic">&quot;{result.control}&quot;</p>
                </div>

                <div className="pt-4">
                    <Link 
                        href="/builder"
                        className="w-full bg-white text-slate-950 py-4 rounded-xl font-black text-center transition-all hover:bg-blue-50 flex items-center justify-center gap-2 group shadow-xl"
                    >
                        Generate Full {input} Plan
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
          The full builder analyzes 18+ data points for a complete safety system.
        </p>
      </div>
    </div>
  );
}