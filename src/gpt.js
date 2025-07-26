import axios from "axios";

export const getGPTReply = async (messages) => {
  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4",
      messages: messages
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
      }
    }
  );
  return res.data.choices[0].message.content;
};