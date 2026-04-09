import React from 'react';
import { GameState } from '../types';
import { Heart, Sword, Zap, Coins } from 'lucide-react';
import { sounds } from '../services/soundManager';

interface PlayerStatusProps {
  player: any;
  currentDay: number;
  onClose: () => void;
  onUpdatePlayer: (updates: any) => void;
}

export default function PlayerStatus({ player, currentDay, onClose, onUpdatePlayer }: PlayerStatusProps) {
  const [activeTab, setActiveTab] = React.useState<'stats' | 'cosmetics'>('stats');

  const handleEquipAvatar = (avatar: string) => {
    onUpdatePlayer({ appearance: { ...player.appearance, avatar } });
    sounds.playSelect();
  };

  const handleEquipBorder = (borderId: string) => {
    onUpdatePlayer({ currentBorder: borderId });
    sounds.playSelect();
  };

  const handleEquipBackground = (bgImage: string) => {
    onUpdatePlayer({ currentBackground: bgImage });
    sounds.playSelect();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-[#E3AD69] border-[10px] border-[#E36F00] rounded-[30px] p-6 w-full max-w-lg shadow-[0_4px_4px_5px_rgba(0,0,0,0.25)] relative">
        <button 
          onClick={() => { onClose(); sounds.playModalClose(); }}
          className="absolute -top-4 -right-4 w-10 h-10 bg-[#E36F00] rounded-full flex items-center justify-center text-white font-pixel text-lg hover:scale-110 transition-transform z-20 border-4 border-[#E3AD69]"
        >
          X
        </button>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b-4 border-black/10 pb-2">
          <button
            onClick={() => { setActiveTab('stats'); sounds.playSelect(); }}
            className={`px-4 py-2 font-pixel text-xs rounded-t-lg transition-all
              ${activeTab === 'stats' ? 'bg-black text-white' : 'bg-white/30 text-black hover:bg-white/50'}`}
          >
            STATS
          </button>
          <button
            onClick={() => { setActiveTab('cosmetics'); sounds.playSelect(); }}
            className={`px-4 py-2 font-pixel text-xs rounded-t-lg transition-all
              ${activeTab === 'cosmetics' ? 'bg-black text-white' : 'bg-white/30 text-black hover:bg-white/50'}`}
          >
            COSMETICS
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
          {activeTab === 'stats' ? (
            <div className="space-y-6">
              <div className="flex justify-start items-start mb-6 border-b-4 border-black/10 pb-4">
                <div className="relative w-[100px] h-[100px] flex-shrink-0 flex items-center justify-center">
                  <div className={`avatar flex-shrink-0 relative ${player.currentBorder === 'border_gold' ? 'ring-4 ring-yellow-400' : player.currentBorder === 'border_magic' ? 'ring-4 ring-purple-500 shadow-[0_0_15px_purple]' : ''}`}>
                    <img 
                      src={player.appearance.avatar} 
                      alt="Player Avatar" 
                      className="w-full h-full object-cover pixelated" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                </div>
                <div className="ml-6 flex-1">
                  <div className="flex items-center justify-between text-black font-pixel text-sm bg-[#CF7E26] rounded-[12px] p-3 shadow-inner mb-2">
                    <span className="text-black/60 text-[10px]">PLAYER:</span>
                    <span className="text-black">{player.name}</span>
                  </div>
                </div>
              </div>
              
              {/* Health Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-black font-pixel text-[10px]">
                  <span className="flex items-center gap-2">
                    <Heart className="w-3 h-3 text-red-600" fill="red" />
                    HEALTH
                  </span>
                  <span className="text-red-800">{player.stats.health} / {player.stats.maxHealth}</span>
                </div>
                <div className="w-full bg-black/20 h-6 rounded-lg relative overflow-hidden border-2 border-black/10">
                  <div 
                    className={`h-full transition-all duration-500 bg-gradient-to-r from-red-700 via-red-500 to-red-400`} 
                    style={{ 
                      width: `${(player.stats.health / player.stats.maxHealth) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Energy Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-black font-pixel text-[10px]">
                  <span className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-green-600" fill="#22c55e" />
                    ENERGY
                  </span>
                  <span className="text-green-800">{player.stats.energy} / {player.stats.maxEnergy}</span>
                </div>
                <div className="w-full bg-black/20 h-6 rounded-lg relative overflow-hidden border-2 border-black/10">
                  <div 
                    className={`h-full transition-all duration-500 bg-gradient-to-r from-green-700 via-green-500 to-green-400`} 
                    style={{ 
                      width: `${(player.stats.energy / player.stats.maxEnergy) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 bg-black/10 p-3 rounded-xl">
                  <span className="text-black/60 font-pixel text-[8px]">STRENGTH</span>
                  <div className="flex items-center gap-2 text-black font-pixel text-sm">
                    <Zap className="w-4 h-4 text-green-600" fill="#22c55e" />
                    {player.stats.attack}
                  </div>
                </div>
                <div className="flex flex-col gap-2 bg-black/10 p-3 rounded-xl">
                  <span className="text-black/60 font-pixel text-[8px]">MONEY</span>
                  <div className="flex items-center gap-2 text-black font-pixel text-sm">
                    <Coins className="w-4 h-4 text-yellow-700" />
                    {player.money}g
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Avatars */}
              <section>
                <h3 className="font-pixel text-[10px] text-black/60 mb-3 uppercase">Owned Avatars</h3>
                <div className="grid grid-cols-4 gap-3">
                  {player.ownedAvatars.map((avatar: string) => (
                    <button
                      key={avatar}
                      onClick={() => handleEquipAvatar(avatar)}
                      className={`aspect-square rounded-lg overflow-hidden border-4 transition-all hover:scale-105
                        ${player.appearance.avatar === avatar ? 'border-yellow-400 scale-110' : 'border-black/10 hover:border-black/30'}`}
                    >
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover pixelated" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </section>

              {/* Borders */}
              <section>
                <h3 className="font-pixel text-[10px] text-black/60 mb-3 uppercase">Owned Borders</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleEquipBorder('')}
                    className={`px-4 py-2 font-pixel text-[10px] rounded-lg border-2 transition-all
                      ${!player.currentBorder ? 'bg-black text-white border-black' : 'bg-white/30 text-black border-black/10'}`}
                  >
                    NONE
                  </button>
                  {player.ownedBorders.map((borderId: string) => (
                    <button
                      key={borderId}
                      onClick={() => handleEquipBorder(borderId)}
                      className={`px-4 py-2 font-pixel text-[10px] rounded-lg border-2 transition-all
                        ${player.currentBorder === borderId ? 'bg-black text-white border-black' : 'bg-white/30 text-black border-black/10'}`}
                    >
                      {borderId.replace('border_', '').toUpperCase()}
                    </button>
                  ))}
                </div>
              </section>

              {/* Backgrounds */}
              <section>
                <h3 className="font-pixel text-[10px] text-black/60 mb-3 uppercase">Owned Backgrounds</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleEquipBackground('')}
                    className={`h-20 font-pixel text-[10px] rounded-lg border-2 transition-all flex items-center justify-center
                      ${!player.currentBackground ? 'bg-black text-white border-black' : 'bg-white/30 text-black border-black/10'}`}
                  >
                    DEFAULT
                  </button>
                  {player.ownedBackgrounds.map((bg: string) => (
                    <button
                      key={bg}
                      onClick={() => handleEquipBackground(bg)}
                      className={`h-20 rounded-lg overflow-hidden border-2 transition-all relative
                        ${player.currentBackground === bg ? 'border-yellow-400 ring-2 ring-yellow-400' : 'border-black/10'}`}
                    >
                      <img src={bg} alt="Background" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="font-pixel text-[8px] text-white pixel-text-shadow">SELECT</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
