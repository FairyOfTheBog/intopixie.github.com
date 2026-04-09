export type Gender = 'Male' | 'Female';

export interface CharacterStats {
  health: number;
  maxHealth: number;
  attack: number;
  energy: number;
  maxEnergy: number;
  luck?: number;
}

export interface CharacterMakerState {
  skin: string;
  hair: string;
  hairColor: string;
  outfit: string;
  accessory: string;
  avatar: string;
}

export type Rarity = 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS' | 'SSR';

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  sprite?: string;
  type: 'gift' | 'food' | 'resource' | 'tool';
  value: number;
  rarity: Rarity;
  effects?: Partial<CharacterStats>;
}

export interface InventoryItem {
  item: Item;
  quantity: number;
  acquiredAt: number; // timestamp
}

export interface NPC {
  id: string;
  name: string;
  description: string;
  avatar: string;
  gender: Gender;
  birthday: string;
  loves: string[]; // item IDs
  likes: string[]; // item IDs
  dislikes: string[]; // item IDs
  hates: string[]; // item IDs
  personality: string;
  friendship: number; // 0-2500 (10 hearts, 250 per heart)
  isDating: boolean;
  isMarried: boolean;
  isFriend?: boolean;
  lastInteractionDay?: number;
}

export interface CalendarEvent {
  day: number;
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter';
  name: string;
  description: string;
}

export interface DailyEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'festival' | 'weather' | 'npc_event' | 'luck';
  effects?: {
    friendshipMultiplier?: number;
    shopDiscount?: number;
    luckBonus?: number;
    specialQuestId?: string;
  };
}

export interface HeartEvent {
  id: string;
  npcId: string;
  requiredFriendship: number;
  title: string;
  description: string;
  choices: {
    text: string;
    friendshipImpact: number;
    nextDialogue?: string;
  }[];
  isTriggered: boolean;
}

export type QuestType = 'fetch' | 'delivery' | 'interaction';

export interface Quest {
  id: string;
  title: string;
  description: string;
  giverId: string;
  type: QuestType;
  targetId?: string; // NPC ID for delivery or interaction
  targetItemId?: string; // Item ID for fetch or delivery
  targetQuantity?: number;
  rewardMoney?: number;
  rewardFriendship?: number;
  rewardItem?: Item;
  rewardStats?: Partial<CharacterStats>;
  rewardRecipe?: string;
  expiresAt?: number; // Day number when the quest expires
  status: 'available' | 'active' | 'completed' | 'expired';
  requiredFriendship?: number; // Friendship level required to unlock this quest
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'avatar' | 'border' | 'background' | 'item';
  image?: string;
  item?: Item;
}

export interface GameState {
  player: {
    name: string;
    gender: Gender;
    role: string;
    stats: CharacterStats;
    appearance: CharacterMakerState;
    inventory: (InventoryItem | null)[];
    money: number;
    recipes: string[];
    level: number;
    experience: number;
    maxExperience: number;
    ownedAvatars: string[];
    ownedBorders: string[];
    ownedBackgrounds: string[];
    currentBorder?: string;
    currentBackground?: string;
  };
  npcs: NPC[];
  quests: Quest[];
  hasCreatedCharacter: boolean;
  currentDay: number;
  currentTime: number; // minutes from midnight, e.g., 360 = 6:00 AM
  currentDailyEvent?: DailyEvent | null;
  friendships: Record<string, number>;
  triggeredEvents: string[]; // IDs of events already seen
  lastSpinDate?: string; // YYYY-MM-DD
  spinCount?: number;
  chatHistories?: Record<string, { role: 'user' | 'npc', text: string }[]>;
}
