
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

let chatSession: Chat | null = null;

export const initializeChat = (): void => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are a Senior Automation Engineer and expert instructor for Siemens SINAMICS drives, motors, and inverters. 
      
      Your goal is to help students learn about:
      - Variable Frequency Drives (VFDs) logic and physics.
      - Motor control principles (V/f, Vector Control).
      - Troubleshooting fault codes (Fxxxx).
      - Safety Integrated functions.
      
      Tone: Professional, encouraging, technical but accessible.
      Format: Use Markdown for bolding key terms or formatting code snippets (e.g., PLC logic).
      
      If the user asks about a simulation, explain the relationship between Frequency (Hz) and Speed (RPM) or Voltage and Torque.
      `,
    },
  });
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
     return "Failed to initialize AI session.";
  }

  try {
    const response: GenerateContentResponse = await chatSession.sendMessage({ message });
    return response.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while communicating with the AI Tutor.";
  }
};
