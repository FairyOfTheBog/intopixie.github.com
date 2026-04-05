import { GoogleGenAI } from "@google/genai";
import { NPC } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function chatWithNPC(npc: NPC, userMessage: string, playerInfo: any, currentDailyEvent?: any) {
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
            ${eventContext}
            
            Respond as ${npc.name} in a natural, conversational text-message style (1-2 short sentences). 
            Do not sound like a robot or a quest giver unless appropriate. Be casual and in character.
            Adjust your tone based on the Relationship Status. 
            - If Married: Be incredibly loving, supportive, and intimate. Mention home or life together.
            - If Dating: Be very warm, flirtatious, and open.
            - If Best Friends: Be very close, trusting, and supportive.
            - If Acquaintance: Be polite but a bit distant.
            
            If there is a Current Daily Event, feel free to mention it naturally in your response if it makes sense for your character.
            
            CRITICAL: If you choose to send a picture, it MUST be described as a PIXEL ART or 16-BIT style image.
            To send a picture, include exactly this tag anywhere in your response: [IMAGE: keyword]
            Replace "keyword" with a single word describing the image (e.g., [IMAGE: pixel-cat], [IMAGE: pixel-coffee], [IMAGE: pixel-sunset]).
            Only do this occasionally, not every time.
            
            Player says: "${userMessage}"`
          }
        ]
      }
    ]
  });

  const response = await model;
  return response.text;
}

export async function getGiftReaction(npc: NPC, itemName: string, playerInfo: any, currentDailyEvent?: any) {
  const eventContext = currentDailyEvent ? `Current Daily Event: ${currentDailyEvent.name} (${currentDailyEvent.description}).` : "";
  const model = genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `You are ${npc.name} from Stardew Valley. 
            Personality: ${npc.personality}. 
            The player (${playerInfo.name}) just gave you a ${itemName}.
            ${eventContext}
            
            Respond as ${npc.name} to this gift. 
            If it's something you LOVE (check Stardew Valley wiki if needed), be ecstatic.
            If it's something you LIKE, be happy.
            If it's something you DISLIKE or HATE, be disappointed or angry.
            
            If there is a Current Daily Event, you can mention it if it makes sense.
            
            Keep it short (1-2 sentences).`
          }
        ]
      }
    ]
  });

  const response = await model;
  return response.text;
}
