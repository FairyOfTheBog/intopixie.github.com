import { CalendarEvent, Item, NPC, HeartEvent, Quest, DailyEvent, ShopItem } from "./types";

export const ITEMS: Item[] = [
  { id: 'quartz', name: 'Quartz', description: 'A clear crystal commonly found in caves.', icon: '💎', sprite: 'https://github.com/FairyOfTheBog/myimgsources/blob/main/Quartz.png?raw=true', type: 'gift', value: 25, rarity: 'C' },
  { id: 'salad', name: 'Salad', description: 'A healthy garden salad.', icon: '🥗', type: 'food', value: 40, rarity: 'C', effects: { health: 20, energy: 30 } },
  { id: 'coffee', name: 'Coffee', description: 'It smells great. This will surely give you a boost.', icon: '☕', sprite: 'https://github.com/FairyOfTheBog/myimgsources/blob/main/Coffee.png?raw=true', type: 'food', value: 150, rarity: 'B', effects: { energy: 50 } },
  { id: 'sashimi', name: 'Sashimi', description: 'Raw fish sliced into thin pieces.', icon: '🍣', type: 'food', value: 75, rarity: 'C', effects: { health: 15, energy: 20 } },
  { id: 'beer', name: 'Beer', description: 'Drink in moderation.', icon: '🍺', type: 'food', value: 200, rarity: 'B', effects: { energy: -10, health: 5 } },
  { id: 'cloth', name: 'Cloth', description: 'A bolt of fine wool cloth.', icon: '🧶', type: 'gift', value: 470, rarity: 'A' },
  { id: 'diamond', name: 'Diamond', description: 'A rare and valuable gem.', icon: '💎', sprite: 'https://github.com/FairyOfTheBog/myimgsources/blob/main/Diamond.png?raw=true', type: 'gift', value: 750, rarity: 'S' },
  { id: 'pumpkin', name: 'Pumpkin', description: 'A fall favorite.', icon: '🎃', type: 'gift', value: 320, rarity: 'B' },
  { id: 'sunflower', name: 'Sunflower', description: 'A bright and happy flower.', icon: '🌻', type: 'gift', value: 80, rarity: 'C' },
  { id: 'mayonnaise', name: 'Mayonnaise', description: 'Lookin\' good.', icon: '🍯', type: 'gift', value: 190, rarity: 'C' },
  { id: 'prismatic_shard', name: 'Prismatic Shard', description: 'A very rare and powerful gem.', icon: '🌈', sprite: 'https://github.com/FairyOfTheBog/myimgsources/blob/main/Prismatic_Shard.png?raw=true', type: 'gift', value: 2000, rarity: 'SSR' },
  { id: 'golden_egg', name: 'Golden Egg', description: 'A rare egg from a golden chicken.', icon: '🥚', type: 'gift', value: 1000, rarity: 'SS' },
  { id: 'frozen_tear', name: 'Frozen Tear', description: 'A crystal supposed to be the frozen tears of a yeti.', icon: '💧', sprite: 'https://github.com/FairyOfTheBog/myimgsources/blob/main/Frozen_Tear.png?raw=true', type: 'gift', value: 75, rarity: 'B' },
  { id: 'lucky_lunch', name: 'Lucky Lunch', description: 'A special meal that brings good luck.', icon: '🍱', sprite: 'https://github.com/FairyOfTheBog/myimgsources/blob/main/Lucky_Lunch.png?raw=true', type: 'food', value: 250, rarity: 'A', effects: { health: 40, energy: 60, luck: 0.2 } },
  { id: 'pizza', name: 'Pizza', description: 'It\'s popular for all the right reasons.', icon: '🍕', sprite: 'https://github.com/FairyOfTheBog/myimgsources/blob/main/Pizza.png?raw=true', type: 'food', value: 300, rarity: 'B', effects: { health: 30, energy: 50 } },
];

export const HEART_EVENTS: HeartEvent[] = [
  {
    id: 'abigail_2heart',
    npcId: 'abigail',
    requiredFriendship: 500,
    title: 'Video Game Night',
    description: 'Abigail is struggling with a difficult level in her favorite game. She asks for your help.',
    choices: [
      { text: 'Help her beat the level', friendshipImpact: 50 },
      { text: 'Watch and cheer her on', friendshipImpact: 30 },
      { text: 'Tell her it\'s just a game', friendshipImpact: -50 },
    ],
    isTriggered: false,
  },
  {
    id: 'abigail_6heart',
    npcId: 'abigail',
    requiredFriendship: 1500,
    title: 'Graveyard Encounter',
    description: 'You find Abigail in the graveyard at night practicing with her sword.',
    choices: [
      { text: 'Offer to spar with her', friendshipImpact: 60 },
      { text: 'Ask her what she\'s doing', friendshipImpact: 20 },
      { text: 'Tell her it\'s dangerous and she should go home', friendshipImpact: -40 },
    ],
    isTriggered: false,
  },
  {
    id: 'sebastian_4heart',
    npcId: 'sebastian',
    requiredFriendship: 1000,
    title: 'The Rain',
    description: 'You find Sebastian standing in the rain on the pier. He seems lost in thought.',
    choices: [
      { text: 'Stand with him in silence', friendshipImpact: 40 },
      { text: 'Ask him what he\'s thinking about', friendshipImpact: 20 },
      { text: 'Tell him he\'ll catch a cold', friendshipImpact: -10 },
    ],
    isTriggered: false,
  },
  {
    id: 'sebastian_8heart',
    npcId: 'sebastian',
    requiredFriendship: 2000,
    title: 'Motorcycle Ride',
    description: 'Sebastian invites you for a ride on his motorcycle to see the city lights.',
    choices: [
      { text: 'Hop on excitedly', friendshipImpact: 80 },
      { text: 'Ask if it\'s safe first', friendshipImpact: 10 },
      { text: 'Refuse, motorcycles are too loud', friendshipImpact: -60 },
    ],
    isTriggered: false,
  },
  {
    id: 'leah_6heart',
    npcId: 'leah',
    requiredFriendship: 1500,
    title: 'Art Exhibition',
    description: 'Leah is nervous about her upcoming art show. She wants your honest opinion on her latest sculpture.',
    choices: [
      { text: 'It\'s a masterpiece!', friendshipImpact: 60 },
      { text: 'I can see the hard work you put in', friendshipImpact: 30 },
      { text: 'It\'s... interesting', friendshipImpact: 0 },
    ],
    isTriggered: false,
  },
  {
    id: 'alex_2heart',
    npcId: 'alex',
    requiredFriendship: 500,
    title: 'Beach Workout',
    description: 'Alex is tossing a gridball on the beach. He asks if you want to play catch.',
    choices: [
      { text: 'Sure, I\'d love to!', friendshipImpact: 40 },
      { text: 'I\'m not very good at sports...', friendshipImpact: 10 },
      { text: 'I don\'t have time for games.', friendshipImpact: -30 },
    ],
    isTriggered: false,
  },
  {
    id: 'haley_4heart',
    npcId: 'haley',
    requiredFriendship: 1000,
    title: 'Lost Bracelet',
    description: 'Haley is frantically searching for her great-grandmother\'s bracelet.',
    choices: [
      { text: 'Help her look for it', friendshipImpact: 50 },
      { text: 'Tell her she probably just misplaced it', friendshipImpact: -10 },
      { text: 'Ignore her and walk away', friendshipImpact: -50 },
    ],
    isTriggered: false,
  }
];

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'abigail_quartz',
    title: 'A Tasty Snack',
    description: 'Abigail is looking for a "tasty" Quartz to snack on. Don\'t ask.',
    giverId: 'abigail',
    type: 'delivery',
    targetItemId: 'quartz',
    targetQuantity: 1,
    rewardMoney: 100,
    rewardFriendship: 50,
    status: 'available'
  },
  {
    id: 'leah_salad',
    title: 'Healthy Lunch',
    description: 'Leah is busy sculpting and forgot to pack a lunch. She\'d love a fresh Salad.',
    giverId: 'leah',
    type: 'delivery',
    targetItemId: 'salad',
    targetQuantity: 1,
    rewardMoney: 150,
    rewardFriendship: 75,
    expiresAt: 3,
    status: 'available'
  },
  {
    id: 'alex_training',
    title: 'Strength Training',
    description: 'Alex wants to help you get stronger. Bring him a Salad to fuel the workout.',
    giverId: 'alex',
    type: 'delivery',
    targetItemId: 'salad',
    targetQuantity: 1,
    rewardStats: { energy: 20, maxEnergy: 20 },
    rewardFriendship: 50,
    status: 'available'
  },
  {
    id: 'gus_secret_recipe',
    title: 'Secret Recipe',
    description: 'Gus will teach you a secret recipe if you bring him a Diamond for his collection.',
    giverId: 'gus',
    type: 'delivery',
    targetItemId: 'diamond',
    targetQuantity: 1,
    rewardRecipe: 'Spicy Eel',
    rewardFriendship: 100,
    status: 'available'
  },
  {
    id: 'harvey_coffee',
    title: 'Doctor\'s Orders',
    description: 'Harvey has been working late at the clinic. A hot Coffee would help him stay awake.',
    giverId: 'harvey',
    type: 'delivery',
    targetItemId: 'coffee',
    targetQuantity: 1,
    rewardMoney: 200,
    rewardFriendship: 100,
    expiresAt: 2,
    status: 'available'
  },
  {
    id: 'abigail_adventure',
    title: 'Adventure Time',
    description: 'Abigail wants to explore the mines but needs a better weapon. Bring her a Diamond to trade for one.',
    giverId: 'abigail',
    type: 'delivery',
    targetItemId: 'diamond',
    targetQuantity: 1,
    rewardMoney: 500,
    rewardFriendship: 200,
    requiredFriendship: 500, // Requires 2 hearts
    status: 'available'
  },
  {
    id: 'leah_inspiration',
    title: 'Artistic Inspiration',
    description: 'Leah is looking for inspiration for her next sculpture. She needs a rare Quartz.',
    giverId: 'leah',
    type: 'delivery',
    targetItemId: 'quartz',
    targetQuantity: 1,
    rewardStats: { energy: 20, maxEnergy: 20 },
    rewardFriendship: 150,
    requiredFriendship: 1000, // Requires 4 hearts
    status: 'available'
  }
];

export const TERRARIA_ROLES = [
  'Guide', 'Merchant', 'Nurse', 'Demolitionist', 'Dryad', 'Arms Dealer', 'Old Man', 'Clothier', 'Mechanic', 'Goblin Tinkerer', 'Wizard', 'Truffle', 'Steampunker', 'Dye Trader', 'Party Girl', 'Cyborg', 'Painter', 'Witch Doctor', 'Pirate', 'Stylist', 'Angler', 'Tax Collector', 'Tavernkeep', 'Golfer', 'Zoologist', 'Princess'
];

export const NPCS: NPC[] = [
  // Bachelors
  { id: 'alex', name: 'Alex', description: 'Alex loves sports and hanging out at the beach.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/7/77/Alex.png', gender: 'Male', birthday: 'Summer 13', loves: ['complete_breakfast', 'salmon_dinner'], likes: ['egg'], dislikes: ['quartz'], hates: ['holly'], personality: 'Athletic, arrogant but sweet once you get to know him.', friendship: 0, isDating: false, isMarried: false },
  { id: 'elliott', name: 'Elliott', description: 'Elliott is a writer who lives in a cabin on the beach.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/b/bd/Elliott.png', gender: 'Male', birthday: 'Fall 5', loves: ['crab_cakes', 'duck_feather', 'lobster'], likes: ['quartz'], dislikes: ['pizza'], hates: ['amaranth'], personality: 'Romantic, poetic, and a bit dramatic.', friendship: 0, isDating: false, isMarried: false },
  { id: 'harvey', name: 'Harvey', description: 'Harvey is the town doctor.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/9/95/Harvey.png', gender: 'Male', birthday: 'Winter 14', loves: ['coffee', 'pickles', 'super_meal'], likes: ['quartz', 'mayonnaise'], dislikes: ['beer'], hates: ['clay'], personality: 'Nervous, dedicated, loves model planes.', friendship: 0, isDating: false, isMarried: false },
  { id: 'sam', name: 'Sam', description: 'Sam is an outgoing guy who loves music and skating.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/9/94/Sam.png', gender: 'Male', birthday: 'Summer 17', loves: ['cactus_fruit', 'maple_bar', 'pizza'], likes: ['egg'], dislikes: ['mayonnaise'], hates: ['clay'], personality: 'Friendly, energetic, plays in a band.', friendship: 0, isDating: false, isMarried: false },
  { id: 'sebastian', name: 'Sebastian', description: 'Sebastian is a rebellious loner.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/a/a8/Sebastian.png', gender: 'Male', birthday: 'Winter 10', loves: ['sashimi', 'frozen_tear', 'obsidian'], likes: ['quartz', 'coffee'], dislikes: ['mayonnaise'], hates: ['clay'], personality: 'Quiet, computer programmer, emo vibe.', friendship: 0, isDating: false, isMarried: false },
  { id: 'shane', name: 'Shane', description: 'Shane works at JojaMart and loves chickens.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/8/8b/Shane.png', gender: 'Male', birthday: 'Spring 20', loves: ['beer', 'hot_pepper', 'pizza'], likes: ['mayonnaise'], dislikes: ['quartz'], hates: ['clay'], personality: 'Grumpy, struggling, but has a soft spot for chickens.', friendship: 0, isDating: false, isMarried: false },
  
  // Bachelorettes
  { id: 'abigail', name: 'Abigail', description: 'Abigail loves video games and adventures.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/8/88/Abigail.png', gender: 'Female', birthday: 'Fall 13', loves: ['quartz', 'pumpkin', 'chocolate_cake'], likes: ['diamond'], dislikes: ['mayonnaise'], hates: ['clay'], personality: 'Spunky, adventurous, loves video games.', friendship: 0, isDating: false, isMarried: false },
  { id: 'emily', name: 'Emily', description: 'Emily is spiritual and loves making clothes.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/2/28/Emily.png', gender: 'Female', birthday: 'Spring 27', loves: ['cloth', 'ruby', 'amethyst'], likes: ['quartz', 'daffodil'], dislikes: ['mayonnaise'], hates: ['clay'], personality: 'Spiritual, positive, unique energy.', friendship: 0, isDating: false, isMarried: false },
  { id: 'haley', name: 'Haley', description: 'Haley loves photography and fashion.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/1/1b/Haley.png', gender: 'Female', birthday: 'Spring 14', loves: ['coconut', 'fruit_salad', 'pink_cake', 'sunflower'], likes: ['daffodil'], dislikes: ['quartz'], hates: ['clay'], personality: 'Vain at first, but grows to appreciate the simple life.', friendship: 0, isDating: false, isMarried: false },
  { id: 'leah', name: 'Leah', description: 'Leah is an artist who lives in a cabin.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/e/e6/Leah.png', gender: 'Female', birthday: 'Winter 23', loves: ['salad', 'wine', 'goat_cheese'], likes: ['sunflower', 'quartz'], dislikes: ['mayonnaise'], hates: ['clay'], personality: 'Artist, nature lover, talented sculptor.', friendship: 0, isDating: false, isMarried: false },
  { id: 'maru', name: 'Maru', description: 'Maru is a scientist and inventor.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/f/f8/Maru.png', gender: 'Female', birthday: 'Summer 10', loves: ['battery_pack', 'cauliflower', 'diamond', 'gold_bar'], likes: ['quartz'], dislikes: ['honey'], hates: ['holly'], personality: 'Intelligent, curious, loves building robots.', friendship: 0, isDating: false, isMarried: false },
  { id: 'penny', name: 'Penny', description: 'Penny is a quiet bookworm who teaches Jas and Vincent.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/a/ab/Penny.png', gender: 'Female', birthday: 'Fall 2', loves: ['diamond', 'emerald', 'melon', 'poppy'], likes: ['dandelion'], dislikes: ['quartz'], hates: ['beer'], personality: 'Shy, kind, loves reading and children.', friendship: 0, isDating: false, isMarried: false },

  // Non-marriage Candidates
  { id: 'caroline', name: 'Caroline', description: 'Caroline manages the general store with Pierre.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/8/87/Caroline.png', gender: 'Female', birthday: 'Winter 7', loves: ['fish_taco', 'summer_spangle'], likes: ['daffodil'], dislikes: ['quartz'], hates: ['salmonberry'], personality: 'Kind, loves her tea room.', friendship: 0, isDating: false, isMarried: false },
  { id: 'clint', name: 'Clint', description: 'Clint is the town blacksmith.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/3/31/Clint.png', gender: 'Male', birthday: 'Winter 26', loves: ['amethyst', 'aquamarine', 'emerald', 'gold_bar'], likes: ['iron_bar'], dislikes: ['quartz'], hates: ['holly'], personality: 'Lonely, shy, skilled blacksmith.', friendship: 0, isDating: false, isMarried: false },
  { id: 'demetrius', name: 'Demetrius', description: 'Demetrius is a scientist who studies the local wildlife.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/f/f9/Demetrius.png', gender: 'Male', birthday: 'Summer 19', loves: ['bean_hotpot', 'ice_cream', 'rice_pudding'], likes: ['egg'], dislikes: ['quartz'], hates: ['holly'], personality: 'Academic, protective father.', friendship: 0, isDating: false, isMarried: false },
  { id: 'evelyn', name: 'Evelyn', description: 'Evelyn is the town\'s grandmother.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/8/8e/Evelyn.png', gender: 'Female', birthday: 'Winter 20', loves: ['beet', 'chocolate_cake', 'diamond', 'tulip'], likes: ['daffodil'], dislikes: ['quartz'], hates: ['holly'], personality: 'Sweet, loves gardening and baking.', friendship: 0, isDating: false, isMarried: false },
  { id: 'george', name: 'George', description: 'George is a grumpy old man in a wheelchair.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/7/78/George.png', gender: 'Male', birthday: 'Fall 24', loves: ['fried_mushroom', 'leek'], likes: ['daffodil'], dislikes: ['quartz'], hates: ['dandelion'], personality: 'Grumpy, but has a soft heart.', friendship: 0, isDating: false, isMarried: false },
  { id: 'gus', name: 'Gus', description: 'Gus owns and runs the Stardrop Saloon.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/5/52/Gus.png', gender: 'Male', birthday: 'Summer 8', loves: ['diamond', 'escargot', 'fish_taco', 'orange'], likes: ['daffodil'], dislikes: ['quartz'], hates: ['holly'], personality: 'Jovial, generous, loves cooking.', friendship: 0, isDating: false, isMarried: false },
  { id: 'jas', name: 'Jas', description: 'Jas is a young girl who lives at Marnie\'s ranch.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/5/55/Jas.png', gender: 'Female', birthday: 'Summer 4', loves: ['fairy_rose', 'pink_cake', 'plum_pudding'], likes: ['daffodil'], dislikes: ['quartz'], hates: ['holly'], personality: 'Shy, imaginative.', friendship: 0, isDating: false, isMarried: false },
  { id: 'jodi', name: 'Jodi', description: 'Jodi is a busy mother living in Pelican Town.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/4/41/Jodi.png', gender: 'Female', birthday: 'Fall 11', loves: ['chocolate_cake', 'crispy_bass', 'diamond', 'eggplant_parmesan'], likes: ['egg'], dislikes: ['quartz'], hates: ['dandelion'], personality: 'Hardworking, stressed but loving.', friendship: 0, isDating: false, isMarried: false },
  { id: 'kent', name: 'Kent', description: 'Kent is a soldier who recently returned from the war.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/9/99/Kent.png', gender: 'Male', birthday: 'Spring 4', loves: ['fiddlehead_risotto', 'roasted_hazelnuts'], likes: ['egg'], dislikes: ['quartz'], hates: ['holly'], personality: 'Serious, struggling with PTSD.', friendship: 0, isDating: false, isMarried: false },
  { id: 'lewis', name: 'Lewis', description: 'Lewis is the long-time mayor of Pelican Town.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/2/2b/Lewis.png', gender: 'Male', birthday: 'Spring 7', loves: ['autumns_bounty', 'glazed_yams', 'hot_pepper'], likes: ['blueberry'], dislikes: ['quartz'], hates: ['holly'], personality: 'Dedicated, slightly secretive.', friendship: 0, isDating: false, isMarried: false },
  { id: 'linus', name: 'Linus', description: 'Linus lives in a tent near the mines.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/3/3b/Linus.png', gender: 'Male', birthday: 'Winter 3', loves: ['blueberry_tart', 'cactus_fruit', 'coconut', 'yam'], likes: ['daffodil'], dislikes: ['quartz'], hates: ['holly'], personality: 'Wise, misunderstood, nature-loving.', friendship: 0, isDating: false, isMarried: false },
  { id: 'marnie', name: 'Marnie', description: 'Marnie runs the local animal ranch.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/5/52/Marnie.png', gender: 'Female', birthday: 'Fall 18', loves: ['diamond', 'farmer_lunch', 'pink_cake', 'pumpkin_pie'], likes: ['egg'], dislikes: ['quartz'], hates: ['holly'], personality: 'Kind, loves animals.', friendship: 0, isDating: false, isMarried: false },
  { id: 'pam', name: 'Pam', description: 'Pam is the town bus driver.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/d/da/Pam.png', gender: 'Female', birthday: 'Spring 18', loves: ['beer', 'cactus_fruit', 'glazed_yams', 'mead', 'pale_ale', 'parsnip'], likes: ['daffodil'], dislikes: ['quartz'], hates: ['holly'], personality: 'Rough around the edges, loves her drinks.', friendship: 0, isDating: false, isMarried: false },
  { id: 'pierre', name: 'Pierre', description: 'Pierre runs the local general store.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/7/7e/Pierre.png', gender: 'Male', birthday: 'Spring 26', loves: ['fried_calamari'], likes: ['egg'], dislikes: ['quartz'], hates: ['corn'], personality: 'Ambitious, competitive.', friendship: 0, isDating: false, isMarried: false },
  { id: 'robin', name: 'Robin', description: 'Robin is the town carpenter.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/1/1b/Robin.png', gender: 'Female', birthday: 'Fall 21', loves: ['goat_cheese', 'peach', 'spaghetti'], likes: ['quartz'], dislikes: ['holly'], hates: ['clay'], personality: 'Hardworking, skilled, friendly.', friendship: 0, isDating: false, isMarried: false },
  { id: 'sandy', name: 'Sandy', description: 'Sandy runs the Oasis in the Calico Desert.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/4/4e/Sandy.png', gender: 'Female', birthday: 'Fall 15', loves: ['crocus', 'daffodil', 'sweet_pea'], likes: ['quartz'], dislikes: ['holly'], hates: ['clay'], personality: 'Cheerful, lonely in the desert.', friendship: 0, isDating: false, isMarried: false },
  { id: 'vincent', name: 'Vincent', description: 'Vincent is a young boy who lives with Jodi and Kent.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/f/f1/Vincent.png', gender: 'Male', birthday: 'Spring 10', loves: ['cranberry_candy', 'ginger_ale', 'grape', 'pink_cake'], likes: ['daffodil'], dislikes: ['quartz'], hates: ['holly'], personality: 'Energetic, imaginative.', friendship: 0, isDating: false, isMarried: false },
  { id: 'willy', name: 'Willy', description: 'Willy is the town fisherman.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/0/02/Willy.png', gender: 'Male', birthday: 'Summer 24', loves: ['catfish', 'diamond', 'iridium_bar', 'octopus', 'pumpkin', 'sea_cucumber', 'sturgeon'], likes: ['quartz'], dislikes: ['beer'], hates: ['holly'], personality: 'Salty, wise, loves the sea.', friendship: 0, isDating: false, isMarried: false },
  { id: 'wizard', name: 'Wizard', description: 'The Wizard lives in a tower in the forest.', avatar: 'https://stardewvalleywiki.com/mediawiki/images/c/c3/Wizard.png', gender: 'Male', birthday: 'Winter 17', loves: ['purple_mushroom', 'solar_essence', 'super_cucumber', 'void_essence'], likes: ['quartz'], dislikes: ['daffodil'], hates: ['holly'], personality: 'Mysterious, powerful, reclusive.', friendship: 0, isDating: false, isMarried: false },
];

export const AVATARS = [
  'https://i.pinimg.com/736x/31/83/47/31834799ce867ff11047f0f2502ddc38.jpg', // Default
  'https://stardewvalleywiki.com/mediawiki/images/8/88/Abigail.png',
  'https://stardewvalleywiki.com/mediawiki/images/a/a8/Sebastian.png',
  'https://stardewvalleywiki.com/mediawiki/images/e/e6/Leah.png',
  'https://stardewvalleywiki.com/mediawiki/images/9/95/Harvey.png',
  'https://stardewvalleywiki.com/mediawiki/images/1/1b/Haley.png',
  'https://stardewvalleywiki.com/mediawiki/images/9/94/Sam.png'
];

export const SKIN_COLORS = ['#f5d0c5', '#e8b5a0', '#c68642', '#8d5524', '#3c2e28'];
export const HAIR_COLORS = ['#4a2c2a', '#2c1e1e', '#8b5e34', '#d4a373', '#9b2226', '#5a189a', '#0077b6'];

export const SHOP_ITEMS: ShopItem[] = [
  // Items
  { id: 'shop_diamond', name: 'Diamond', description: 'A rare and valuable gem.', price: 1000, type: 'item', item: ITEMS.find(i => i.id === 'diamond') },
  { id: 'shop_coffee', name: 'Coffee', description: 'Gives you a boost of energy.', price: 300, type: 'item', item: ITEMS.find(i => i.id === 'coffee') },
  { id: 'shop_prismatic', name: 'Prismatic Shard', description: 'One of the rarest items in the world.', price: 5000, type: 'item', item: ITEMS.find(i => i.id === 'prismatic_shard') },
  
  // Avatars
  { id: 'avatar_wizard', name: 'Wizard Avatar', description: 'Look like the local wizard.', price: 1500, type: 'avatar', image: 'https://stardewvalleywiki.com/mediawiki/images/c/c3/Wizard.png' },
  { id: 'avatar_krobus', name: 'Krobus Avatar', description: 'A friendly shadow person.', price: 2000, type: 'avatar', image: 'https://stardewvalleywiki.com/mediawiki/images/7/71/Krobus.png' },
  
  // Borders
  { id: 'border_gold', name: 'Golden Border', description: 'A shiny gold border for your profile.', price: 1000, type: 'border' },
  { id: 'border_magic', name: 'Magic Glow', description: 'A mystical purple glow.', price: 2500, type: 'border' },
  
  // Backgrounds
  { id: 'bg_forest', name: 'Secret Woods', description: 'A lush forest background.', price: 1200, type: 'background', image: 'https://stardewvalleywiki.com/mediawiki/images/b/ba/Secret_Woods.png' },
  { id: 'bg_desert', name: 'Calico Desert', description: 'A dry desert background.', price: 1200, type: 'background', image: 'https://stardewvalleywiki.com/mediawiki/images/5/53/Desert.png' },
];

export const HAIR_STYLES = [
  'https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260403202912.png?raw=true',
  'https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260403210719.png?raw=true',
  'https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260403213420.png?raw=true',
  'https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260403214314.png?raw=true',
  'https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260404082545.png?raw=true'
];
export const OUTFITS = [
  'https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260403202909.png?raw=true',
  'https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260403210313.png?raw=true',
  'https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260403214342.png?raw=true',
  'https://github.com/FairyOfTheBog/myimgsources/blob/main/Untitled2_20260404082547.png?raw=true',
  'https://github.com/FairyOfTheBog/myimgsources/blob/main/outfitt.png?raw=true'
];
export const ACCESSORIES = ['None', 'Glasses', 'Hat', 'Bow', 'Scarf', 'Monocle'];

export const DAILY_EVENTS: DailyEvent[] = [
  {
    id: 'meteor_shower',
    name: 'Meteor Shower',
    description: 'The sky is filled with falling stars! You might find rare resources tomorrow.',
    icon: '🌠',
    type: 'weather',
    effects: { luckBonus: 0.5 }
  },
  {
    id: 'flower_festival',
    name: 'Flower Festival',
    description: 'The town is decorated with beautiful blooms. Everyone is in a great mood!',
    icon: '🌸',
    type: 'festival',
    effects: { friendshipMultiplier: 1.5 }
  },
  {
    id: 'market_day',
    name: 'Market Day',
    description: 'Traveling merchants have arrived. Prices are lower than usual!',
    icon: '⚖️',
    type: 'festival',
    effects: { shopDiscount: 0.2 }
  },
  {
    id: 'npc_gathering',
    name: 'Community Picnic',
    description: 'The villagers are gathering at the park. It\'s a great time to socialize!',
    icon: '🧺',
    type: 'npc_event',
    effects: { friendshipMultiplier: 1.2 }
  },
  {
    id: 'lucky_day',
    name: 'Lucky Day',
    description: 'The spirits are very happy today! Good things are bound to happen.',
    icon: '🍀',
    type: 'luck',
    effects: { luckBonus: 0.3 }
  }
];
