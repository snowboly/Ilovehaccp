"use client";

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface ProcessLogProps {
  mode: 'generating' | 'validating';
}

const GENERATION_LOGS = [
  "Initializing HACCP framework...",
  "Analyzing product inputs...",
  "Structuring process flow diagrams...",
  "Identifying biological hazards...",
  "Identifying chemical hazards...",
  "Identifying physical hazards...",
  "Mapping Critical Control Points (CCPs)...",
  "Defining critical limits...",
  "Generating monitoring procedures...",
  "Formatting professional documentation...",
  "Finalizing PDF structure..."
];

const VALIDATION_LOGS = [
  "Connecting to auditing engine...",
  "Reviewing hazard analysis consistency...",
  "Cross-referencing with Codex Alimentarius...",
  "Checking for prohibited allergens...",
  "Verifying CCP decision tree logic...",
  "Assessing monitoring frequency...",
  "Validating corrective actions...",
  "Checking regulatory compliance (EC 852/2004)...",
  "Scoring audit readiness...",
  "Compiling audit report..."
];

export function ProcessLog({ mode }: ProcessLogProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sourceLogs = mode === 'generating' ? GENERATION_LOGS : VALIDATION_LOGS;

  useEffect(() => {
    if (currentIndex >= sourceLogs.length) return;

    const timeout = setTimeout(() => {
      setLogs(prev => [...prev, sourceLogs[currentIndex]]);
      setCurrentIndex(prev => prev + 1);
    }, Math.random() * 600 + 400); // Random delay between 400ms and 1000ms

    return () => clearTimeout(timeout);
  }, [currentIndex, sourceLogs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="w-full max-w-md bg-slate-900 rounded-xl p-6 shadow-2xl border border-slate-700 font-mono text-sm">
      <div className="flex items-center gap-3 border-b border-slate-700 pb-4 mb-4">
        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
        <span className="text-blue-100 font-bold uppercase tracking-wider">
          {mode === 'generating' ? 'System Processing' : 'Auditor Active'}
        </span>
      </div>
      
      <div className="space-y-3 h-64 overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-slate-900 to-transparent z-10" />
        
        {logs.map((log, i) => (
          <div key={i} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
             <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
             <span className="text-slate-300">{log}</span>
          </div>
        ))}
        
        {currentIndex < sourceLogs.length && (
           <div className="flex items-center gap-3 opacity-50">
              <div className="w-4 h-4 rounded-full border-2 border-slate-500 border-t-transparent animate-spin shrink-0" />
              <span className="text-slate-500">Processing...</span>
           </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
