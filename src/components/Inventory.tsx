import React, { useState, useMemo } from 'react';
import { InventoryItem, Rarity } from '../types';
import { Search, ArrowUpDown, Filter, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InventoryProps {
  items: (InventoryItem | null)[];
  onItemClick?: (item: InventoryItem, index: number) => void;
  onUseItem?: (index: number) => void;
  onSplitStack?: (index: number) => void;
}

type SortOption = 'name' | 'rarity' | 'type' | 'date' | 'quantity';

export default function Inventory({ items, onItemClick, onUseItem, onSplitStack }: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterType, setFilterType] = useState<string>('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const rarityOrder: Record<Rarity, number> = {
    'Common': 0,
    'Uncommon': 1,
    'Rare': 2,
    'Epic': 3,
    'Legendary': 4
  };

  const filteredAndSortedItems = useMemo(() => {
    // Keep track of original indices
    const indexedItems = items.map((slot, index) => ({ slot, index }));
    
    let result = indexedItems.filter(({ slot }) => {
      if (!slot) return false;
      const matchesSearch = slot.item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || slot.item.type === filterType;
      return matchesSearch && matchesType;
    });

    result.sort((a, b) => {
      const itemA = a.slot!.item;
      const itemB = b.slot!.item;

      switch (sortBy) {
        case 'name':
          return itemA.name.localeCompare(itemB.name);
        case 'rarity':
          return rarityOrder[itemB.rarity] - rarityOrder[itemA.rarity];
        case 'type':
          return itemA.type.localeCompare(itemB.type);
        case 'date':
          return b.slot!.acquiredAt - a.slot!.acquiredAt;
        case 'quantity':
          return b.slot!.quantity - a.slot!.quantity;
        default:
          return 0;
      }
    });

    return result;
  }, [items, searchTerm, sortBy, filterType]);

  const getRarityBorder = (rarity: Rarity) => {
    switch (rarity) {
      case 'Common': return 'border-gray-500/30';
      case 'Uncommon': return 'border-green-500/50';
      case 'Rare': return 'border-blue-500/60';
      case 'Epic': return 'border-purple-500/70';
      case 'Legendary': return 'border-orange-500/80 shadow-[inset_0_0_10px_rgba(255,165,0,0.2)]';
      default: return 'border-white/10';
    }
  };

  const getRarityBg = (rarity: Rarity) => {
    switch (rarity) {
      case 'Common': return 'bg-gray-500/5';
      case 'Uncommon': return 'bg-green-500/5';
      case 'Rare': return 'bg-blue-500/5';
      case 'Epic': return 'bg-purple-500/5';
      case 'Legendary': return 'bg-orange-500/5';
      default: return 'bg-white/5';
    }
  };

  return (
    <div className="pixel-card w-full max-w-2xl mx-auto !bg-[#a67c52] text-black text-[13px] font-black">
      <h2 className="font-pixel text-[13px] mb-6 text-center pixel-text-shadow !text-black">Backpack</h2>
      
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 opacity-70" size={14} />
          <input 
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#8b623d] pixel-border-inset pl-8 pr-2 py-1.5 text-[13px] font-black text-black placeholder-black/50 outline-none"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1 sm:flex-none">
            <ArrowUpDown className="absolute left-2 top-1/2 -translate-y-1/2 opacity-70" size={14} />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full bg-[#8b623d] pixel-border-inset pl-8 pr-2 py-1.5 text-[13px] font-black text-black outline-none appearance-none cursor-pointer"
            >
              <option value="date">Newest</option>
              <option value="name">Name</option>
              <option value="rarity">Rarity</option>
              <option value="type">Type</option>
              <option value="quantity">Stack Size</option>
            </select>
          </div>

          <div className="relative flex-1 sm:flex-none">
            <Filter className="absolute left-2 top-1/2 -translate-y-1/2 opacity-70" size={14} />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-[#8b623d] pixel-border-inset pl-8 pr-2 py-1.5 text-[13px] font-black text-black outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="gift">Gifts</option>
              <option value="food">Food</option>
              <option value="resource">Resources</option>
              <option value="tool">Tools</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {/* We show all 24 slots, but highlight the filtered ones */}
        {Array.from({ length: 24 }).map((_, index) => {
          const filteredItem = filteredAndSortedItems.find(fi => fi.index === index);
          const slot = items[index];

          return (
            <div 
              key={index}
              className={`aspect-square pixel-border-inset bg-[#8b623d] flex items-center justify-center cursor-pointer hover:bg-[#966d4a] transition-colors relative group
                ${filteredItem ? 'ring-2 ring-yellow-600' : slot ? 'opacity-40' : ''}
                ${slot ? getRarityBorder(slot.item.rarity) : ''}
              `}
              onClick={() => slot && onItemClick?.(slot, index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {slot ? (
                <div className={`w-full h-full flex items-center justify-center ${getRarityBg(slot.item.rarity)}`}>
                  <span className="text-2xl sm:text-3xl drop-shadow-md">{slot.item.icon}</span>
                  {slot.quantity > 1 && (
                    <span className="absolute bottom-1 right-1 font-pixel text-[10px] bg-black/80 text-white px-1 rounded border border-white/10">
                      {slot.quantity}
                    </span>
                  )}
                  
                  <AnimatePresence>
                    {hoveredIndex === index && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-52 pointer-events-auto"
                      >
                        <div className="pixel-card p-3 !bg-[#a67c52] border-black/20 shadow-2xl">
                          <div className="flex justify-between items-start mb-2 border-b border-black/10 pb-1">
                            <p className="font-pixel text-[10px] text-black leading-tight">{slot.item.name}</p>
                            <span className={`text-[8px] font-pixel px-1 py-0.5 rounded bg-black/10 ${
                              slot.item.rarity === 'Common' ? 'text-gray-700' :
                              slot.item.rarity === 'Uncommon' ? 'text-green-800' :
                              slot.item.rarity === 'Rare' ? 'text-blue-800' :
                              slot.item.rarity === 'Epic' ? 'text-purple-800' :
                              'text-orange-800'
                            }`}>
                              {slot.item.rarity}
                            </span>
                          </div>
                          
                          <p className="text-[13px] font-black text-black mb-3 leading-relaxed">
                            {slot.item.description}
                          </p>

                          {slot.item.effects && (
                            <div className="mb-3 p-1.5 bg-black/5 rounded border border-black/5">
                              <p className="text-[10px] font-pixel text-black/60 mb-1 uppercase">Effects:</p>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(slot.item.effects).map(([stat, value]) => (
                                  <span key={stat} className={`text-[11px] font-black ${Number(value) > 0 ? 'text-green-800' : 'text-red-800'}`}>
                                    {stat.toUpperCase()}: {Number(value) > 0 ? '+' : ''}{value}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center pt-2 border-t border-black/10 mb-3">
                            <span className="text-[10px] font-pixel opacity-70 text-black">{slot.item.type}</span>
                            <div className="flex items-center gap-1 text-yellow-900 font-pixel text-[10px]">
                              <Coins size={10} />
                              <span>{slot.item.value}g</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {slot.item.type === 'food' && onUseItem && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUseItem(index);
                                }}
                                className="flex-1 pixel-button py-1 text-[10px] !bg-green-600 hover:!bg-green-500 !text-white"
                              >
                                USE
                              </button>
                            )}
                            {slot.quantity > 1 && onSplitStack && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSplitStack(index);
                                }}
                                className="flex-1 pixel-button py-1 text-[10px] !bg-blue-600 hover:!bg-blue-500 !text-white"
                              >
                                SPLIT
                              </button>
                            )}
                          </div>
                        </div>
                        {/* Tooltip Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#a67c52]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="w-full h-full opacity-10 bg-black/5" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-between items-center text-[13px] text-black font-black">
        <span>Slots: {items.filter(i => i !== null).length} / 24</span>
        {searchTerm && <span>Found: {filteredAndSortedItems.length}</span>}
      </div>
    </div>
  );
}
