import React, { useState, useEffect } from 'react';
import { GameState, CharacterMakerState, Gender, NPC, InventoryItem, Item, ShopItem } from './types';
import { ITEMS, NPCS, SKIN_COLORS, HAIR_COLORS, INITIAL_QUESTS, OUTFITS, HAIR_STYLES, DAILY_EVENTS, AVATARS, SHOP_ITEMS } from './constants';
import CharacterMaker from './components/CharacterMaker';
import Inventory from './components/Inventory';
import Social from './components/Social';
import LoadingPage from './components/LoadingPage';
import PlayerStatus from './components/PlayerStatus';
import GuideSystem from './components/GuideSystem';
import Shop from './components/Shop';
import DailyEventNotification from './components/DailyEventNotification';
import Spinner from './components/Spinner';
import { Coins, Settings, Heart, Clock, Book, ShoppingBag, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storageService } from './services/storageService';
import confetti from 'canvas-confetti';
import { sounds } from './services/soundManager';

const INITIAL_STATE: GameState = {
  player: {
    name: '',
    gender: 'Male',
    role: 'Guide',
    stats: {
      health: 100,
      maxHealth: 100,
      attack: 10,
      energy: 100,
      maxEnergy: 100,
    },
    appearance: {
      skin: SKIN_COLORS[0],
      hair: HAIR_STYLES[0],
      hairColor: HAIR_COLORS[0],
      outfit: OUTFITS[0],
      accessory: 'None',
      avatar: AVATARS[0],
    },
    inventory: Array(24).fill(null),
    money: 500,
    recipes: [],
    level: 1,
    experience: 0,
    maxExperience: 100,
    ownedAvatars: [AVATARS[0]],
    ownedBorders: [],
    ownedBackgrounds: [],
  },
  npcs: NPCS.map(npc => ({ ...npc, lastInteractionDay: 1 })),
  quests: INITIAL_QUESTS,
  hasCreatedCharacter: false,
  currentDay: 1,
  currentTime: 360,
  currentDailyEvent: null,
  friendships: {},
  triggeredEvents: [],
  chatHistories: {},
};

INITIAL_STATE.player.inventory[0] = { item: ITEMS[0], quantity: 5, acquiredAt: Date.now() };
INITIAL_STATE.player.inventory[1] = { item: ITEMS[1], quantity: 2, acquiredAt: Date.now() };
INITIAL_STATE.player.inventory[2] = { item: ITEMS[6], quantity: 1, acquiredAt: Date.now() };

export default function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<'home' | 'social' | 'inventory' | 'quests'>('home');
  const [page, setPage] = useState<'loading' | 'characterCreation' | 'dashboard'>('loading');
  const [showPlayerStatus, setShowPlayerStatus] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showCredits, setShowCredits] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [showEventNotification, setShowEventNotification] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [questSortBy, setQuestSortBy] = useState<'dueDate' | 'type' | 'giver'>('dueDate');

  const showToast = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(null), 2000);
  };

  useEffect(() => {
    const savedState = storageService.loadGame();
    if (savedState) {
      setGameState({
        ...INITIAL_STATE,
        ...savedState,
        player: {
          ...INITIAL_STATE.player,
          ...savedState.player,
          appearance: {
            ...INITIAL_STATE.player.appearance,
            ...savedState.player.appearance
          },
          stats: {
            ...INITIAL_STATE.player.stats,
            ...savedState.player.stats
          },
          level: savedState.player.level || 1,
          experience: savedState.player.experience || 0,
          maxExperience: savedState.player.maxExperience || 100,
          ownedAvatars: savedState.player.ownedAvatars || [AVATARS[0]],
          ownedBorders: savedState.player.ownedBorders || [],
          ownedBackgrounds: savedState.player.ownedBackgrounds || [],
          currentBorder: savedState.player.currentBorder,
          currentBackground: savedState.player.currentBackground,
        },
        currentDay: savedState.currentDay || 1,
        currentTime: savedState.currentTime || 360,
        quests: savedState.quests || INITIAL_QUESTS,
        currentDailyEvent: savedState.currentDailyEvent || null,
        chatHistories: savedState.chatHistories || {}
      });
    }
  }, []);

  useEffect(() => {
    if (page !== 'dashboard') return;
    const timer = setInterval(() => {
      setGameState(prev => {
        let nextTime = prev.currentTime + 10;
        if (nextTime >= 1560) {
          handleNextDay();
          return prev;
        }
        return { ...prev, currentTime: nextTime };
      });
    }, 7000);
    return () => clearInterval(timer);
  }, [page]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  const getCalendarDate = (totalDays: number) => {
    const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
    const seasonIndex = Math.floor((totalDays - 1) / 28) % 4;
    const dayOfSeason = ((totalDays - 1) % 28) + 1;
    const year = Math.floor((totalDays - 1) / 112) + 1;
    return { season: seasons[seasonIndex], day: dayOfSeason, year };
  };

  const finishCharacterCreation = () => {
    const updatedState = { ...gameState, hasCreatedCharacter: true };
    setGameState(updatedState);
    storageService.saveGame(updatedState);
    setPage('dashboard');
  };

  const handleSave = () => {
    const success = storageService.saveGame(gameState);
    if (success) {
      showToast('Game Saved!');
      sounds.playSuccess();
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    } else {
      showToast('Save Failed!');
    }
  };

  const handleLoad = () => {
    const savedState = storageService.loadGame();
    if (savedState) {
      setGameState(savedState);
      showToast('Game Loaded!');
      sounds.playSuccess();
    } else {
      showToast('No Save Found!');
    }
  };

  const handleReset = () => {
    storageService.clearSave();
    window.location.reload();
  };

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    sounds.playSelect();
  };

  const updateNPC = (npcId: string, updates: Partial<NPC>) => {
    setGameState(prev => ({
      ...prev,
      npcs: prev.npcs.map(npc => npc.id === npcId ? { ...npc, ...updates } : npc)
    }));
  };

  const addItem = (item: Item, amount: number = 1) => {
    setGameState(prev => {
      const newInventory = [...prev.player.inventory];
      const existingSlotIndex = newInventory.findIndex(slot => slot?.item.id === item.id);
      if (existingSlotIndex !== -1) {
        newInventory[existingSlotIndex] = {
          ...newInventory[existingSlotIndex]!,
          quantity: newInventory[existingSlotIndex]!.quantity + amount
        };
      } else {
        const emptySlotIndex = newInventory.findIndex(slot => slot === null);
        if (emptySlotIndex !== -1) {
          newInventory[emptySlotIndex] = { item, quantity: amount, acquiredAt: Date.now() };
        } else {
          console.warn('Inventory full!');
          return prev;
        }
      }
      return { ...prev, player: { ...prev.player, inventory: newInventory } };
    });
  };

  const removeItem = (index: number, amount: number = 1) => {
    setGameState(prev => {
      const newInventory = [...prev.player.inventory];
      const slot = newInventory[index];
      if (slot) {
        if (slot.quantity > amount) {
          newInventory[index] = { ...slot, quantity: slot.quantity - amount };
        } else {
          newInventory[index] = null;
        }
      }
      return { ...prev, player: { ...prev.player, inventory: newInventory } };
    });
  };

  const handleReward = (money: number) => {
    setGameState(prev => ({
      ...prev,
      player: { ...prev.player, money: prev.player.money + money }
    }));
  };

  const triggerEvent = (eventId: string) => {
    setGameState(prev => ({
      ...prev,
      triggeredEvents: [...prev.triggeredEvents, eventId]
    }));
  };

  const recordInteraction = (npcId: string) => {
    setGameState(prev => ({
      ...prev,
      npcs: prev.npcs.map(npc =>
        npc.id === npcId ? { ...npc, lastInteractionDay: prev.currentDay } : npc
      )
    }));
  };

  const acceptQuest = (questId: string) => {
    setGameState(prev => ({
      ...prev,
      quests: (prev.quests || []).map(q => q.id === questId ? { ...q, status: 'active' as const } : q)
    }));
    sounds.playSelect();
  };

  const gainExperience = (amount: number) => {
    setGameState(prev => {
      let newExp = prev.player.experience + amount;
      let newLevel = prev.player.level;
      let newMaxExp = prev.player.maxExperience;
      let newStats = { ...prev.player.stats };

      while (newExp >= newMaxExp) {
        newExp -= newMaxExp;
        newLevel++;
        newMaxExp = Math.floor(newMaxExp * 1.5);
        // Level up rewards
        newStats.maxHealth += 20;
        newStats.health = newStats.maxHealth;
        newStats.maxEnergy += 20;
        newStats.energy = newStats.maxEnergy;
        newStats.attack += 5;
        
        showToast(`Level Up! Reached Level ${newLevel}`);
        sounds.playSuccess();
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#60a5fa', '#93c5fd']
        });
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          level: newLevel,
          experience: newExp,
          maxExperience: newMaxExp,
          stats: newStats
        }
      };
    });
  };

  const completeQuest = (questId: string) => {
    setGameState(prev => {
      const quest = (prev.quests || []).find(q => q.id === questId);
      if (!quest || quest.status !== 'active') return prev;

      if (quest.type === 'delivery' && quest.targetItemId) {
        const inventoryItem = prev.player.inventory.find(slot => slot?.item.id === quest.targetItemId);
        if (!inventoryItem || inventoryItem.quantity < (quest.targetQuantity || 1)) {
          return prev;
        }
      }

      const newQuests = (prev.quests || []).map(q => q.id === questId ? { ...q, status: 'completed' as const } : q);
      const newMoney = prev.player.money + (quest.rewardMoney || 0);
      const xpReward = 50 + (quest.rewardMoney || 0) / 2; // Basic XP reward logic
      
      const newNpcs = prev.npcs.map(npc => {
        if (npc.id === quest.giverId) {
          return { ...npc, friendship: Math.min(2500, npc.friendship + (quest.rewardFriendship || 0)) };
        }
        return npc;
      });

      let newInventory = [...prev.player.inventory];

      if (quest.type === 'delivery' && quest.targetItemId) {
        const itemIndex = newInventory.findIndex(slot => slot?.item.id === quest.targetItemId);
        if (itemIndex !== -1) {
          const slot = newInventory[itemIndex]!;
          if (slot.quantity > (quest.targetQuantity || 1)) {
            newInventory[itemIndex] = { ...slot, quantity: slot.quantity - (quest.targetQuantity || 1) };
          } else {
            newInventory[itemIndex] = null;
          }
        }
      }

      if (quest.rewardItem) {
        const existingSlotIndex = newInventory.findIndex(slot => slot?.item.id === quest.rewardItem?.id);
        if (existingSlotIndex !== -1) {
          newInventory[existingSlotIndex] = {
            ...newInventory[existingSlotIndex]!,
            quantity: newInventory[existingSlotIndex]!.quantity + 1
          };
        } else {
          const emptySlotIndex = newInventory.findIndex(slot => slot === null);
          if (emptySlotIndex !== -1) {
            newInventory[emptySlotIndex] = { item: quest.rewardItem, quantity: 1, acquiredAt: Date.now() };
          }
        }
      }

      const newStats = { ...prev.player.stats };
      if (quest.rewardStats) {
        if (quest.rewardStats.maxHealth) newStats.maxHealth += quest.rewardStats.maxHealth;
        if (quest.rewardStats.health) newStats.health += quest.rewardStats.health;
        if (quest.rewardStats.attack) newStats.attack += quest.rewardStats.attack;
        if (quest.rewardStats.maxEnergy) newStats.maxEnergy += quest.rewardStats.maxEnergy;
        if (quest.rewardStats.energy) newStats.energy += quest.rewardStats.energy;
      }

      const newRecipes = [...(prev.player.recipes || [])];
      if (quest.rewardRecipe && !newRecipes.includes(quest.rewardRecipe)) {
        newRecipes.push(quest.rewardRecipe);
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          money: newMoney,
          inventory: newInventory,
          stats: newStats,
          recipes: newRecipes
        },
        npcs: newNpcs,
        quests: newQuests
      };
    });

    // Grant XP after the state update to avoid conflicts with the functional update
    const quest = gameState.quests.find(q => q.id === questId);
    if (quest) {
      const xpReward = 50 + (quest.rewardMoney || 0) / 2;
      gainExperience(xpReward);
    }

    sounds.playSuccess();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  const handleUseItem = (index: number) => {
    setGameState(prev => {
      const slot = prev.player.inventory[index];
      if (!slot || slot.item.type !== 'food') return prev;

      const newStats = { ...prev.player.stats };
      if (slot.item.effects) {
        if (slot.item.effects.health) newStats.health = Math.min(newStats.maxHealth, newStats.health + slot.item.effects.health);
        if (slot.item.effects.energy) newStats.energy = Math.min(newStats.maxEnergy, newStats.energy + slot.item.effects.energy);
        if (slot.item.effects.attack) newStats.attack += slot.item.effects.attack;
      }

      const newInventory = [...prev.player.inventory];
      if (slot.quantity > 1) {
        newInventory[index] = { ...slot, quantity: slot.quantity - 1 };
      } else {
        newInventory[index] = null;
      }

      sounds.playSuccess();
      showToast(`Used ${slot.item.name}!`);

      return {
        ...prev,
        player: { ...prev.player, stats: newStats, inventory: newInventory }
      };
    });
  };

  const handleSplitStack = (index: number) => {
    setGameState(prev => {
      const slot = prev.player.inventory[index];
      if (!slot || slot.quantity <= 1) return prev;

      const emptySlotIndex = prev.player.inventory.findIndex(s => s === null);
      if (emptySlotIndex === -1) {
        showToast('Inventory full!');
        return prev;
      }

      const newInventory = [...prev.player.inventory];
      const splitAmount = Math.floor(slot.quantity / 2);
      newInventory[index] = { ...slot, quantity: slot.quantity - splitAmount };
      newInventory[emptySlotIndex] = { ...slot, quantity: splitAmount, acquiredAt: Date.now() };

      sounds.playSelect();
      return { ...prev, player: { ...prev.player, inventory: newInventory } };
    });
  };

  const handlePurchase = (shopItem: ShopItem) => {
    setGameState(prev => {
      if (prev.player.money < shopItem.price) return prev;

      const newPlayer = { ...prev.player, money: prev.player.money - shopItem.price };

      if (shopItem.type === 'item' && shopItem.item) {
        const emptySlotIndex = newPlayer.inventory.findIndex(s => s === null);
        if (emptySlotIndex !== -1) {
          newPlayer.inventory[emptySlotIndex] = { item: shopItem.item, quantity: 1, acquiredAt: Date.now() };
        } else {
          showToast("Inventory Full!");
          return prev;
        }
      } else if (shopItem.type === 'avatar' && shopItem.image) {
        newPlayer.ownedAvatars = [...newPlayer.ownedAvatars, shopItem.image];
      } else if (shopItem.type === 'border') {
        newPlayer.ownedBorders = [...newPlayer.ownedBorders, shopItem.id];
      } else if (shopItem.type === 'background' && shopItem.image) {
        newPlayer.ownedBackgrounds = [...newPlayer.ownedBackgrounds, shopItem.image];
      }

      return { ...prev, player: newPlayer };
    });
    showToast(`Purchased ${shopItem.name}!`);
  };

  const handleSpinnerReward = (reward: { type: 'item' | 'money', value: any, cost?: number }) => {
    setGameState(prev => {
      const newPlayer = { ...prev.player, money: prev.player.money };
      
      if (reward.cost) {
        newPlayer.money -= reward.cost;
      }

      if (reward.type === 'money') {
        newPlayer.money += reward.value;
      } else if (reward.type === 'item') {
        const emptySlotIndex = newPlayer.inventory.findIndex(s => s === null);
        if (emptySlotIndex !== -1) {
          newPlayer.inventory[emptySlotIndex] = { item: reward.value, quantity: 1, acquiredAt: Date.now() };
        } else {
          showToast("Inventory Full! Item lost.");
        }
      }

      const today = new Date().toISOString().split('T')[0];
      const newSpinCount = (prev.lastSpinDate === today ? (prev.spinCount || 0) : 0) + 1;

      return { 
        ...prev, 
        player: newPlayer,
        lastSpinDate: today,
        spinCount: newSpinCount
      };
    });
    
    const rewardText = reward.type === 'money' ? `${reward.value}g` : reward.value.name;
    showToast(`Received ${rewardText}!`);
  };

  const handleNextDay = () => {
    sounds.playSuccess();
    setGameState(prev => {
      const nextDay = prev.currentDay + 1;
      const updatedQuests = (prev.quests || []).map(q => {
        if ((q.status === 'available' || q.status === 'active') && q.expiresAt && nextDay > q.expiresAt) {
          return { ...q, status: 'expired' as const };
        }
        return q;
      });

      // Randomly select a daily event (30% chance)
      let nextEvent = null;
      if (Math.random() < 0.3) {
        nextEvent = DAILY_EVENTS[Math.floor(Math.random() * DAILY_EVENTS.length)];
        // We'll use a timeout to show the notification after the "A new day begins" toast
        setTimeout(() => setShowEventNotification(true), 1000);
      }

      return {
        ...prev,
        currentDay: nextDay,
        currentTime: 360,
        currentDailyEvent: nextEvent,
        player: {
          ...prev.player,
          stats: { ...prev.player.stats, energy: prev.player.stats.maxEnergy }
        },
        quests: updatedQuests
      };
    });
    sounds.playSelect();
    showToast('A new day begins...');
  };

  return (
    <div className="h-screen flex flex-col text-[#2c1e1e] selection:bg-[#8b5e34] selection:text-white overflow-hidden relative">
      <AnimatePresence mode="wait">

        {/* LOADING PAGE */}
        {page === 'loading' && (
          <LoadingPage
            key="loading"
            onLoadingComplete={() => {
              const saved = storageService.loadGame();
              setPage(saved?.hasCreatedCharacter ? 'dashboard' : 'characterCreation');
            }}
          />
        )}

        {/* CHARACTER CREATION PAGE */}
        {page === 'characterCreation' && (
          <motion.div
            key="creation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-start md:items-center justify-center p-2 md:p-4 bg-[#2c1e1e] overflow-y-auto"
          >
            <div className="w-full max-w-4xl flex flex-col items-center justify-start md:justify-center py-4 md:py-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full"
              >
                <h1 className="font-pixel text-2xl text-center mb-8 pixel-text-shadow text-white">Create Your Avatar</h1>
                <CharacterMaker
                  appearance={gameState.player.appearance}
                  gender={gameState.player.gender}
                  name={gameState.player.name}
                  onUpdateAppearance={(updates) => setGameState(prev => ({
                    ...prev,
                    player: { ...prev.player, appearance: { ...prev.player.appearance, ...updates } }
                  }))}
                  onUpdateGender={(gender) => setGameState(prev => ({
                    ...prev,
                    player: { ...prev.player, gender }
                  }))}
                  onUpdateName={(name) => setGameState(prev => ({
                    ...prev,
                    player: { ...prev.player, name }
                  }))}
                  onFinish={() => {
                    finishCharacterCreation();
                    sounds.playSuccess();
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* DASHBOARD */}
        {page === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen flex flex-col overflow-hidden"
          >
            {/* Settings Modal */}
            <AnimatePresence>
              {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#E3AD69] border-[10px] border-[#E36F00] rounded-[30px] p-6 w-full max-w-sm shadow-[0_4px_4px_5px_rgba(0,0,0,0.25)] relative text-center"
                  >
                    <button 
                      onClick={() => { setShowSettings(false); sounds.playModalClose(); }}
                      className="absolute -top-4 -right-4 w-10 h-10 bg-[#E36F00] rounded-full flex items-center justify-center text-white font-pixel text-lg hover:scale-110 transition-transform z-20 border-4 border-[#E3AD69]"
                    >
                      X
                    </button>
                    <h2 className="font-pixel text-lg text-black mb-4 pixel-text-shadow">
                      {isResetConfirmOpen ? 'Reset Game?' : 'Settings'}
                    </h2>
                    <div className="flex flex-col gap-2 mb-2">
                      {!isResetConfirmOpen ? (
                        <>
                          <button onClick={handleSave} className="pixel-button w-full !bg-[#E36F00] hover:!bg-[#c56000]">Save Game</button>
                          <button onClick={handleLoad} className="pixel-button w-full !bg-[#E36F00] hover:!bg-[#c56000]">Load Game</button>
                          <button onClick={() => setIsResetConfirmOpen(true)} className="pixel-button w-full !bg-[#FC3838] hover:!bg-[#d32f2f]">Reset Game</button>
                          <button onClick={() => { setShowCredits(true); setShowSettings(false); sounds.playModalOpen(); }} className="pixel-button w-full !bg-[#E36F00] hover:!bg-[#c56000]">Credits</button>
                        </>
                      ) : (
                        <>
                          <p className="font-pixel text-[10px] text-black/70 mb-4 leading-relaxed">
                            This will delete all your progress permanently.
                          </p>
                          <button onClick={handleReset} className="pixel-button w-full !bg-[#962121] hover:!bg-[#7a1b1b]">YES, RESET</button>
                          <button onClick={() => { setIsResetConfirmOpen(false); sounds.playSelect(); }} className="pixel-button-secondary w-full">NO, CANCEL</button>
                        </>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Header - only on Home tab */}
            {activeTab === 'home' && (
              <header
                className="flex-shrink-0 flex items-center px-4 py-4 z-40 overflow-hidden mx-auto relative"
                style={{ 
                  width: '412px', 
                  height: '177px', 
                  background: 'rgba(255, 255, 255, 0.75)', 
                  maxWidth: '100%',
                  border: '4px solid #19A304',
                  boxSizing: 'border-box'
                }}
              >
                {saveMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-24 left-1/2 -translate-x-1/2 bg-[#2c1e1e] border-2 border-[#bdf3ff] text-white font-pixel text-xs px-4 py-2 z-50 pointer-events-none"
                  >
                    {saveMessage}
                  </motion.div>
                )}

                {/* Left: Avatar */}
                <div className="relative w-[120px] h-[120px] flex-shrink-0 -mt-4 -ml-2">
                  {/* Avatar Button */}
                  <button
                    onClick={() => setShowPlayerStatus(true)}
                    className="absolute inset-0 flex items-center justify-center z-0 transition-transform active:scale-95"
                  >
                    <div className={`avatar shadow-inner relative ${gameState.player.currentBorder === 'border_gold' ? 'ring-4 ring-yellow-400' : gameState.player.currentBorder === 'border_magic' ? 'ring-4 ring-purple-500 shadow-[0_0_15px_purple]' : ''}`}>
                      <img
                        src={gameState.player.appearance.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover pixelated"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </button>
                </div>

                {/* Right: Stat Bars + Money */}
                <div className="flex flex-col items-start gap-1 ml-1 flex-1">
                  <div className="flex flex-col gap-1.5">
                    {/* Health Bar */}
                    <div 
                      className="w-[172px] h-[24px] bg-black/20 relative overflow-hidden" 
                      style={{ borderRadius: '8px' }}
                    >
                      <div
                        className="h-full transition-all duration-500"
                        style={{ 
                          width: `${(gameState.player.stats.health / gameState.player.stats.maxHealth) * 100}%`,
                          background: 'linear-gradient(to right, #FC3838, #962121)',
                          borderRadius: '8px'
                        }}
                      />
                      <span className="absolute inset-0 flex items-center justify-start pl-2 text-[8px] font-pixel text-white pixel-text-shadow">HEALTH</span>
                    </div>

                    {/* Energy Bar */}
                    <div 
                      className="w-[172px] h-[24px] bg-black/20 relative overflow-hidden" 
                      style={{ borderRadius: '8px' }}
                    >
                      <div
                        className="h-full transition-all duration-500"
                        style={{ 
                          width: `${(gameState.player.stats.energy / gameState.player.stats.maxEnergy) * 100}%`,
                          background: 'linear-gradient(to right, #52FC38, #319621)',
                          borderRadius: '8px'
                        }}
                      />
                      <span className="absolute inset-0 flex items-center justify-start pl-2 text-[8px] font-pixel text-white pixel-text-shadow">ENERGY</span>
                    </div>
                  </div>

                  {/* Money Section below bars */}
                  <div className="mt-1 bg-white px-3 py-1 rounded-lg border border-yellow-900/20 flex items-center gap-1.5 text-yellow-900 font-pixel text-[11px] shadow-sm">
                    <Coins size={14} className="flex-shrink-0 text-yellow-600" />
                    <span className="whitespace-nowrap font-bold">{gameState.player.money}G</span>
                  </div>

                  {/* Level and Date below money */}
                  <div className="mt-1 flex flex-col items-start leading-tight">
                    <span className="font-pixel text-[10px] text-black">LVL {gameState.player.level}</span>
                    <span className="font-pixel text-[9px] text-yellow-900">
                      {getCalendarDate(gameState.currentDay).season} {getCalendarDate(gameState.currentDay).day}
                    </span>
                  </div>
                </div>

                {/* Settings Button */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => { setShowSettings(true); sounds.playModalOpen(); }}
                    className="pixel-button-secondary w-8 h-8 flex items-center justify-center p-0 flex-shrink-0"
                    title="Settings"
                  >
                    <Settings size={16} />
                  </button>
                </div>
              </header>
            )}

            {/* Main Content */}
            <main className="flex-1 relative overflow-hidden">
              {/* ✅ Removed pb-24 for home tab so avatar fills all available space */}
              <div className={`absolute inset-0 ${activeTab === 'home' ? 'overflow-hidden p-0' : 'overflow-y-auto custom-scrollbar p-4 pb-24'}`}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    {/* HOME TAB */}
                    {activeTab === 'home' && (
                      <div 
                        className="home-main relative w-full overflow-hidden flex items-center justify-center bg-cover bg-center"
                        style={gameState.player.currentBackground ? { backgroundImage: `url(${gameState.player.currentBackground})` } : {}}
                      >

                        {/* Spouse Indicator */}
                        {gameState.npcs.find(n => n.isMarried) && (() => {
                          const spouse = gameState.npcs.find(n => n.isMarried)!;
                          return (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/40 px-4 py-1.5 rounded-full border border-pink-500/30 backdrop-blur-sm z-50">
                              <motion.img
                                src={spouse.avatar}
                                alt={spouse.name}
                                className="w-6 h-6 pixelated rounded-full border border-pink-500/50"
                                referrerPolicy="no-referrer"
                                animate={{ y: [0, -2, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              />
                              <div className="flex items-center gap-2">
                                <Heart size={12} fill="#ff006e" color="#ff006e" className="animate-pulse" />
                                <span className="font-pixel text-[10px] text-pink-300">
                                  Married to {spouse.name}
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Character Display — fixed 428×428, centered, never clips */}
                        <motion.button
                          onClick={() => setShowPlayerStatus(true)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative flex-shrink-0 mt-8"
                          style={{
                            width: 'min(428px, min(100vw, 100%))',
                            height: 'min(428px, min(100vw, 100%))',
                            background: 'none',
                            border: 'none',
                            padding: 0,
                          }}
                        >
                          <div className="absolute inset-0 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl -z-10" />
                          <img
                            src="https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260403202904.png?raw=true"
                            alt="Character Base"
                            className="pixelated absolute inset-0 w-full h-full object-contain"
                            style={{ zIndex: 10 }}
                            referrerPolicy="no-referrer"
                          />
                          {gameState.player.appearance.outfit && (
                            <img
                              src={gameState.player.appearance.outfit}
                              alt="Outfit Overlay"
                              className="pixelated absolute inset-0 w-full h-full object-contain"
                              style={{ zIndex: 20 }}
                              referrerPolicy="no-referrer"
                            />
                          )}
                          {gameState.player.appearance.hair && (
                            <img
                              src={gameState.player.appearance.hair}
                              alt="Hair Overlay"
                              className="pixelated absolute inset-0 w-full h-full object-contain"
                              style={{ zIndex: 30 }}
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </motion.button>

                      </div>
                    )}

                    {/* SOCIAL TAB */}
                    {activeTab === 'social' && (
                      <Social
                        gameState={gameState}
                        onUpdateNPC={updateNPC}
                        onRemoveItem={removeItem}
                        onTriggerEvent={triggerEvent}
                        onRecordInteraction={recordInteraction}
                        onAcceptQuest={acceptQuest}
                        onCompleteQuest={completeQuest}
                        onUpdateChatHistory={(npcId, message) => {
                          setGameState(prev => {
                            const currentHistories = prev.chatHistories || {};
                            const npcHistory = currentHistories[npcId] || [];
                            return {
                              ...prev,
                              chatHistories: {
                                ...currentHistories,
                                [npcId]: [...npcHistory, message]
                              }
                            };
                          });
                        }}
                      />
                    )}

                    {/* INVENTORY TAB */}
                    {activeTab === 'inventory' && (
                      <Inventory
                        items={gameState.player.inventory}
                        onItemClick={(item, index) => {
                          console.log('Clicked item:', item);
                        }}
                        onUseItem={handleUseItem}
                        onSplitStack={handleSplitStack}
                      />
                    )}

                    {/* QUESTS TAB */}
                    {activeTab === 'quests' && (
                      <div className="flex flex-col gap-4 -mx-4">
                        <div className="bg-white px-4 py-3 flex justify-between items-center shadow-sm border-b border-black/10">
                          <h2 className="font-pixel text-[13px] text-black uppercase tracking-wider">Quest Log</h2>
                          <div className="flex gap-2 items-center">
                            <span className="font-pixel text-[8px] text-black/60">Sort by:</span>
                            <select
                              value={questSortBy}
                              onChange={(e) => setQuestSortBy(e.target.value as any)}
                              className="bg-black/5 border border-black/10 text-black font-pixel text-[8px] p-1 rounded outline-none appearance-none"
                            >
                              <option value="dueDate">Due Date</option>
                              <option value="type">Type</option>
                              <option value="giver">Giver</option>
                            </select>
                          </div>
                        </div>
                        <div className="px-4 flex flex-col gap-4">
                          {(gameState.quests || []).filter(q => q.status !== 'available').length === 0 ? (
                            <div className="pixel-card !bg-white text-center py-10 border-black/10">
                              <p className="font-pixel text-[10px] text-black/60">No active or completed quests.</p>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3">
                              {[...(gameState.quests || [])]
                                .filter(q => q.status !== 'available')
                                .sort((a, b) => {
                                  if (questSortBy === 'dueDate') {
                                    return (a.expiresAt || Infinity) - (b.expiresAt || Infinity);
                                  } else if (questSortBy === 'type') {
                                    return a.type.localeCompare(b.type);
                                  } else if (questSortBy === 'giver') {
                                    const aGiver = gameState.npcs.find(n => n.id === a.giverId)?.name || '';
                                    const bGiver = gameState.npcs.find(n => n.id === b.giverId)?.name || '';
                                    return aGiver.localeCompare(bGiver);
                                  }
                                  return 0;
                                })
                                .map(quest => (
                                  <div key={quest.id} className={`pixel-card !bg-white border-black/10 ${quest.status === 'completed' ? 'opacity-70' : quest.status === 'expired' ? 'opacity-70' : ''}`}>
                                    <div className="flex justify-between items-start mb-2">
                                      <h3 className="font-pixel text-xs text-yellow-700">{quest.title}</h3>
                                      <span className={`font-pixel text-[8px] px-2 py-1 rounded text-white ${quest.status === 'completed' ? 'bg-green-600' : quest.status === 'expired' ? 'bg-red-600' : 'bg-blue-600'}`}>
                                        {quest.status.toUpperCase()}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-black/80 mb-3">{quest.description}</p>
                                    <div className="flex justify-between items-center text-[8px] font-pixel">
                                      <div className="flex flex-wrap gap-3">
                                        {quest.rewardMoney && <span className="text-yellow-600">{quest.rewardMoney}g</span>}
                                        {quest.rewardFriendship && <span className="text-pink-600">+{quest.rewardFriendship} Friendship</span>}
                                        {quest.rewardItem && <span className="text-blue-600">1x {quest.rewardItem.name}</span>}
                                        {quest.rewardStats && (
                                          <span className="text-red-600">
                                            {quest.rewardStats.attack ? `+${quest.rewardStats.attack} ENERGY ` : ''}
                                            {quest.rewardStats.energy ? `+${quest.rewardStats.energy} ENERGY ` : ''}
                                            {quest.rewardStats.maxEnergy ? `+${quest.rewardStats.maxEnergy} MAX ENERGY ` : ''}
                                            {quest.rewardStats.maxHealth ? `+${quest.rewardStats.maxHealth} HP` : ''}
                                          </span>
                                        )}
                                        {quest.rewardRecipe && <span className="text-purple-600">Recipe: {quest.rewardRecipe}</span>}
                                      </div>
                                      <div className="flex flex-col items-end gap-1">
                                        <span className="text-black/40">Giver: {gameState.npcs.find(n => n.id === quest.giverId)?.name}</span>
                                        {quest.expiresAt && quest.status === 'active' && (
                                          <span className="text-red-500">Expires Day {quest.expiresAt}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>
              </div>
            </main>

            {/* Bottom Nav */}
            <div className="relative">
              {/* Guide Button - Floating above Inventory */}
              <AnimatePresence>
              {activeTab === 'home' && !showShop && !showGuide && !showSettings && !showPlayerStatus && !isResetConfirmOpen && !showSpinner && !showCredits && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    onClick={() => { setShowGuide(true); sounds.playModalOpen(); }}
                    className="absolute -top-16 right-4 z-50 transition-transform hover:scale-110 active:scale-95"
                    title="Adventurer's Guide"
                  >
                    <img 
                      src="https://github.com/FairyOfTheBog/myimgsources/blob/main/guide.png?raw=true" 
                      alt="Guide" 
                      className="w-12 h-12 pixelated" 
                      referrerPolicy="no-referrer"
                    />
                  </motion.button>
                )}
              </AnimatePresence>

              <nav 
                className="flex-shrink-0 z-40 px-2 py-0.5 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.2)] overflow-hidden scrollbar-hide"
                style={{ background: 'white' }}
              >
              <div className="flex-1 flex justify-center border-r border-black/10 scrollbar-hide">
                <NavButton
                  active={activeTab === 'home'}
                  onClick={() => handleTabChange('home')}
                  icon={<img src="https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260404091030.png?raw=true" alt="Home" className="w-10 h-10 pixelated" referrerPolicy="no-referrer" />}
                />
              </div>
              <div className="flex-1 flex justify-center border-r border-black/10 scrollbar-hide">
                <NavButton
                  active={activeTab === 'social'}
                  onClick={() => handleTabChange('social')}
                  icon={<img src="https://github.com/FairyOfTheBog/myimgsources/blob/main/web.png?raw=true" alt="Social" className="w-10 h-10 pixelated" referrerPolicy="no-referrer" />}
                />
              </div>
              <div className="flex-1 flex justify-center border-r border-black/10 scrollbar-hide">
                <NavButton
                  active={activeTab === 'quests'}
                  onClick={() => handleTabChange('quests')}
                  icon={<img src="https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260404091252.png?raw=true" alt="Quests" className="w-10 h-10 pixelated" referrerPolicy="no-referrer" />}
                />
              </div>
              <div className="flex-1 flex justify-center scrollbar-hide">
                <NavButton
                  active={activeTab === 'inventory'}
                  onClick={() => handleTabChange('inventory')}
                  icon={<img src="https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260404091128.png?raw=true" alt="Inventory" className="w-10 h-10 pixelated" referrerPolicy="no-referrer" />}
                />
              </div>
            </nav>
          </div>

            {/* Credits Modal */}
            <AnimatePresence>
              {showCredits && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-hidden">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#E3AD69] border-[10px] border-[#E36F00] rounded-[30px] p-6 w-full max-w-sm shadow-[0_4px_4px_5px_rgba(0,0,0,0.25)] relative text-center"
                  >
                    <button 
                      onClick={() => { setShowCredits(false); sounds.playModalClose(); }}
                      className="absolute -top-4 -right-4 w-10 h-10 bg-[#E36F00] rounded-full flex items-center justify-center text-white font-pixel text-lg hover:scale-110 transition-transform z-20 border-4 border-[#E3AD69]"
                    >
                      X
                    </button>

                    <h2 className="font-pixel text-lg text-black mb-6 border-b-4 border-black/10 pb-2 uppercase">Credits</h2>
                    
                    <div className="space-y-6 mb-8">
                      <div>
                        <p className="font-pixel text-[10px] text-black/60 uppercase mb-1">Developer</p>
                        <p className="font-pixel text-sm text-black">Bananarang & AI Studio Build Agent</p>
                      </div>
                      <div>
                        <p className="font-pixel text-[10px] text-black/60 uppercase mb-1">Design & Content Inspiration</p>
                        <p className="font-pixel text-sm text-black">Stardew Valley</p>
                      </div>
                      <div className="flex flex-col items-center pt-2">
                        <p className="font-pixel text-[10px] text-black/60 mb-3">Copyright © ConcernedApe 2016</p>
                        <img 
                          src="https://github.com/FairyOfTheBog/myimgsources/blob/main/ConcernedApe_Logo.png?raw=true" 
                          alt="ConcernedApe Logo" 
                          className="w-32 h-auto pixelated" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    {/* Removed redundant CLOSE button as per user request */}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Player Status Modal */}
            <AnimatePresence>
              {showPlayerStatus && (
                <PlayerStatus
                  player={gameState.player}
                  currentDay={gameState.currentDay}
                  onClose={() => { setShowPlayerStatus(false); sounds.playModalClose(); }}
                  onUpdatePlayer={(updates) => setGameState(prev => ({
                    ...prev,
                    player: { ...prev.player, ...updates }
                  }))}
                />
              )}
            </AnimatePresence>

     
            {/* Guide System Modal */}
            <AnimatePresence>
              {showGuide && (
                <GuideSystem
                  onClose={() => { setShowGuide(false); sounds.playModalClose(); }}
                />
              )}
            </AnimatePresence>

            {/* Shop Modal */}
            <AnimatePresence>
              {showShop && (
                <Shop
                  gameState={gameState}
                  onPurchase={handlePurchase}
                  onClose={() => { setShowShop(false); sounds.playModalClose(); }}
                />
              )}
            </AnimatePresence>

            {/* Daily Event Notification */}
            <AnimatePresence>
              {showEventNotification && gameState.currentDailyEvent && (
                <DailyEventNotification
                  event={gameState.currentDailyEvent}
                  onClose={() => setShowEventNotification(false)}
                />
              )}
            </AnimatePresence>


            {/* Floating Shop Button - Centered on right side */}
            <AnimatePresence>
              {activeTab === 'home' && !showShop && !showGuide && !showSettings && !showPlayerStatus && !isResetConfirmOpen && !showSpinner && !showCredits && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={() => { setShowShop(true); sounds.playModalOpen(); }}
                  className="fixed top-1/2 right-4 -translate-y-1/2 z-[60] transition-transform hover:scale-110 active:scale-95"
                  title="Pierre's Shop"
                >
                  <img 
                    src="https://github.com/FairyOfTheBog/myimgsources/blob/main/shop.png?raw=true" 
                    alt="Shop" 
                    style={{ width: '45px', height: '50px' }}
                    className="pixelated" 
                    referrerPolicy="no-referrer"
                  />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Floating Spinner Button */}
            <AnimatePresence>
              {activeTab === 'home' && !showShop && !showGuide && !showSettings && !showPlayerStatus && !isResetConfirmOpen && !showSpinner && !showCredits && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={() => { setShowSpinner(true); sounds.playModalOpen(); }}
                  className="fixed top-1/2 right-[11px] translate-y-[80%] z-[60] transition-transform hover:scale-110 active:scale-95"
                  title="Daily Spin"
                >
                  <div className="relative">
                    <img 
                      src="https://github.com/FairyOfTheBog/myimgsources/blob/main/spinner.png?raw=true" 
                      alt="Spinner" 
                      style={{ width: '55px', height: '55px' }}
                      className="pixelated" 
                      referrerPolicy="no-referrer"
                    />
                    {!gameState.lastSpinDate || gameState.lastSpinDate !== new Date().toISOString().split('T')[0] ? (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse z-10 shadow-lg">
                        <span className="text-white font-pixel text-[10px] leading-none">!</span>
                      </div>
                    ) : null}
                  </div>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Spinner Modal */}
            <AnimatePresence>
              {showSpinner && (
                <Spinner
                  gameState={gameState}
                  onReward={handleSpinnerReward}
                  onClose={() => { setShowSpinner(false); sounds.playModalClose(); }}
                />
              )}
            </AnimatePresence>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center p-1 transition-all overflow-hidden scrollbar-hide ${active ? 'scale-125' : 'opacity-60 hover:opacity-100 hover:scale-110'}`}
    >
      <div className={active ? 'drop-shadow-[0_0_12px_rgba(0,0,0,0.3)]' : ''}>
        {icon}
      </div>
    </button>
  );
}
