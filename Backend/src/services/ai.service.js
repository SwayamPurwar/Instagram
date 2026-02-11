import { GoogleGenAI } from "@google/genai";
import config from "../config/config.js";

// Initialize the client
const ai = new GoogleGenAI({
  apiKey: config.GEMINI_API_KEY,
});

export async function generateCaption(file) {
  // 1. Validation: Check if API Key exists
  if (!config.GEMINI_API_KEY) {
    console.warn("⚠️ Missing GEMINI_API_KEY. Using fallback caption.");
    return "Just sharing this amazing moment! ✨"; 
  }

  try {
    // Convert buffer to base64 for the API
    const base64Image = Buffer.from(file.buffer).toString("base64");

    // 2. Call AI Model
    // Using 'gemini-1.5-flash' as it is often more stable for free tier than 2.0
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", 
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
      // Handle both SDK versions (property vs function)
      const caption = typeof response.text === "function" ? response.text() : response.text;
      return caption || "Captured this moment 📸";
    }
    
    return "Captured this moment 📸";

  } catch (error) {
    // 4. Smart Error Handling
    
    // Check for Rate Limit / Quota Exceeded (429)
    if (
      error.message?.includes("429") || 
      error.status === 429 || 
      error.code === 429 ||
      JSON.stringify(error).includes("Quota exceeded")
    ) {
      console.warn("⚠️ AI Quota Exceeded. Using default caption.");
      return "Check out this new photo! 🌟";
    }

    // Log other real errors
    console.error("❌ AI Service Error:", error.message);
    
    // Fallback so the post doesn't fail
    return "Check out this new photo! 🌟";
  }
}