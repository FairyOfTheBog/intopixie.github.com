import React from 'react';
import { DailyEvent } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X } from 'lucide-react';
import { sounds } from '../services/soundManager';

interface DailyEventNotificationProps {
  event: DailyEvent;
  onClose: () => void;
}

export default function DailyEventNotification({ event, onClose }: DailyEventNotificationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-md"
    >
      <div className="pixel-card !bg-[#2c1e1e] border-4 border-[#bdf3ff] p-4 shadow-2xl relative overflow-hidden">
        {/* Background Sparkles */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Sparkles className="absolute top-2 left-2 text-yellow-400 animate-pulse" size={20} />
          <Sparkles className="absolute bottom-2 right-2 text-yellow-400 animate-pulse delay-700" size={20} />
        </div>

        <button 
          onClick={() => { onClose(); sounds.playModalClose(); }}
          className="absolute top-2 right-2 text-white/50 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#bdf3ff]/20 rounded-lg flex items-center justify-center text-3xl pixelated">
            {event.icon}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-pixel text-[10px] text-yellow-400 uppercase tracking-wider">Daily Event</span>
              <div className="h-px flex-1 bg-yellow-400/20" />
            </div>
            
            <h3 className="font-pixel text-xs text-white mb-2 pixel-text-shadow">
              {event.name}
            </h3>
            
            <p className="font-pixel text-[9px] text-[#bdf3ff] leading-relaxed mb-3">
              {event.description}
            </p>

            {/* Effects Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 px-2 py-1 rounded border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="font-pixel text-[8px] text-green-300 uppercase">
                {Object.entries(event.effects).map(([key, value]) => {
                  const label = key.replace(/([A-Z])/g, ' $1').toLowerCase();
                  const sign = typeof value === 'number' && value > 0 ? '+' : '';
                  const displayValue = typeof value === 'number' ? (value < 1 ? `${value * 100}%` : value) : value;
                  return `${label}: ${sign}${displayValue}`;
                }).join(', ')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
