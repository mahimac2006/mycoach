
import axios from "axios";

export const getGPTReply = async (messages) => {
  try {
    console.log("Calling OpenAI API...");
    console.log("API Key available:", !!process.env.REACT_APP_OPENAI_API_KEY);
    
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo", // Changed from gpt-4 to gpt-3.5-turbo
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    console.log("OpenAI API response received");
    return res.data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    console.error("Error response:", error.response?.data);
    throw new Error("Failed to get response from AI coach");
  }
};