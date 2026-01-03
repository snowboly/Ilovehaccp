"use client";

import { useState } from 'react';
import { Sparkles, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InteractiveDemo() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{hazard: string; control: string} | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;

    setLoading(true);
    setResult(null);

    // Simulate AI delay for effect
    await new Promise(r => setTimeout(r, 1500));

    // Simple mock logic for the demo (to save API tokens for the real app)
    // In a real prod environment, you could call a lightweight API endpoint here.
    const mockResponses = [
      { hazard: "Biological: Growth of Clostridium botulinum", control: "Control water activity < 0.85 or pH < 4.6" },
      { hazard: "Biological: Salmonella survival", control: "Thermal processing (Cooking) to > 165°F" },
      { hazard: "Physical: Metal contamination", control: "Metal detection at packaging line" },
    ];
    
    setResult(mockResponses[Math.floor(Math.random() * mockResponses.length)]);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl">
      <div className="bg-slate-900 rounded-xl p-6 md:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-white text-xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="text-yellow-400" />
            Try it right now
          </h3>
          <p className="text-slate-400 text-sm">
            Enter a food product (e.g., &quot;Beef Jerky&quot;, &quot;Sushi&quot;, &quot;Ice Cream&quot;) to see a sample hazard analysis.
          </p>
        </div>

        <form onSubmit={handleAnalyze} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What are you making?"
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-4 pr-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !input}
            className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-md font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Scanning...' : 'Analyze'}
          </button>
        </form>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-lg p-4 border border-slate-700"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-amber-500 font-bold uppercase flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Potential Hazard
                  </div>
                  <p className="text-white text-sm font-medium">{result.hazard}</p>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-green-500 font-bold uppercase flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> AI Suggestion
                  </div>
                  <p className="text-white text-sm font-medium">{result.control}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <p className="text-center text-xs text-slate-500">
          *This is a demo. The full builder analyzes every step of your specific process.
        </p>
      </div>
    </div>
  );
}
