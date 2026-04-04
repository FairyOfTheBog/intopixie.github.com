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
      const response = await chatWithNPC(selectedNPC, userMsg, gameState.player);
      
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
      const reaction = await getGiftReaction(selectedNPC, item.name, gameState.player);
      
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
      onUpdateChatHistory(selectedNPC.id, { role: 'npc', text: "We're already dating, silly!" });
      return;
    }

    sounds.playSuccess();
    onUpdateNPC(selectedNPC.id, { isDating: true });
    onRecordInteraction(selectedNPC.id);
    onUpdateChatHistory(selectedNPC.id, { role: 'npc', text: "Oh! I'd love to go out with you! ❤️" });
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff006e', '#ff85a1']
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

  const getNextMilestone = (friendship: number) => {
    if (friendship < 500) return { text: "Next: 2 Hearts (New Quests/Events)", target: 500 };
    if (friendship < 1000) return { text: "Next: 4 Hearts (New Quests/Events)", target: 1000 };
    if (friendship < 1500) return { text: "Next: 6 Hearts (New Quests/Events)", target: 1500 };
    if (friendship < 2000) return { text: "Next: 8 Hearts (Can Ask Out)", target: 2000 };
    if (friendship < 2500) return { text: "Next: 10 Hearts (Best Friend)", target: 2500 };
    return { text: "Max Friendship Reached!", target: 2500 };
  };

  return (
    <div className="w-full max-w-5xl mx-auto h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full overflow-hidden">
        {/* NPC List - Hidden on mobile if chat is open */}
        <div className={`md:col-span-1 flex flex-col gap-2 h-full ${isChatOpen ? 'hidden md:flex' : 'flex'}`}>
          <h2 className="font-pixel text-xs mb-4 pixel-text-shadow">Characters</h2>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
            {gameState.npcs.map(npc => {
              const questStatus = (gameState.quests || []).find(q => 
                q.giverId === npc.id && 
                (q.status === 'active' || (q.status === 'available' && (q.requiredFriendship === undefined || npc.friendship >= q.requiredFriendship)))
              )?.status;

              return (
                <div 
                  key={npc.id}
                  onClick={() => handleNPCSelect(npc)}
                  className={`pixel-card cursor-pointer transition-all hover:translate-x-1 flex items-center gap-3 relative ${selectedNPC?.id === npc.id ? 'bg-[#5d4037] border-white' : ''}`}
                >
                  <div className="relative">
                    <img src={npc.avatar} alt={npc.name} className="w-10 h-10 pixelated" referrerPolicy="no-referrer" />
                    {questStatus === 'available' && (
                      <div className="absolute -top-1 -right-1 bg-yellow-400 text-black font-pixel text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-black animate-bounce">
                        !
                      </div>
                    )}
                    {questStatus === 'active' && (
                      <div className="absolute -top-1 -right-1 bg-blue-400 text-white font-pixel text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-black animate-pulse">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-pixel text-[10px]">{npc.name}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(10)].map((_, i) => (
                        <Heart 
                          key={i} 
                          size={6} 
                          fill={i < Math.floor(npc.friendship / 250) ? "#ff006e" : "transparent"} 
                          color={i < Math.floor(npc.friendship / 250) ? "#ff006e" : "#666"} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat/Interaction Area - Fullscreen on mobile if chat is open */}
        <div className={`md:col-span-2 h-full ${isChatOpen ? 'flex' : 'hidden md:flex'} flex-col`}>
          {selectedNPC ? (
            <div className="pixel-card h-full flex flex-col overflow-hidden relative">
              {/* Mobile Back Button */}
              <button 
                onClick={closeChat}
                className="md:hidden absolute top-4 left-4 z-10 bg-black/50 p-2 rounded pixel-border"
              >
                <CheckCircle className="rotate-180" size={16} />
              </button>

              <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-4 mt-8 md:mt-0">
                <img src={selectedNPC.avatar} alt={selectedNPC.name} className="w-16 h-16 pixelated" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <h3 className="font-pixel text-sm">{selectedNPC.name}</h3>
                  <p className="text-xs opacity-70">{selectedNPC.description}</p>
                  <p className="text-[10px] mt-1 italic">Birthday: {selectedNPC.birthday}</p>
                  
                  <div className="mt-2">
                    <div className="flex justify-between items-center text-[8px] font-pixel mb-1">
                      <span className="text-pink-300">{getNextMilestone(selectedNPC.friendship).text}</span>
                      <span>{selectedNPC.friendship} / {getNextMilestone(selectedNPC.friendship).target}</span>
                    </div>
                    <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden pixel-border-inset">
                      <div 
                        className="bg-[#ff006e] h-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (selectedNPC.friendship / getNextMilestone(selectedNPC.friendship).target) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2 bg-black/20 pixel-border-inset rounded">
                {(!gameState.chatHistories?.[selectedNPC.id] || gameState.chatHistories[selectedNPC.id].length === 0) && (
                  <p className="text-center opacity-40 text-xs mt-10">Start a conversation with {selectedNPC.name}...</p>
                )}
                {(gameState.chatHistories?.[selectedNPC.id] || []).map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-2 rounded pixel-border ${msg.role === 'user' ? 'bg-[#ff9e9e] text-black' : 'bg-[#9ed5ff] text-black'}`}>
                      {msg.imageUrl && (
                        <img src={msg.imageUrl} alt="Sent picture" className="w-full max-w-[150px] mb-2 pixelated border-2 border-black/20" referrerPolicy="no-referrer" />
                      )}
                      <p className="text-[11pt] leading-tight font-medium">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#9ed5ff] text-black p-2 rounded pixel-border animate-pulse">
                      <p className="text-xs font-bold">...</p>
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
                  className="pixel-button-secondary flex items-center gap-2 text-pink-300"
                >
                  <HeartHandshake size={14} /> Ask Out
                </button>
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
                  className="flex-1 bg-[#2c1e1e] pixel-border-inset p-1.5 text-[10px] outline-none"
                />
                <button 
                  onClick={handleChat}
                  disabled={isTyping}
                  className="pixel-button p-1.5"
                >
                  <MessageSquare size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="pixel-card h-full flex items-center justify-center opacity-50">
              <p className="font-pixel text-xs">Select a character to interact</p>
            </div>
          )}
        </div>
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
