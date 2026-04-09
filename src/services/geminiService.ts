import { GoogleGenAI } from "@google/genai";
import { NPC } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function chatWithNPC(npc: NPC, userMessage: string, playerInfo: any, currentDailyEvent?: any, timeContext?: string, isBirthday?: boolean) {
  const hearts = Math.floor(npc.friendship / 250);
  let relationshipStatus = "Acquaintance";
  if (npc.isMarried) relationshipStatus = "Married";
  else if (npc.isDating) relationshipStatus = "Dating";
  else if (hearts >= 10) relationshipStatus = "Best Friend";
  else if (hearts >= 8) relationshipStatus = "Close Friend";
  else if (hearts >= 6) relationshipStatus = "Good Friend";
  else if (hearts >= 4) relationshipStatus = "Friend";
  else if (hearts >= 2) relationshipStatus = "Casual Friend";

  const eventContext = currentDailyEvent ? `Current Daily Event: ${currentDailyEvent.name} (${currentDailyEvent.description}).` : "";
  const timeInfo = timeContext ? `Current Time: ${timeContext}.` : "";
  const birthdayInfo = isBirthday ? "IMPORTANT: Today is your BIRTHDAY! You are feeling extra happy and might mention it or thank the player for remembering." : "";

  const model = genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `You are ${npc.name} from Stardew Valley. 
            Personality: ${npc.personality}. 
            Current friendship level with the player: ${npc.friendship}/2500 (${hearts} hearts).
            Relationship Status: ${relationshipStatus}.
            Player name: ${playerInfo.name}.
            Player gender: ${playerInfo.gender}.
            ${timeInfo}
            ${eventContext}
            ${birthdayInfo}
            
            Respond as ${npc.name} in a natural, conversational text-message style (1-2 short sentences). 
            Capture the unique "Stardew Valley" charm—be cozy, sincere, and character-driven.
            Do not sound like a robot or a quest giver unless appropriate. Be casual and in character.
            Adjust your tone based on the Relationship Status and Time of Day. 
            - If Married: Be incredibly loving, supportive, and intimate. Mention home, life together, or future plans.
            - If Dating: Be very warm, flirtatious, and open. Use pet names if appropriate for your character.
            - If Best Friends: Be very close, trusting, and supportive. Share a small secret or a personal thought.
            - If Acquaintance: Be polite but a bit distant.
            
            Time-specific cues:
            - Early Morning (6AM-9AM): Mention starting chores, coffee, or the morning air.
            - Late Night (10PM-2AM): Mention being tired, the stars, or why you're still up.
            
            If there is a Current Daily Event, mention how it affects your mood or plans.
            
            CRITICAL: Do NOT send any images or use image tags. Only respond with text.
            
            Player says: "${userMessage}"`
          }
        ]
      }
    ]
  });

  const response = await model;
  return response.text;
}

export async function getGiftReaction(npc: NPC, itemName: string, playerInfo: any, currentDailyEvent?: any, timeContext?: string, isBirthday?: boolean) {
  const eventContext = currentDailyEvent ? `Current Daily Event: ${currentDailyEvent.name} (${currentDailyEvent.description}).` : "";
  const timeInfo = timeContext ? `Current Time: ${timeContext}.` : "";
  const birthdayInfo = isBirthday ? "IMPORTANT: Today is your BIRTHDAY! You are extra touched by this gift. Your reaction should be even more positive than usual if you like the gift." : "";
  
  const model = genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `You are ${npc.name} from Stardew Valley. 
            Personality: ${npc.personality}. 
            The player (${playerInfo.name}) just gave you a ${itemName}.
            ${timeInfo}
            ${eventContext}
            ${birthdayInfo}
            
            Respond as ${npc.name} to this gift. 
            If it's something you LOVE (check Stardew Valley wiki if needed), be ecstatic and mention why it's special to you.
            If it's something you LIKE, be happy and thankful.
            If it's something you DISLIKE or HATE, be disappointed, confused, or even a bit grumpy (if that's your personality).
            
            If it's your birthday, make sure to mention how special it is to receive a gift today!
            
            If there is a Current Daily Event, you can mention it if it makes sense (e.g., "This will be perfect for the festival!").
            
            Keep it short (1-2 sentences) and in character.`
          }
        ]
      }
    ]
  });

  const response = await model;
  return response.text;
}
