"use client";

import { Users, FileCheck, ShieldCheck, Globe, Utensils, Warehouse, Truck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrustSection() {
  const stats = [
    { label: "Plans Generated", value: "1,240+", icon: <FileCheck className="w-5 h-5 text-blue-600" /> },
    { label: "Audit Success Rate", value: "99.8%", icon: <ShieldCheck className="w-5 h-5 text-emerald-600" /> },
    { label: "Countries Supported", value: "45+", icon: <Globe className="w-5 h-5 text-indigo-600" /> },
    { label: "Time Saved/Plan", value: "12h+", icon: <Zap className="w-5 h-5 text-amber-600" /> },
  ];

  const sectors = [
    { name: "Restaurants & Cafes", icon: <Utensils className="w-4 h-4" /> },
    { name: "Food Manufacturing", icon: <Warehouse className="w-4 h-4" /> },
    { name: "Catering Services", icon: <ChefHatIcon /> },
    { name: "Logistics & Cold Chain", icon: <Truck className="w-4 h-4" /> },
  ];

  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="container mx-auto px-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="text-center space-y-2 group">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 group-hover:bg-blue-50 transition-colors mb-1">
                {stat.icon}
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Sector Labels - Subtle */}
        <div className="flex flex-col items-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-6">
            Supporting Global Food Safety Excellence
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 opacity-50 grayscale">
            {sectors.map((sector, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                {sector.icon}
                <span>{sector.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ChefHatIcon() {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <path d="M6 18h12a2 2 0 0 1 2 2v1H4v-1a2 2 0 0 1 2-2Z"/><path d="M9 18V5a4 4 0 1 1 8 0v13"/><path d="M12 18V8"/><path d="M12 8c1.5 0 3-1.5 3-3s-1.5-3-3-3-3 1.5-3 3 1.5 3 3 3Z"/>
        </svg>
    );
}
