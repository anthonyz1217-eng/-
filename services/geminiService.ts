
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  /**
   * Generates text content using the Gemini model.
   * Supports multimodal parts (text + images/data).
   */
  async generate(input: string | any[], systemInstruction?: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const contents = typeof input === 'string' 
        ? { parts: [{ text: input }] }
        : { parts: input };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents,
        config: {
          systemInstruction: systemInstruction || "You are a professional social media marketing consultant for high-end automotive brands like Audi.",
          temperature: 0.7,
        },
      });
      
      return response.text || "No response generated.";
    } catch (error) {
      console.error("Gemini Generation Error:", error);
      return `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
    }
  }
}

export const gemini = new GeminiService();
