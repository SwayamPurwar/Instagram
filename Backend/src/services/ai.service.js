import { GoogleGenAI } from "@google/genai";
import config from "../config/config.js";

// The client can also pick up GEMINI_API_KEY from process.env automatically
const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
export async function generateCaption(file) {
  try {
    const base64Image = file.buffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Use the new Gemini 3 Flash model
      contents: [
        {
          role: "user",
          parts: [
            { text: "Return ONLY one single, short, engaging Instagram caption for this image with emojis." },
            {
              inlineData: {
                data: base64Image,
                mimeType: file.mimetype,
              },
            },
          ],
        },
      ],
      config: {
        thinkingConfig: {
          thinkingLevel: "LOW" // Optional: Optimizes for low latency
        }
      }
    });

    return response.text || "Captured this moment 📸";

  } catch (error) {
    console.error("⚠️ Gemini 3 Migration Error:", error.message);
    return "New post! ✨ #InstagramClone";
  }
}