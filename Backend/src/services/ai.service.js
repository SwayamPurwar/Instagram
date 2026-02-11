import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({});

export async function generateCaption(file) {
  try {
    const base64Image = file.buffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { 
              // UPDATED PROMPT: Strict instructions for a single string
              text: "Return ONLY one single, short, engaging Instagram caption for this image. Do not include categories, options, or extra text. Just the caption with a few emojis." 
            },
            {
              inlineData: {
                data: base64Image,
                mimeType: file.mimetype,
              },
            },
          ],
        },
      ],
    });

    // Extract the text content from the AI's response
    return response.text || "Captured this moment 📸";

  } catch (error) {
    console.error("⚠️ AI Formatting Error:", error.message);
    return "New post! ✨ #InstagramClone";
  }
}