import React, { useState, useMemo } from 'react';
import { InventoryItem, Rarity } from '../types';
import { Search, ArrowUpDown, Filter, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InventoryProps {
  items: (InventoryItem | null)[];
  onItemClick?: (item: InventoryItem, index: number) => void;
}

type SortOption = 'name' | 'rarity' | 'type' | 'date';

export default function Inventory({ items, onItemClick }: InventoryProps) {
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
        default:
          return 0;
      }
    });

    return result;
  }, [items, searchTerm, sortBy, filterType]);

  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case 'Common': return 'text-gray-400';
      case 'Uncommon': return 'text-green-400';
      case 'Rare': return 'text-blue-400';
      case 'Epic': return 'text-purple-400';
      case 'Legendary': return 'text-orange-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="pixel-card w-full max-w-2xl mx-auto">
      <h2 className="font-pixel text-xs mb-6 text-center pixel-text-shadow">Backpack</h2>
      
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 opacity-50" size={14} />
          <input 
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#2c1e1e] pixel-border-inset pl-8 pr-2 py-1.5 text-[8px] outline-none"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1 sm:flex-none">
            <ArrowUpDown className="absolute left-2 top-1/2 -translate-y-1/2 opacity-50" size={14} />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full bg-[#2c1e1e] pixel-border-inset pl-8 pr-2 py-1.5 text-[8px] outline-none appearance-none cursor-pointer"
            >
              <option value="date">Newest</option>
              <option value="name">Name</option>
              <option value="rarity">Rarity</option>
              <option value="type">Type</option>
            </select>
          </div>

          <div className="relative flex-1 sm:flex-none">
            <Filter className="absolute left-2 top-1/2 -translate-y-1/2 opacity-50" size={14} />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-[#2c1e1e] pixel-border-inset pl-8 pr-2 py-1.5 text-[8px] outline-none appearance-none cursor-pointer"
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
              className={`aspect-square pixel-border-inset bg-[#3d2b2b] flex items-center justify-center cursor-pointer hover:bg-[#4a3535] transition-colors relative group
                ${filteredItem ? 'ring-1 ring-yellow-400/50' : slot ? 'opacity-40' : ''}
              `}
              onClick={() => slot && onItemClick?.(slot, index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {slot ? (
                <>
                  <span className="text-2xl sm:text-3xl">{slot.item.icon}</span>
                  {slot.quantity > 1 && (
                    <span className="absolute bottom-1 right-1 font-pixel text-[8px] bg-black/50 px-1 rounded">
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
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-48 pointer-events-none"
                      >
                        <div className="pixel-card p-3 bg-[#2c1e1e] border-white/20 shadow-2xl">
                          <div className="flex justify-between items-start mb-2 border-b border-white/10 pb-1">
                            <p className="font-pixel text-[8px] text-white leading-tight">{slot.item.name}</p>
                            <span className={`text-[6px] font-pixel px-1 py-0.5 rounded bg-black/30 ${getRarityColor(slot.item.rarity)}`}>
                              {slot.item.rarity}
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-[#f4e4bc]/80 mb-3 leading-relaxed">
                            {slot.item.description}
                          </p>
                          
                          <div className="flex justify-between items-center pt-2 border-t border-white/10">
                            <span className="text-[8px] font-pixel opacity-50">{slot.item.type}</span>
                            <div className="flex items-center gap-1 text-yellow-400 font-pixel text-[8px]">
                              <Coins size={10} />
                              <span>{slot.item.value}g</span>
                            </div>
                          </div>
                        </div>
                        {/* Tooltip Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#4a3535]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="w-full h-full opacity-5 bg-white/5" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-between items-center text-[10px] opacity-50 font-pixel">
        <span>Slots: {items.filter(i => i !== null).length} / 24</span>
        {searchTerm && <span>Found: {filteredAndSortedItems.length}</span>}
      </div>
    </div>
  );
}
