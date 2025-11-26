import { GoogleGenAI } from "@google/genai";
import config from "../config/config.js";

const ai = new GoogleGenAI({
  apiKey: config.GEMINI_API_KEY,
});

export async function generateCaption(file) {
  // 1. Validation
  if (!config.GEMINI_API_KEY) {
    console.error("❌ Missing GEMINI_API_KEY in .env file");
    return "Just sharing this amazing moment! ✨"; // Fallback caption
  }

  try {
    const base64Image = Buffer.from(file.buffer).toString("base64");

    // 2. Call AI Model (Switched to stable 1.5-flash)
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: file.mimetype,
                data: base64Image,
              },
            },
            {
              text: "Write a short, engaging Instagram caption for this image. Include emojis and hashtags.",
            },
          ],
        },
      ],
    });

    // 3. Extract Text safely
    if (response && response.text) {
      return typeof response.text === "function"
        ? response.text()
        : response.text;
    }
    return " captured this moment 📸";
  } catch (error) {
    console.error("❌ AI Service Error:", error.message);
    // Return a default caption so the post doesn't fail
    return "Check out this new photo! 🌟";
  }
}
