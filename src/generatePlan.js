import axios from "axios";

export const generatePlan = async (formData) => {
  try {
    console.log("Generating training plan...");
    
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo", 
        messages: [
          {
            role: "system",
            content: `You are an expert running coach that creates detailed weekly training plans. Format your response with clear days of the week and specific activities for each day. Make the plan realistic and progressive.`
          },
          {
            role: "user",
            content: `Create a comprehensive weekly running training plan for a ${formData.age}-year-old ${formData.experience} runner.
            Their goal is: ${formData.goal}.
            They prefer a coach who is ${formData.coachStyle} and want to call their coach ${formData.coachName}.
            
            Please include:
            - Specific activities for each day of the week
            - Rest days where appropriate
            - Distance/time recommendations
            - Any cross-training suggestions
            - Progressive difficulty based on their experience level
            
            Format it clearly with day headings (Monday, Tuesday, etc.) followed by the activities for that day.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    console.log("Training plan generated successfully");
    return res.data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating training plan:", error);
    console.error("Error response:", error.response?.data);
    throw new Error("Failed to generate training plan");
  }
};
