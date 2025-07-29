import axios from "axios";

export const getGPTReply = async (messages) => {
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
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
    return res.data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error("Failed to get response from AI coach");
  }
};