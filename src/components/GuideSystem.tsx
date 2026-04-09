import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, ChevronRight, ChevronLeft, Info, HelpCircle, Star, Heart, Zap, Coins } from 'lucide-react';
import { sounds } from '../services/soundManager';

interface GuideSystemProps {
  onClose: () => void;
}

const GUIDE_SECTIONS = [
  {
    id: 'basics',
    title: 'Game Basics',
    icon: <Info className="w-5 h-5" />,
    content: [
      {
        subtitle: 'Getting Started',
        text: 'Welcome to your new life! As a Guide, your goal is to help the community, build relationships, and manage your resources effectively.',
      },
      {
        subtitle: 'Time & Days',
        text: 'The game progresses through days. Each day brings new opportunities and events. Keep an eye on the clock!',
      },
    ],
  },
  {
    id: 'stats',
    title: 'Stats & Health',
    icon: <Star className="w-5 h-5" />,
    content: [
      {
        subtitle: 'Health',
        text: 'Your health represents your physical well-being. If it reaches zero, you might pass out! Restore it with food or rest.',
        icon: <Heart className="w-4 h-4 text-red-500" fill="red" />,
      },
      {
        subtitle: 'Energy',
        text: 'Energy is used for most actions. When energy is low, you will move slower and perform less effectively. Restore it with snacks!',
        icon: <Zap className="w-4 h-4 text-green-500" fill="#22c55e" />,
      },
      {
        subtitle: 'Strength',
        text: 'Strength determines your effectiveness in various tasks. You can increase it by completing specific quests.',
        icon: <Zap className="w-4 h-4 text-green-600" fill="#22c55e" />,
      },
    ],
  },
  {
    id: 'social',
    title: 'Social Life',
    icon: <Heart className="w-5 h-5" />,
    content: [
      {
        subtitle: 'Friendship',
        text: 'Talk to NPCs daily to build friendship. Giving gifts they love will boost your relationship significantly!',
      },
      {
        subtitle: 'Quests',
        text: 'Check the Social tab for available quests. Completing them rewards you with money, items, and friendship.',
      },
    ],
  },
  {
    id: 'economy',
    title: 'Economy',
    icon: <Coins className="w-5 h-5" />,
    content: [
      {
        subtitle: 'Earning Money',
        text: 'Complete quests and sell items from your inventory to earn gold (g).',
      },
      {
        subtitle: 'Inventory',
        text: 'Manage your items carefully. You have limited space, so choose what to keep and what to sell.',
      },
    ],
  },
];

export default function GuideSystem({ onClose }: GuideSystemProps) {
  const [activeSection, setActiveSection] = useState(0);

  const nextSection = () => {
    setActiveSection((prev) => (prev + 1) % GUIDE_SECTIONS.length);
    sounds.playSelect();
  };

  const prevSection = () => {
    setActiveSection((prev) => (prev - 1 + GUIDE_SECTIONS.length) % GUIDE_SECTIONS.length);
    sounds.playSelect();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#E3AD69] border-[10px] border-[#E36F00] rounded-[30px] p-6 w-full max-w-lg shadow-[0_4px_4px_5px_rgba(0,0,0,0.25)] relative min-h-[400px] flex flex-col"
      >
        {/* Close Button */}
        <button 
          onClick={() => { onClose(); sounds.playModalClose(); }}
          className="absolute -top-4 -right-4 w-10 h-10 bg-[#E36F00] rounded-full flex items-center justify-center text-white font-pixel text-lg hover:scale-110 transition-transform z-20 border-4 border-[#E3AD69]"
        >
          X
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 border-b-4 border-black/10 pb-4">
          <div className="bg-[#CF7E26] p-3 rounded-xl shadow-inner">
            <Book className="w-8 h-8 text-black" />
          </div>
          <div>
            <h2 className="font-pixel text-xl text-black pixel-text-shadow">ADVENTURER'S GUIDE</h2>
            <p className="font-pixel text-[10px] text-black/60">Everything you need to know</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-48 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            {GUIDE_SECTIONS.map((section, index) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(index)}
                className={`flex items-center gap-3 p-3 rounded-xl font-pixel text-[10px] transition-all text-left whitespace-nowrap md:whitespace-normal ${
                  activeSection === index 
                    ? 'bg-[#CF7E26] text-black shadow-inner border-2 border-black/10' 
                    : 'bg-black/10 text-black/60 hover:bg-black/20'
                }`}
              >
                {section.icon}
                <span>{section.title.toUpperCase()}</span>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white/30 rounded-2xl p-6 border-2 border-black/5 overflow-y-auto max-h-[300px] custom-scrollbar text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={GUIDE_SECTIONS[activeSection].id}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 flex flex-col items-center"
              >
                {GUIDE_SECTIONS[activeSection].content.map((item, idx) => (
                  <div key={idx} className="space-y-2 w-full flex flex-col items-center">
                    <div className="flex items-center justify-center gap-2">
                      {item.icon}
                      <h3 className="font-pixel text-sm text-black">{item.subtitle.toUpperCase()}</h3>
                    </div>
                    <p className="text-black/80 text-xs leading-relaxed font-pixel text-center">
                      {item.text}
                    </p>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 flex justify-between items-center">
          <button 
            onClick={prevSection}
            className="pixel-button-secondary py-2 px-4 flex items-center gap-2 text-[10px]"
          >
            <ChevronLeft className="w-4 h-4" />
            PREV
          </button>
          <div className="flex gap-2">
            {GUIDE_SECTIONS.map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeSection === index ? 'bg-[#E36F00] w-4' : 'bg-black/20'
                }`}
              />
            ))}
          </div>
          <button 
            onClick={nextSection}
            className="pixel-button-secondary py-2 px-4 flex items-center gap-2 text-[10px]"
          >
            NEXT
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
