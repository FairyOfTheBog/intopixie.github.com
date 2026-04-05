import React, { useState, useEffect } from 'react';
import { GameState, CharacterMakerState, Gender, NPC, InventoryItem, Item } from './types';
import { ITEMS, NPCS, SKIN_COLORS, HAIR_COLORS, INITIAL_QUESTS, OUTFITS, HAIR_STYLES, DAILY_EVENTS, AVATARS } from './constants';
import CharacterMaker from './components/CharacterMaker';
import Inventory from './components/Inventory';
import Social from './components/Social';
import LoadingPage from './components/LoadingPage';
import PlayerStatus from './components/PlayerStatus';
import { Coins, Settings, Heart, Clock } from 'lucide-react';
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
          }
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

  const handleNextDay = () => {
    setGameState(prev => {
      const nextDay = prev.currentDay + 1;
      const updatedQuests = (prev.quests || []).map(q => {
        if ((q.status === 'available' || q.status === 'active') && q.expiresAt && nextDay > q.expiresAt) {
          return { ...q, status: 'expired' as const };
        }
        return q;
      });
      return {
        ...prev,
        currentDay: nextDay,
        currentTime: 360,
        currentDailyEvent: null,
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
                  role={gameState.player.role}
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
                  onUpdateRole={(role) => setGameState(prev => ({
                    ...prev,
                    player: { ...prev.player, role }
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-hidden">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="pixel-card w-full max-w-sm text-center overflow-hidden"
                  >
                    <h2 className="font-pixel text-lg text-yellow-400 mb-4 pixel-text-shadow">
                      {isResetConfirmOpen ? 'Reset Game?' : 'Settings'}
                    </h2>
                    <div className="flex flex-col gap-2 mb-2 overflow-hidden">
                      {!isResetConfirmOpen ? (
                        <>
                          <button onClick={handleSave} className="pixel-button w-full">Save Game</button>
                          <button onClick={handleLoad} className="pixel-button w-full">Load Game</button>
                          <button onClick={() => setIsResetConfirmOpen(true)} className="pixel-button w-full">Reset Game</button>
                          <button onClick={() => { setShowCredits(true); setShowSettings(false); }} className="pixel-button w-full">Credits</button>
                          <button onClick={() => setShowSettings(false)} className="pixel-button-secondary w-full">Close</button>
                        </>
                      ) : (
                        <>
                          <p className="font-pixel text-[10px] text-white/70 mb-4 leading-relaxed">
                            This will delete all your progress permanently.
                          </p>
                          <button onClick={handleReset} className="pixel-button w-full">YES, RESET</button>
                          <button onClick={() => setIsResetConfirmOpen(false)} className="pixel-button-secondary w-full">NO, CANCEL</button>
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
                className="flex-shrink-0 flex items-center justify-between px-4 py-3 z-40 overflow-hidden"
                style={{ background: 'rgba(255, 212, 128, 0.8)' }}
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

                {/* Left: Circular Avatar + Stat Bars */}
                <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                  <button
                    onClick={() => setShowPlayerStatus(true)}
                    className="avatar transition-transform active:scale-95 flex-shrink-0 shadow-lg"
                    style={{ boxShadow: '0 0 14px rgba(255,215,0,0.5)' }}
                  >
                    <img
                      src={gameState.player.appearance.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover pixelated"
                      referrerPolicy="no-referrer"
                    />
                  </button>

                  {/* Stat Bars + Time */}
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <div className="bg-black/50 px-2 py-0.5 rounded border border-white/10 flex items-center gap-1.5 mb-1">
                      <Clock size={8} className="text-yellow-400 flex-shrink-0" />
                      <span className="font-pixel text-[6px] md:text-[8px] text-white tracking-tighter whitespace-nowrap">
                        Day {gameState.currentDay} - {formatTime(gameState.currentTime)}
                      </span>
                    </div>
                    <div className="w-24 md:w-32 h-2.5 md:h-3 bg-black/50 pixel-border-inset relative overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
                        style={{ width: `${(gameState.player.stats.health / gameState.player.stats.maxHealth) * 100}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[5px] md:text-[6px] font-pixel text-white">HEALTH</span>
                    </div>
                    <div className="w-24 md:w-32 h-2.5 md:h-3 bg-black/50 pixel-border-inset relative overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-500"
                        style={{ width: `${Math.min(100, (gameState.player.stats.attack / 50) * 100)}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[5px] md:text-[6px] font-pixel text-white">ATTACK</span>
                    </div>
                  </div>
                </div>

                {/* Right: Money + Settings */}
                <div className="flex flex-col items-end gap-1 md:gap-2 flex-shrink-0 overflow-hidden">
                  <div className="flex items-center gap-1 text-yellow-900 font-pixel text-[10px] md:text-xs">
                    <Coins size={12} className="flex-shrink-0" />
                    <span className="whitespace-nowrap">{gameState.player.money}g</span>
                  </div>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="pixel-button-secondary w-8 h-8 md:w-10 md:h-10 flex items-center justify-center p-0 flex-shrink-0"
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
                      <div className="relative h-full w-full overflow-hidden">

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

                        {/* ✅ Character Display — truly fills the entire main area */}
                        <motion.button
                          onClick={() => setShowPlayerStatus(true)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="absolute inset-0 cursor-pointer group"
                          style={{ background: 'none', border: 'none', padding: 0 }}
                        >
                          <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors -z-10" />
                          {/* ✅ Base image: fills container, respects aspect ratio */}
                          <img
                            src="https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260403202904.png?raw=true"
                            alt="Character Base"
                            className="pixelated"
                            style={{
                              position: 'absolute',
                              inset: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              objectPosition: 'center bottom',
                              zIndex: 10,
                            }}
                            referrerPolicy="no-referrer"
                          />
                          {/* ✅ Outfit overlay: same box, always aligned */}
                          {gameState.player.appearance.outfit && (
                            <img
                              src={gameState.player.appearance.outfit}
                              alt="Outfit Overlay"
                              className="pixelated"
                              style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                objectPosition: 'center bottom',
                                zIndex: 20,
                              }}
                              referrerPolicy="no-referrer"
                            />
                          )}
                          {/* ✅ Hair overlay: same box, always aligned */}
                          {gameState.player.appearance.hair && (
                            <img
                              src={gameState.player.appearance.hair}
                              alt="Hair Overlay"
                              className="pixelated"
                              style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                objectPosition: 'center bottom',
                                zIndex: 30,
                              }}
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
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="font-pixel text-lg text-white pixel-text-shadow">Quest Log</h2>
                          <div className="flex gap-2 items-center">
                            <span className="font-pixel text-[8px] opacity-70">Sort by:</span>
                            <select
                              value={questSortBy}
                              onChange={(e) => setQuestSortBy(e.target.value as any)}
                              className="bg-black/50 border border-white/20 text-white font-pixel text-[8px] p-1 rounded outline-none appearance-none"
                            >
                              <option value="dueDate">Due Date</option>
                              <option value="type">Type</option>
                              <option value="giver">Giver</option>
                            </select>
                          </div>
                        </div>
                        {(gameState.quests || []).filter(q => q.status !== 'available').length === 0 ? (
                          <div className="pixel-card bg-black/40 text-center py-10 opacity-60">
                            <p className="font-pixel text-[10px]">No active or completed quests.</p>
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
                                <div key={quest.id} className={`pixel-card ${quest.status === 'completed' ? 'opacity-60 bg-green-900/20' : quest.status === 'expired' ? 'opacity-60 bg-red-900/20' : 'bg-black/40'}`}>
                                  <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-pixel text-xs text-yellow-400">{quest.title}</h3>
                                    <span className={`font-pixel text-[8px] px-2 py-1 rounded ${quest.status === 'completed' ? 'bg-green-600' : quest.status === 'expired' ? 'bg-red-600' : 'bg-blue-600'}`}>
                                      {quest.status.toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="text-[10px] opacity-80 mb-3">{quest.description}</p>
                                  <div className="flex justify-between items-center text-[8px] font-pixel">
                                    <div className="flex flex-wrap gap-3">
                                      {quest.rewardMoney && <span className="text-yellow-300">{quest.rewardMoney}g</span>}
                                      {quest.rewardFriendship && <span className="text-pink-300">+{quest.rewardFriendship} Friendship</span>}
                                      {quest.rewardItem && <span className="text-blue-300">1x {quest.rewardItem.name}</span>}
                                      {quest.rewardStats && (
                                        <span className="text-red-300">
                                          {quest.rewardStats.attack ? `+${quest.rewardStats.attack} ATK ` : ''}
                                          {quest.rewardStats.maxHealth ? `+${quest.rewardStats.maxHealth} HP` : ''}
                                        </span>
                                      )}
                                      {quest.rewardRecipe && <span className="text-purple-300">Recipe: {quest.rewardRecipe}</span>}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      <span className="opacity-50">Giver: {gameState.npcs.find(n => n.id === quest.giverId)?.name}</span>
                                      {quest.expiresAt && quest.status === 'active' && (
                                        <span className="text-red-400">Expires Day {quest.expiresAt}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>
              </div>
            </main>

            {/* Bottom Nav */}
            <nav 
              className="flex-shrink-0 z-40 px-2 py-0.5 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.2)] overflow-hidden scrollbar-hide"
              style={{ background: 'rgba(230, 153, 0, 0.9)' }}
            >
              <div className="flex-1 flex justify-center border-r border-white/20 scrollbar-hide">
                <NavButton
                  active={activeTab === 'home'}
                  onClick={() => handleTabChange('home')}
                  icon={<img src="https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260404091030.png?raw=true" alt="Home" className="w-10 h-10 pixelated" referrerPolicy="no-referrer" />}
                />
              </div>
              <div className="flex-1 flex justify-center border-r border-white/20 scrollbar-hide">
                <NavButton
                  active={activeTab === 'social'}
                  onClick={() => handleTabChange('social')}
                  icon={<img src="https://github.com/FairyOfTheBog/myimgsources/blob/main/mail%20(1).png?raw=true" alt="Social" className="w-150 h-15 pixelated" referrerPolicy="no-referrer" />}
                />
              </div>
              <div className="flex-1 flex justify-center border-r border-white/20 scrollbar-hide">
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

            {/* Credits Modal */}
            <AnimatePresence>
              {showCredits && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-hidden">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="pixel-card w-full max-w-sm text-center overflow-hidden"
                  >
                    <h2 className="font-pixel text-lg text-yellow-400 mb-4 pixel-text-shadow">Credits</h2>
                    <div className="space-y-4 mb-6 overflow-hidden">
                      <div>
                        <p className="font-pixel text-[10px] text-white/70">Developer</p>
                        <p className="font-pixel text-sm">AI Studio Build Agent</p>
                      </div>
                      <div>
                        <p className="font-pixel text-[10px] text-white/70">Design Inspiration</p>
                        <p className="font-pixel text-sm">Stardew Valley</p>
                      </div>
                      <div>
                        <p className="font-pixel text-[10px] text-white/70">Framework</p>
                        <p className="font-pixel text-sm">React + Tailwind CSS</p>
                      </div>
                    </div>
                    <button onClick={() => setShowCredits(false)} className="pixel-button w-full">
                      Close
                    </button>
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
                  onClose={() => setShowPlayerStatus(false)}
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
      <div className={active ? 'drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]' : ''}>
        {icon}
      </div>
    </button>
  );
}
