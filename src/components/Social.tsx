import React, { useState, useEffect } from 'react';
import { NPC, GameState, HeartEvent } from '../types';
import { Heart, MessageSquare, Gift, HeartHandshake, Scroll, CheckCircle, Users } from 'lucide-react';
import { chatWithNPC, getGiftReaction } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { sounds } from '../services/soundManager';
import { HEART_EVENTS } from '../constants';

interface SocialProps {
  gameState: GameState;
  onUpdateNPC: (npcId: string, updates: Partial<NPC>) => void;
  onRemoveItem: (index: number) => void;
  onTriggerEvent: (eventId: string) => void;
  onRecordInteraction: (npcId: string) => void;
  onAcceptQuest: (questId: string) => void;
  onCompleteQuest: (questId: string) => void;
  onUpdateChatHistory: (npcId: string, message: { role: 'user' | 'npc', text: string, imageUrl?: string }) => void;
}

export default function Social({ 
  gameState, 
  onUpdateNPC, 
  onRemoveItem, 
  onTriggerEvent, 
  onRecordInteraction,
  onAcceptQuest,
  onCompleteQuest,
  onUpdateChatHistory
}: SocialProps) {
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [activeEvent, setActiveEvent] = useState<HeartEvent | null>(null);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.chatHistories, selectedNPC?.id, isTyping]);

  const handleNPCSelect = (npc: NPC) => {
    sounds.playSelect();
    setSelectedNPC(npc);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  // Check for heart events when friendship changes
  useEffect(() => {
    if (!selectedNPC) return;
    const pendingEvent = HEART_EVENTS.find(e => 
      e.npcId === selectedNPC.id && 
      selectedNPC.friendship >= e.requiredFriendship && 
      !gameState.triggeredEvents.includes(e.id)
    );
    if (pendingEvent) {
      setActiveEvent(pendingEvent);
      sounds.playSuccess();
    }
  }, [selectedNPC?.friendship, gameState.triggeredEvents, selectedNPC?.id]);

  const handleEventChoice = (choice: any) => {
    if (!activeEvent || !selectedNPC) return;
    
    const newFriendship = Math.min(2500, Math.max(0, selectedNPC.friendship + choice.friendshipImpact));
    onUpdateNPC(selectedNPC.id, { friendship: newFriendship });
    onTriggerEvent(activeEvent.id);
    
    onUpdateChatHistory(selectedNPC.id, { role: 'npc', text: `[Event: ${activeEvent.title}] You chose: ${choice.text}` });
    setActiveEvent(null);
    sounds.playSelect();
    
    if (choice.friendshipImpact > 0) {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    }
  };

  const handleChat = async () => {
    if (!selectedNPC || !chatMessage.trim()) return;
    
    sounds.playSelect();
    const userMsg = chatMessage;
    setChatMessage('');
    onUpdateChatHistory(selectedNPC.id, { role: 'user', text: userMsg });
    setIsTyping(true);

    try {
      const response = await chatWithNPC(selectedNPC, userMsg, gameState.player, gameState.currentDailyEvent);
      
      // Check if response includes an image tag like [IMAGE: keyword]
      let text = response || "...";
      let imageUrl = undefined;
      const imageMatch = text.match(/\[IMAGE:\s*([^\]]+)\]/i);
      
      if (imageMatch) {
        const keyword = imageMatch[1].trim().replace(/\s+/g, '-');
        // Use a pixel art style placeholder or just ensure the CSS class is applied
        imageUrl = `https://picsum.photos/seed/${keyword}-pixel/200/200`;
        text = text.replace(imageMatch[0], '').trim();
      }

      onUpdateChatHistory(selectedNPC.id, { role: 'npc', text, imageUrl });
      onRecordInteraction(selectedNPC.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGift = async (itemIndex: number) => {
    if (!selectedNPC) return;
    const slot = gameState.player.inventory[itemIndex];
    if (!slot) return;

    sounds.playGift();
    const item = slot.item;
    onRemoveItem(itemIndex);
    setShowGiftModal(false);

    setIsTyping(true);
    try {
      const reaction = await getGiftReaction(selectedNPC, item.name, gameState.player, gameState.currentDailyEvent);
      
      let gain = 20;
      if (selectedNPC.loves.includes(item.id)) gain = 80;
      else if (selectedNPC.likes.includes(item.id)) gain = 45;
      else if (selectedNPC.dislikes.includes(item.id)) gain = -20;
      else if (selectedNPC.hates.includes(item.id)) gain = -40;

      const newFriendship = Math.min(2500, Math.max(0, selectedNPC.friendship + gain));
      onUpdateNPC(selectedNPC.id, { friendship: newFriendship });
      onRecordInteraction(selectedNPC.id);
      
      onUpdateChatHistory(selectedNPC.id, { role: 'npc', text: reaction || "..." });
      
      if (gain > 0) {
        sounds.playSuccess();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#ff006e', '#ffbe0b', '#fb5607']
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAskOut = () => {
    if (!selectedNPC) return;
    if (selectedNPC.friendship < 2000) {
      sounds.playSelect();
      onUpdateChatHistory(selectedNPC.id, { role: 'npc', text: "I'm sorry, I don't think we're that close yet..." });
      return;
    }

    if (selectedNPC.isDating) {
      sounds.playSelect();
      onUpdateChatHistory(selectedNPC.id, { role: 'npc', text: "We're already dating, silly! ❤️" });
      return;
    }

    sounds.playSuccess();
    onUpdateNPC(selectedNPC.id, { isDating: true });
    onRecordInteraction(selectedNPC.id);
    onUpdateChatHistory(selectedNPC.id, { role: 'npc', text: "Oh! I'd love to go out with you! ❤️ I've been waiting for you to ask!" });
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff006e', '#ff85a1']
    });
  };

  const handlePropose = () => {
    if (!selectedNPC) return;
    
    // Check if player is already married to someone else
    const currentSpouse = gameState.npcs.find(n => n.isMarried);
    if (currentSpouse && currentSpouse.id !== selectedNPC.id) {
      sounds.playSelect();
      onUpdateChatHistory(selectedNPC.id, { role: 'npc', text: `Wait... aren't you already married to ${currentSpouse.name}? I can't do that!` });
      return;
    }

    if (!selectedNPC.isDating) {
      sounds.playSelect();
      onUpdateChatHistory(selectedNPC.id, { role: 'npc', text: "Marriage? We haven't even started dating yet!" });
      return;
    }
    if (selectedNPC.friendship < 2500) {
      sounds.playSelect();
      onUpdateChatHistory(selectedNPC.id, { role: 'npc', text: "I love you, but I'm not sure if I'm ready for such a big step yet..." });
      return;
    }

    sounds.playSuccess();
    onUpdateNPC(selectedNPC.id, { isMarried: true, isDating: false });
    onRecordInteraction(selectedNPC.id);
    onUpdateChatHistory(selectedNPC.id, { role: 'npc', text: "YES! A thousand times yes! I want to spend the rest of my life with you! 💍❤️" });
    confetti({
      particleCount: 300,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#ff006e', '#ffffff', '#ffd700']
    });
  };

  const availableQuests = (gameState.quests || []).filter(q => 
    q.giverId === selectedNPC?.id && 
    q.status === 'available' && 
    (q.requiredFriendship === undefined || (selectedNPC?.friendship || 0) >= q.requiredFriendship)
  );
  const activeQuests = (gameState.quests || []).filter(q => q.giverId === selectedNPC?.id && q.status === 'active');

  const canCompleteQuest = (quest: any) => {
    if (quest.type === 'delivery' && quest.targetItemId) {
      const inventoryItem = gameState.player.inventory.find(slot => slot?.item.id === quest.targetItemId);
      return inventoryItem && inventoryItem.quantity >= (quest.targetQuantity || 1);
    }
    return true;
  };

  const getNextMilestone = (npc: NPC) => {
    const friendship = npc.friendship;
    if (friendship < 500) return { text: "Next: 2 Hearts (New Quests/Events)", target: 500 };
    if (friendship < 1000) return { text: "Next: 4 Hearts (New Quests/Events)", target: 1000 };
    if (friendship < 1500) return { text: "Next: 6 Hearts (New Quests/Events)", target: 1500 };
    if (friendship < 2000) return { text: "Next: 8 Hearts (Can Ask Out)", target: 2000 };
    if (friendship < 2500) return { text: "Next: 10 Hearts (Can Propose)", target: 2500 };
    if (npc.isMarried) return { text: "Happily Married ❤️", target: 2500 };
    return { text: "Max Friendship Reached!", target: 2500 };
  };

  return (
    <div className="w-full max-w-5xl mx-auto h-full flex flex-col gap-4 overflow-hidden">
      {/* NPC List - Horizontal Scroll */}
      <div className={`flex flex-col gap-2 flex-shrink-0 pt-6 ${isChatOpen ? 'hidden md:flex' : 'flex'}`}>
        <div className="px-4 mb-2">
          <div className="pixel-card !bg-[#8b623d] !p-2 border-white/20">
            <h2 className="font-pixel text-[13px] pixel-text-shadow text-white text-center">Villagers You May Know</h2>
          </div>
        </div>
        <div className="flex overflow-x-auto pb-6 gap-6 scrollbar-hide px-4 snap-x">
          {gameState.npcs.map(npc => {
            const questStatus = (gameState.quests || []).find(q => 
              q.giverId === npc.id && 
              (q.status === 'active' || (q.status === 'available' && (q.requiredFriendship === undefined || npc.friendship >= q.requiredFriendship)))
            )?.status;

            return (
              <div 
                key={npc.id}
                onClick={() => handleNPCSelect(npc)}
                className={`flex-shrink-0 w-32 h-40 pixel-card cursor-pointer transition-all hover:-translate-y-1 flex flex-col items-center justify-between p-3 relative !bg-[#a67c52] border-white/20 snap-start ${selectedNPC?.id === npc.id ? 'ring-2 ring-white scale-105 z-10' : ''}`}
              >
                <div className="relative mb-2">
                  <motion.img 
                    src={npc.avatar} 
                    alt={npc.name} 
                    className="w-16 h-16 pixelated" 
                    referrerPolicy="no-referrer"
                    animate={{ 
                      y: [0, -2, 0],
                    }}
                    transition={{ 
                      duration: 2 + (parseInt(npc.id, 36) % 10) / 10, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  />
                  {questStatus === 'available' && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 text-black font-pixel text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-black animate-bounce">
                      !
                    </div>
                  )}
                  {questStatus === 'active' && (
                    <div className="absolute -top-1 -right-1 bg-blue-400 text-white font-pixel text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-black animate-pulse">
                      ?
                    </div>
                  )}
                </div>
                
                <div className="text-center w-full">
                  <p className="font-pixel text-[11px] text-white truncate mb-1">{npc.name}</p>
                  <div className="flex flex-col gap-1 items-center">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Heart 
                          key={i} 
                          size={8} 
                          fill={i < Math.floor(npc.friendship / 500) ? "#ff006e" : "transparent"} 
                          color={i < Math.floor(npc.friendship / 500) ? "#ff006e" : "#444"} 
                        />
                      ))}
                    </div>
                    {/* Compact Friendship Progress Bar */}
                    <div className="w-full bg-black/40 h-1.5 pixel-border-inset relative overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r from-pink-600 to-pink-400 transition-all duration-500`}
                        style={{ width: `${(npc.friendship / 2500) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="absolute top-1 left-1 flex flex-col gap-1">
                  {npc.isMarried && <div className="w-2 h-2 bg-yellow-400 rounded-full border border-black" title="Spouse" />}
                  {npc.isDating && <div className="w-2 h-2 bg-pink-400 rounded-full border border-black" title="Dating" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat/Interaction Area */}
      <div className={`flex-1 h-full ${isChatOpen ? 'flex' : 'hidden md:flex'} flex-col overflow-hidden`}>
          {selectedNPC ? (
            <div className="pixel-card h-full flex flex-col overflow-hidden relative !bg-[#a67c52] border-white/20">
              {/* Mobile Back Button */}
              <button 
                onClick={closeChat}
                className="md:hidden absolute top-4 left-4 z-10 bg-black/50 p-2 rounded pixel-border"
              >
                <CheckCircle className="rotate-180 text-white" size={16} />
              </button>

              <div className="flex items-center gap-6 border-b border-white/20 pb-4 mb-4 mt-8 md:mt-0">
                <motion.img 
                  src={selectedNPC.avatar} 
                  alt={selectedNPC.name} 
                  className="w-24 h-24 pixelated" 
                  referrerPolicy="no-referrer"
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-pixel text-[13px] text-white">{selectedNPC.name}</h3>
                    {selectedNPC.isMarried && <span className="text-[10px] bg-yellow-500/40 text-yellow-200 px-1.5 rounded border border-yellow-500/30 font-pixel">Spouse</span>}
                    {selectedNPC.isDating && <span className="text-[10px] bg-pink-500/40 text-pink-200 px-1.5 rounded border border-pink-500/30 font-pixel">Dating</span>}
                  </div>
                  <p className="text-[13px] text-white/90 mt-1">{selectedNPC.description}</p>
                  <p className="text-[11px] text-white/70 mt-1 italic">Birthday: {selectedNPC.birthday}</p>
                  
                  <div className="mt-3">
                    <div className="flex justify-between items-center text-[10px] font-pixel mb-1">
                      <span className="text-pink-200">{getNextMilestone(selectedNPC).text}</span>
                      <span className="text-white">{selectedNPC.friendship} / {getNextMilestone(selectedNPC).target}</span>
                    </div>
                    <div className="w-full bg-black/50 h-3 pixel-border-inset relative overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 bg-gradient-to-r from-pink-600 to-pink-400 ${
                          selectedNPC.friendship >= getNextMilestone(selectedNPC).target ? 'shadow-[0_0_10px_rgba(255,0,110,0.6)]' : ''
                        }`} 
                        style={{ 
                          width: `${Math.min(100, (selectedNPC.friendship / getNextMilestone(selectedNPC).target) * 100)}%`,
                          boxShadow: selectedNPC.friendship >= getNextMilestone(selectedNPC).target ? 'inset 0 0 5px rgba(255,255,255,0.4), 0 0 10px rgba(255,0,110,0.8)' : 'inset 0 0 5px rgba(255,255,255,0.2)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-3 bg-black/30 pixel-border-inset rounded">
                {(!gameState.chatHistories?.[selectedNPC.id] || gameState.chatHistories[selectedNPC.id].length === 0) && (
                  <p className="text-center text-white/40 text-[13px] mt-10 font-pixel">Start a conversation with {selectedNPC.name}...</p>
                )}
                {(gameState.chatHistories?.[selectedNPC.id] || []).map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded pixel-border ${msg.role === 'user' ? 'bg-[#ff9e9e] text-black' : 'bg-[#9ed5ff] text-black'}`}>
                      {msg.imageUrl && (
                        <img src={msg.imageUrl} alt="Sent picture" className="w-full max-w-[200px] mb-2 pixelated border-2 border-black/20" referrerPolicy="no-referrer" />
                      )}
                      <p className="text-[13px] leading-tight font-medium">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#9ed5ff] text-black p-2 rounded pixel-border animate-pulse">
                      <p className="text-[13px] font-bold">...</p>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button 
                  onClick={() => setShowGiftModal(true)}
                  className="pixel-button-secondary flex items-center gap-2"
                >
                  <Gift size={14} /> Gift
                </button>
                <button 
                  onClick={handleAskOut}
                  disabled={selectedNPC.isMarried}
                  className={`pixel-button-secondary flex items-center gap-2 text-pink-300 ${selectedNPC.isMarried ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                >
                  <HeartHandshake size={14} /> {selectedNPC.isDating ? 'Dating' : 'Ask Out'}
                </button>
                {selectedNPC.isDating && (
                  <button 
                    onClick={handlePropose}
                    className="pixel-button-secondary flex items-center gap-2 text-yellow-400"
                  >
                    <Scroll size={14} /> Propose
                  </button>
                )}
                {selectedNPC.friendship >= 2500 && !selectedNPC.isFriend && (
                  <button 
                    onClick={() => {
                      sounds.playSuccess();
                      onUpdateNPC(selectedNPC.id, { isFriend: true });
                      onUpdateChatHistory(selectedNPC.id, { role: 'npc', text: "We're best friends now! I'll always be there for you." });
                      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
                    }}
                    className="pixel-button-secondary flex items-center gap-2 text-green-500"
                  >
                    <Users size={14} /> Best Friend
                  </button>
                )}
                {selectedNPC.isFriend && (
                  <button 
                    onClick={() => onUpdateNPC(selectedNPC.id, { isFriend: false })}
                    className="pixel-button-secondary flex items-center gap-2 text-red-300"
                  >
                    <Users size={14} /> Unfriend
                  </button>
                )}
              </div>

              {/* Quests Section */}
              {(availableQuests.length > 0 || activeQuests.length > 0) && (
                <div className="mb-4 space-y-2">
                  <h4 className="font-pixel text-[8px] opacity-50 uppercase tracking-widest">Quests</h4>
                  {availableQuests.map(quest => (
                    <div key={quest.id} className="pixel-card bg-yellow-900/20 border-yellow-500/30 p-2 flex justify-between items-center">
                      <div>
                        <p className="font-pixel text-[10px] text-yellow-400">{quest.title}</p>
                        <p className="text-[8px] opacity-70 mb-1">{quest.description}</p>
                        <div className="flex flex-wrap gap-2 text-[8px] font-pixel mb-1">
                          {quest.rewardMoney && <span className="text-yellow-300">{quest.rewardMoney}g</span>}
                          {quest.rewardFriendship && <span className="text-pink-300">+{quest.rewardFriendship} Friendship</span>}
                          {quest.rewardItem && <span className="text-blue-300">1x {quest.rewardItem.name}</span>}
                          {quest.rewardStats && (
                            <span className="text-red-300">
                              +{quest.rewardStats.attack ? `${quest.rewardStats.attack} ATK ` : ''}
                              +{quest.rewardStats.maxHealth ? `${quest.rewardStats.maxHealth} HP ` : ''}
                            </span>
                          )}
                          {quest.rewardRecipe && <span className="text-purple-300">Recipe: {quest.rewardRecipe}</span>}
                        </div>
                        {quest.expiresAt && (
                          <p className="text-[8px] text-red-400 font-pixel">Expires Day {quest.expiresAt}</p>
                        )}
                      </div>
                      <button 
                        onClick={() => onAcceptQuest(quest.id)}
                        className="pixel-button py-0.5 px-2 text-[8px]"
                      >
                        Accept
                      </button>
                    </div>
                  ))}
                  {activeQuests.map(quest => (
                    <div key={quest.id} className="pixel-card bg-blue-900/20 border-blue-500/30 p-2 flex justify-between items-center">
                      <div>
                        <p className="font-pixel text-[10px] text-blue-400">{quest.title}</p>
                        <p className="text-[8px] opacity-70">Status: Active</p>
                        {quest.expiresAt && (
                          <p className="text-[8px] text-red-400 font-pixel mt-1">Expires Day {quest.expiresAt}</p>
                        )}
                      </div>
                      <button 
                        onClick={() => onCompleteQuest(quest.id)}
                        disabled={!canCompleteQuest(quest)}
                        className={`pixel-button py-0.5 px-2 text-[8px] flex items-center gap-1 ${!canCompleteQuest(quest) ? 'opacity-50 grayscale' : ''}`}
                      >
                        <CheckCircle size={8} /> Complete
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                  placeholder="Say something..."
                  className="flex-1 bg-black/40 pixel-border-inset p-2 text-[13px] text-white placeholder-white/40 outline-none"
                />
                <button 
                  onClick={handleChat}
                  disabled={isTyping}
                  className="pixel-button p-2"
                >
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="pixel-card h-full flex items-center justify-center !bg-[#a67c52] border-white/20">
              <p className="font-pixel text-[13px] text-white opacity-60">Select a character to interact</p>
            </div>
          )}
        </div>

      {/* Gift Modal */}
      <AnimatePresence>
        {showGiftModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="pixel-card w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-pixel text-xs">Choose a Gift</h3>
                <button onClick={() => setShowGiftModal(false)} className="text-xs hover:text-red-400">X</button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {gameState.player.inventory.map((slot, i) => (
                  <div 
                    key={i}
                    onClick={() => slot && handleGift(i)}
                    className={`relative w-12 h-12 pixel-border-inset flex items-center justify-center cursor-pointer hover:bg-white/10 ${!slot ? 'opacity-20 pointer-events-none' : ''}`}
                  >
                    {slot?.item.icon}
                    {slot && slot.quantity > 1 && (
                      <span className="absolute bottom-0 right-0 font-pixel text-[8px] bg-black/50 px-1 rounded">
                        {slot.quantity}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {gameState.player.inventory.every(s => !s) && (
                <p className="text-center text-xs opacity-50 py-4">Your inventory is empty!</p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Event Modal */}
      <AnimatePresence>
        {activeEvent && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="pixel-card w-full max-w-lg bg-[#5d4037]"
            >
              <div className="flex items-center gap-4 mb-6">
                <img src={selectedNPC?.avatar} className="w-16 h-16 pixelated" referrerPolicy="no-referrer" />
                <div>
                  <h2 className="font-pixel text-xs text-yellow-400">{activeEvent.title}</h2>
                  <p className="text-[10px] opacity-70">Heart Event with {selectedNPC?.name}</p>
                </div>
              </div>
              
              <p className="text-sm mb-8 leading-relaxed">{activeEvent.description}</p>
              
              <div className="space-y-3">
                {activeEvent.choices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleEventChoice(choice)}
                    className="w-full pixel-button-secondary text-left text-xs p-4 hover:bg-[#795548]"
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
