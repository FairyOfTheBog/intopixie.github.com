import { GoogleGenAI } from "@google/genai";
import { NPC } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function chatWithNPC(npc: NPC, userMessage: string, playerInfo: any) {
  const hearts = Math.floor(npc.friendship / 250);
  let relationshipStatus = "Acquaintance";
  if (npc.isDating) relationshipStatus = "Dating";
  else if (hearts >= 10) relationshipStatus = "Best Friend";
  else if (hearts >= 8) relationshipStatus = "Close Friend";
  else if (hearts >= 4) relationshipStatus = "Good Friend";
  else if (hearts >= 2) relationshipStatus = "Friend";

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
            
            Respond as ${npc.name} in a natural, conversational text-message style (1-2 short sentences). 
            Do not sound like a robot or a quest giver unless appropriate. Be casual and in character.
            Adjust your tone based on the Relationship Status. If dating or best friends, be very warm and open. If acquaintance, be polite but a bit distant.
            
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

export async function getGiftReaction(npc: NPC, itemName: string, playerInfo: any) {
  const model = genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `You are ${npc.name} from Stardew Valley. 
            Personality: ${npc.personality}. 
            The player (${playerInfo.name}) just gave you a ${itemName}.
            
            Respond as ${npc.name} to this gift. 
            If it's something you LOVE (check Stardew Valley wiki if needed), be ecstatic.
            If it's something you LIKE, be happy.
            If it's something you DISLIKE or HATE, be disappointed or angry.
            
            Keep it short (1-2 sentences).`
          }
        ]
      }
    ]
  });

  const response = await model;
  return response.text;
}
