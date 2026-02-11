import { GoogleGenAI } from "@google/genai";
// The client automatically looks for process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({});

export async function generateCaption(file) {
  try {
    // Convert the file buffer to a base64 string
    const base64Image = file.buffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Using the preview model you requested
      contents: [
        {
          role: "user",
          parts: [
            { text: "Write a short Instagram caption for this image with emojis." },
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

    // Extract text from the response
    return response.text || "Sharing a new moment! ✨";

  } catch (error) {
    // Fallback if the key is expired or the model name is restricted
    if (error.message?.includes("400") || error.message?.includes("expired")) {
      console.error("🚨 GEMINI_API_KEY is expired. Please renew it in AI Studio.");
    } else {
      console.warn("⚠️ AI Service Error:", error.message);
    }
    
    return "Captured this moment 📸 #NewPost";
  }
}