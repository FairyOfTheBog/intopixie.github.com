import React, { useState } from 'react';
import { ShopItem, GameState } from '../types';
import { SHOP_ITEMS } from '../constants';
import { Coins, X, ShoppingBag, User, Frame, Image as ImageIcon, Package, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../services/soundManager';

interface ShopProps {
  gameState: GameState;
  onPurchase: (item: ShopItem) => void;
  onClose: () => void;
}

export default function Shop({ gameState, onPurchase, onClose }: ShopProps) {
  const [activeCategory, setActiveCategory] = useState<ShopItem['type'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = SHOP_ITEMS.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.type === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isOwned = (item: ShopItem) => {
    if (item.type === 'avatar') return gameState.player.ownedAvatars.includes(item.image || '');
    if (item.type === 'border') return gameState.player.ownedBorders.includes(item.id);
    if (item.type === 'background') return gameState.player.ownedBackgrounds.includes(item.image || '');
    return false;
  };

  const handlePurchase = (item: ShopItem) => {
    if (gameState.player.money >= item.price && !isOwned(item)) {
      onPurchase(item);
      sounds.playSuccess();
    } else {
      sounds.playSelect(); // Or a fail sound if available
    }
  };

  const categories: { id: ShopItem['type'] | 'all', label: string, icon: any }[] = [
    { id: 'all', label: 'All', icon: ShoppingBag },
    { id: 'item', label: 'Items', icon: Package },
    { id: 'avatar', label: 'Avatars', icon: User },
    { id: 'border', label: 'Borders', icon: Frame },
    { id: 'background', label: 'Backgrounds', icon: ImageIcon },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="pixel-card w-full max-w-4xl max-h-[90vh] flex flex-col !bg-[#E3AD69] border-[4px] border-black shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-white px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center border-b-[3px] border-black">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <ShoppingBag className="text-black flex-shrink-0" size={20} />
            <h2 className="font-pixel text-sm sm:text-xl text-black uppercase tracking-wider truncate">Pierre's Store</h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
            <div className="flex items-center gap-1 sm:gap-2 bg-yellow-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border-2 border-yellow-600">
              <Coins className="text-yellow-600" size={16} />
              <span className="font-pixel text-sm sm:text-lg text-yellow-800">{gameState.player.money}g</span>
            </div>
            <button 
              onClick={() => { onClose(); sounds.playModalClose(); }}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors"
            >
              <X size={24} className="text-black" />
            </button>
          </div>
        </div>

        {/* Categories & Search */}
        <div className="bg-black/5 p-2 flex flex-col sm:flex-row gap-2 border-b-[2px] border-black/10">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); sounds.playSelect(); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-pixel text-[11px] transition-all whitespace-nowrap
                  ${activeCategory === cat.id 
                    ? 'bg-black text-white scale-105' 
                    : 'bg-white/50 text-black/60 hover:bg-white/80'}`}
              >
                <cat.icon size={14} />
                {cat.label}
              </button>
            ))}
          </div>
          
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={14} />
            <input 
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/50 border-2 border-black/10 rounded-lg pl-9 pr-4 py-2 font-pixel text-[11px] text-black placeholder-black/40 outline-none focus:border-black/30 transition-colors"
            />
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 custom-scrollbar">
          {filteredItems.map(item => {
            const owned = isOwned(item);
            const canAfford = gameState.player.money >= item.price;

            return (
              <div 
                key={item.id}
                className={`pixel-card p-4 flex flex-col gap-3 transition-all border-[3px] border-black
                  ${owned ? 'opacity-70 bg-black/5' : 'bg-white hover:-translate-y-1'}`}
              >
                <div className="flex gap-4 items-start">
                  <div className="w-16 h-16 bg-black/5 rounded-lg flex items-center justify-center overflow-hidden border-2 border-black/10">
                    {item.type === 'item' ? (
                      <span className="text-3xl">{item.item?.icon}</span>
                    ) : item.type === 'border' ? (
                      <div className={`w-10 h-10 border-4 rounded-lg ${item.id === 'border_gold' ? 'border-yellow-400' : 'border-purple-500 shadow-[0_0_8px_purple]'}`} />
                    ) : (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover pixelated"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-pixel text-xs text-black mb-1">{item.name}</h3>
                    <p className="text-[10px] text-black/60 leading-tight">{item.description}</p>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-3 border-t border-black/5">
                  <div className="flex items-center gap-1">
                    <Coins size={14} className="text-yellow-600" />
                    <span className="font-pixel text-xs text-yellow-800">{item.price}g</span>
                  </div>
                  <button
                    disabled={owned || !canAfford}
                    onClick={() => handlePurchase(item)}
                    className={`px-4 py-1.5 rounded font-pixel text-[10px] transition-all
                      ${owned 
                        ? 'bg-green-100 text-green-700 border-2 border-green-600 cursor-default' 
                        : !canAfford
                          ? 'bg-red-100 text-red-400 border-2 border-red-300 cursor-not-allowed'
                          : 'bg-yellow-400 text-black border-2 border-black hover:bg-yellow-300 active:scale-95'}`}
                  >
                    {owned ? 'OWNED' : 'BUY'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
