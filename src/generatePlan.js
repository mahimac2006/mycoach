import axios from "axios";

export const generatePlan = async (formData) => {
  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert running coach that makes weekly training plans."
        },
        {
          role: "user",
          content: `Create a running plan for a ${formData.age}-year-old ${formData.experience} runner.
          Their goal is: ${formData.goal}.
          They prefer a coach who is ${formData.coachStyle} and want to call them ${formData.coachName}.`
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );
  return res.data.choices[0].message.content;
};
