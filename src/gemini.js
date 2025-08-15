import axios from "axios";

export const getGeminiReply = async (messages) => {
  try {
    console.log("Calling Gemini API...");
    console.log("Gemini API Key available:", !!process.env.REACT_APP_GEMINI_API_KEY);
    
    // Convert OpenAI message format to Gemini format
    const lastMessage = messages[messages.length - 1];
    const systemMessage = messages.find(msg => msg.role === 'system');
    
    // Combine system message with user message for context
    const prompt = systemMessage 
      ? `${systemMessage.content}\n\nUser: ${lastMessage.content}\nCoach:`
      : `You are a helpful running coach. User: ${lastMessage.content}\nCoach:`;
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    console.log("Gemini API response received");
    return response.data.candidates[0].content.parts[0].text;
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    console.error("Error response:", error.response?.data);
    
    if (error.response?.status === 429) {
      throw new Error("Too many requests! Please wait a moment and try again.");
    } else if (error.response?.status === 400) {
      throw new Error("Invalid request. Please try rephrasing your message.");
    } else if (error.response?.status === 403) {
      throw new Error("API key issue. Please check your Gemini API configuration.");
    } else {
      throw new Error("Failed to get response from your coach. Please try again!");
    }
  }
};