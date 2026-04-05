import React from 'react';
import { GameState } from '../types';
import { Heart, Sword, Zap, Coins } from 'lucide-react';

interface PlayerStatusProps {
  player: any; // Using any for now as types.ts might need update, but let's see
  currentDay: number;
  onClose: () => void;
}

export default function PlayerStatus({ player, currentDay, onClose }: PlayerStatusProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#2c1e1e] border-4 border-[#bdf3ff] p-6 w-full max-w-md shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-white font-pixel text-xs hover:text-yellow-400"
        >
          X
        </button>
        <div className="flex justify-between items-center mb-8 border-b-4 border-white/10 pb-6">
          <div className="flex flex-col">
            <span className="text-gray-400 font-pixel text-[10px] mb-1">ROLE</span>
            <div className="text-yellow-400 font-pixel text-xl pixel-text-shadow tracking-tighter">{player.role}</div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-gray-400 font-pixel text-[10px] mb-1">TIME</span>
            <div className="text-white font-pixel text-xl pixel-text-shadow">DAY {currentDay}</div>
          </div>
        </div>
        
        <div className="space-y-8">
          <div className="flex items-center justify-between text-white font-pixel text-sm bg-black/20 p-3 pixel-border-inset">
            <span className="text-gray-400 text-[10px]">NAME:</span>
            <span className="text-yellow-100">{player.name}</span>
          </div>

          {/* Health Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-white font-pixel text-[10px]">
              <span className="flex items-center gap-2">
                <Heart className="w-3 h-3 text-red-500" />
                HEALTH
              </span>
              <span className="text-red-400">{player.stats.health} / {player.stats.maxHealth}</span>
            </div>
            <div className="w-full bg-black/50 h-6 pixel-border-inset relative overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 bg-gradient-to-r from-red-700 via-red-500 to-red-400 ${
                  player.stats.health === player.stats.maxHealth ? 'shadow-[0_0_20px_rgba(239,68,68,0.6)]' : ''
                }`} 
                style={{ 
                  width: `${(player.stats.health / player.stats.maxHealth) * 100}%`,
                  boxShadow: player.stats.health === player.stats.maxHealth ? 'inset 0 0 10px rgba(255,255,255,0.4), 0 0 15px rgba(239,68,68,0.8)' : 'inset 0 0 10px rgba(255,255,255,0.2)'
                }}
              />
            </div>
          </div>

          {/* Energy Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-white font-pixel text-[10px]">
              <span className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-400" />
                ENERGY
              </span>
              <span className="text-yellow-400">{player.stats.energy} / {player.stats.maxEnergy}</span>
            </div>
            <div className="w-full bg-black/50 h-6 pixel-border-inset relative overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-200 ${
                  player.stats.energy === player.stats.maxEnergy ? 'shadow-[0_0_20px_rgba(250,204,21,0.6)]' : ''
                }`} 
                style={{ 
                  width: `${(player.stats.energy / player.stats.maxEnergy) * 100}%`,
                  boxShadow: player.stats.energy === player.stats.maxEnergy ? 'inset 0 0 10px rgba(255,255,255,0.4), 0 0 15px rgba(250,204,21,0.8)' : 'inset 0 0 10px rgba(255,255,255,0.2)'
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 bg-black/20 p-3 pixel-border-inset">
              <span className="text-gray-400 font-pixel text-[8px]">ATTACK</span>
              <div className="flex items-center gap-2 text-white font-pixel text-sm">
                <Sword className="w-4 h-4 text-gray-400" />
                {player.stats.attack}
              </div>
            </div>
            <div className="flex flex-col gap-2 bg-black/20 p-3 pixel-border-inset">
              <span className="text-gray-400 font-pixel text-[8px]">MONEY</span>
              <div className="flex items-center gap-2 text-yellow-400 font-pixel text-sm">
                <Coins className="w-4 h-4" />
                {player.money}g
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
