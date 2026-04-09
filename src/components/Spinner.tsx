import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState, Item } from '../types';
import { ITEMS } from '../constants';
import { X, Sparkles, Trophy, Coins, Gift } from 'lucide-react';
import { sounds } from '../services/soundManager';

interface SpinnerProps {
  gameState: GameState;
  onReward: (reward: { type: 'item' | 'money', value: any, cost?: number }) => void;
  onClose: () => void;
}

const SPINNER_REWARDS = [
  { type: 'item', value: ITEMS.find(i => i.id === 'diamond'), weight: 10, img: 'https://github.com/FairyOfTheBog/myimgsources/blob/main/Diamond.png?raw=true' },
  { type: 'item', value: ITEMS.find(i => i.id === 'frozen_tear'), weight: 15, img: 'https://github.com/FairyOfTheBog/myimgsources/blob/main/Frozen_Tear.png?raw=true' },
  { type: 'item', value: ITEMS.find(i => i.id === 'lucky_lunch'), weight: 15, img: 'https://github.com/FairyOfTheBog/myimgsources/blob/main/Lucky_Lunch.png?raw=true' },
  { type: 'item', value: ITEMS.find(i => i.id === 'pizza'), weight: 15, img: 'https://github.com/FairyOfTheBog/myimgsources/blob/main/Pizza.png?raw=true' },
  { type: 'item', value: ITEMS.find(i => i.id === 'prismatic_shard'), weight: 5, img: 'https://github.com/FairyOfTheBog/myimgsources/blob/main/Prismatic_Shard.png?raw=true' },
  { type: 'item', value: ITEMS.find(i => i.id === 'quartz'), weight: 15, img: 'https://github.com/FairyOfTheBog/myimgsources/blob/main/Quartz.png?raw=true' },
  { type: 'item', value: ITEMS.find(i => i.id === 'coffee'), weight: 20, img: 'https://github.com/FairyOfTheBog/myimgsources/blob/main/Coffee.png?raw=true' },
  { type: 'money', value: 10000, weight: 0.000475, img: 'https://github.com/FairyOfTheBog/myimgsources/blob/main/coins.png?raw=true' },
];

const SPIN_COST = 500;

export default function Spinner({ gameState, onReward, onClose }: SpinnerProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [reward, setReward] = useState<any>(null);
  const [showReward, setShowReward] = useState(false);

  // Randomize the visual order of items on the wheel
  const displayRewards = React.useMemo(() => {
    return [...SPINNER_REWARDS].sort(() => Math.random() - 0.5);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const dailySpinsUsed = gameState.lastSpinDate === today ? (gameState.spinCount || 0) : 0;
  const freeSpinsLeft = Math.max(0, 3 - dailySpinsUsed);
  const canSpin = freeSpinsLeft > 0 || gameState.player.money >= SPIN_COST;

  useEffect(() => {
    if (isSpinning) {
      const interval = setInterval(() => {
        sounds.playSpinTick();
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isSpinning]);

  const handleSpin = () => {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);
    sounds.playSelect();

    // Calculate random reward based on weights
    const totalWeight = displayRewards.reduce((acc, curr) => acc + curr.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;
    
    for (let i = 0; i < displayRewards.length; i++) {
      if (random < displayRewards[i].weight) {
        selectedIndex = i;
        break;
      }
      random -= displayRewards[i].weight;
    }

    const selectedReward = displayRewards[selectedIndex];
    
    // Calculate rotation: multiple full spins + offset to the selected item
    const itemDegrees = 360 / displayRewards.length;
    const extraSpins = 5 + Math.floor(Math.random() * 5);
    
    // We want the final rotation to be such that the selected item is under the pointer (at the top)
    const targetRotation = rotation + (extraSpins * 360) - (selectedIndex * itemDegrees + itemDegrees / 2);
    
    setRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setReward({ ...selectedReward, cost: freeSpinsLeft > 0 ? 0 : SPIN_COST });
      setShowReward(true);
      sounds.playSuccess();
    }, 4000);
  };

  const claimReward = () => {
    if (reward) {
      onReward(reward);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#E3AD69] border-[10px] border-[#E36F00] rounded-[30px] p-6 w-full max-w-md shadow-[0_4px_4px_5px_rgba(0,0,0,0.25)] relative flex flex-col items-center"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 w-10 h-10 bg-[#E36F00] rounded-full flex items-center justify-center text-white font-pixel text-lg hover:scale-110 transition-transform z-[120] border-4 border-[#E3AD69]"
        >
          X
        </button>

        {/* Header */}
        <div className="w-full flex justify-center items-center mb-8 border-b-4 border-black/10 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-yellow-600" size={20} />
            <h2 className="font-pixel text-xl text-black uppercase tracking-wider">Daily Spin</h2>
            <Sparkles className="text-yellow-600" size={20} />
          </div>
        </div>

        {/* Spinner Wheel */}
        <div className="relative w-64 h-64 mb-8">
          {/* Pointer */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 w-6 h-8 bg-yellow-400 border-2 border-black" 
               style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }} />
          
          {/* The Wheel */}
          <motion.div 
            className="w-full h-full rounded-full border-8 border-black relative overflow-hidden shadow-2xl"
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.15, 0, 0.15, 1] }}
            style={{ 
              background: `conic-gradient(
                #ef4444 0deg 45deg, 
                #ffffff 45deg 90deg, 
                #ef4444 90deg 135deg, 
                #ffffff 135deg 180deg, 
                #ef4444 180deg 225deg, 
                #ffffff 225deg 270deg, 
                #ef4444 270deg 315deg, 
                #ffffff 315deg 360deg
              )` 
            }}
          >
            {displayRewards.map((item, i) => (
              <div 
                key={i}
                className="absolute top-0 left-1/2 h-1/2 origin-bottom flex flex-col items-center pt-4 w-16"
                style={{ transform: `translateX(-50%) rotate(${i * 45 + 22.5}deg)` }}
              >
                <img 
                  src={item.img} 
                  alt="Reward" 
                  className="w-12 h-12 object-contain pixelated drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"
                  style={{ transform: `rotate(${-(i * 45 + 22.5)}deg)` }}
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </motion.div>

          {/* Center Hub */}
          <div className="absolute inset-0 m-auto w-12 h-12 bg-white rounded-full border-4 border-black z-10 flex items-center justify-center shadow-lg">
            <Trophy size={20} className="text-yellow-600" />
          </div>
        </div>

        {/* Spin Button */}
        <button
          disabled={!canSpin || isSpinning}
          onClick={handleSpin}
          className={`w-full py-4 rounded-xl font-pixel text-sm transition-all border-b-4 active:border-b-0 active:translate-y-1
            ${!canSpin 
              ? 'bg-black/20 border-black/40 text-black/40 cursor-not-allowed' 
              : isSpinning
                ? 'bg-yellow-600 border-yellow-800 text-white cursor-wait'
                : 'bg-yellow-400 border-yellow-600 text-yellow-900 hover:bg-yellow-300'}`}
        >
          {isSpinning ? 'SPINNING...' : freeSpinsLeft > 0 ? `SPIN FOR FREE! (${freeSpinsLeft} left)` : `SPIN FOR ${SPIN_COST}g`}
        </button>

        <div className="mt-4 flex flex-col items-center gap-1">
          <p className="font-pixel text-[10px] text-black/60 uppercase tracking-widest text-center">
            Free spins reset daily
          </p>
          {freeSpinsLeft === 0 && (
            <div className="flex items-center gap-1 text-yellow-800 font-pixel text-[10px]">
              <Coins size={10} />
              <span>Balance: {gameState.player.money}g</span>
            </div>
          )}
        </div>

        {/* Reward Modal */}
        <AnimatePresence>
          {showReward && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-[110] bg-black/90 flex flex-col items-center justify-center p-6 text-center rounded-[20px]"
            >
              <motion.div
                initial={{ scale: 0.5, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="flex flex-col items-center"
              >
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center p-4 mb-6 animate-bounce">
                  <img 
                    src={reward.img} 
                    alt="Reward" 
                    className="w-full h-full object-contain pixelated"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-pixel text-xl text-white mb-2 pixel-text-shadow">YOU WON!</h3>
                <p className="font-pixel text-sm text-yellow-400 mb-8">
                  {reward.type === 'item' ? reward.value.name : `${reward.value}g`}
                </p>
                <button
                  onClick={claimReward}
                  className="pixel-button-primary px-8 py-3 !bg-green-500 hover:!bg-green-400 border-black"
                >
                  CLAIM REWARD
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
