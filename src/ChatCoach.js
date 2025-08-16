import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { getGeminiReply } from "./gemini";
import Navigation from "./Navigation";

function ChatCoach() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    // Check if Gemini API key is available
    if (!process.env.REACT_APP_GEMINI_API_KEY) {
      setApiKeyMissing(true);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        const profile = userDoc.data();
        setUserProfile(profile);
        
        // Initialize chat with personalized system message
        const systemMessage = {
          role: "system",
          content: `You are ${profile.coachName}, a ${profile.coachStyle} running coach. The user is a ${profile.age}-year-old ${profile.experience} runner whose goal is: ${profile.goal}. Be encouraging, give specific advice, and maintain your ${profile.coachStyle} personality throughout the conversation.`
        };
        
        // Check if this is a new user who needs a plan generated
        if (profile.isNewUser) {
          // Auto-generate weekly plan for new users
          await generateWeeklyPlan(profile, systemMessage);
          
          // Mark user as no longer new
          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            isNewUser: false
          });
        } else {
          // Regular welcome message for existing users
          const welcomeMessage = {
            role: "assistant",
            content: `Hey there! I'm ${profile.coachName}, your ${profile.coachStyle} running coach. Great to see you back! How's your training going? Feel free to ask me anything about running, your plan, or if you need motivation!`
          };
          
          setMessages([systemMessage, welcomeMessage]);
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const generateWeeklyPlan = async (profile, systemMessage) => {
    setIsGeneratingPlan(true);
    
    try {
      console.log("Auto-generating weekly plan for new user...");
      
      // Special welcome message for new users
      const newUserWelcomeMessage = {
        role: "assistant",
        content: `Welcome! 🎉 I'm so excited to be your ${profile.coachStyle} running coach! 

Let me create a personalized weekly training plan for you right now based on your goal of ${profile.goal}. Give me just a moment to design the perfect plan for a ${profile.experience} runner like yourself...`
      };
      
      setMessages([systemMessage, newUserWelcomeMessage]);
      
      // Create a detailed prompt for plan generation
      const planGenerationPrompt = [
        systemMessage,
        {
          role: "user",
          content: `Please create a detailed weekly training plan for me. I'm a ${profile.age}-year-old ${profile.experience} runner and my goal is: ${profile.goal}. 

Please include:
- Specific activities for each day (Monday through Sunday)
- Distance/time recommendations appropriate for my level
- Rest days and cross-training suggestions
- Any tips specific to my goal
- Make it personal and motivating in your ${profile.coachStyle} style

Format it clearly with each day and what I should do. This will be my training plan!`
        }
      ];
      
      // Generate the plan using Gemini
      const generatedPlan = await getGeminiReply(planGenerationPrompt);
      
      // Save the generated plan to the training plans collection
      await setDoc(doc(db, "trainingPlans", auth.currentUser.uid), {
        planText: generatedPlan,
        createdAt: new Date().toISOString(),
        completedDays: [],
        generatedByAI: true
      });
      
      // Add the plan to the chat
      const planMessage = {
        role: "assistant",
        content: `Here's your personalized weekly training plan! 🏃‍♀️\n\n${generatedPlan}\n\nThis plan is now saved in your Training Plan section too! Feel free to ask me any questions about it, or if you want me to adjust anything. I'm here to help you succeed! 💪`
      };
      
      setMessages([systemMessage, newUserWelcomeMessage, planMessage]);
      
      console.log("Weekly plan generated and saved successfully");
      
    } catch (error) {
      console.error("Error generating weekly plan:", error);
      
      // Fallback message if plan generation fails
      const fallbackMessage = {
        role: "assistant",
        content: `Welcome! I'm having a little trouble generating your custom plan right now, but don't worry - I can still help you! 

Ask me anything about running, training, or your goals, and I'll give you personalized advice. You can also check out the basic plan I created for you in the Training Plan section. 

What would you like to know about achieving your goal of ${profile.goal}?`
      };
      
      setMessages([systemMessage, newUserWelcomeMessage, fallbackMessage]);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (apiKeyMissing) {
      alert("Gemini API key is not configured. Please set up your API key to use the chat feature.");
      return;
    }

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const reply = await getGeminiReply(updatedMessages);
      setMessages([...updatedMessages, { role: "assistant", content: reply }]);
    } catch (error) {
      console.error("Error getting coach reply:", error);
      let errorMessage = "Sorry, I'm having trouble responding right now. Please try again in a moment!";
      
      if (error.message.includes("Too many requests")) {
        errorMessage = "I'm getting lots of questions right now! Please wait 30 seconds and try again.";
      } else if (error.message.includes("API key")) {
        errorMessage = "There's an issue with my configuration. Please check back later!";
      }
      
      setMessages([...updatedMessages, { 
        role: "assistant", 
        content: errorMessage
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const containerStyle = {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px"
  };

  const chatContainerStyle = {
    height: "500px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "20px",
    overflowY: "scroll",
    backgroundColor: "#f9f9f9",
    marginBottom: "20px"
  };

  const messageStyle = (role) => ({
    marginBottom: "15px",
    padding: "10px",
    borderRadius: "10px",
    backgroundColor: role === "user" ? "#007bff" : "#e9ecef",
    color: role === "user" ? "white" : "#333",
    alignSelf: role === "user" ? "flex-end" : "flex-start",
    maxWidth: "80%",
    marginLeft: role === "user" ? "auto" : "0",
    marginRight: role === "user" ? "0" : "auto",
    whiteSpace: "pre-line" // Preserve line breaks in messages
  });

  const inputContainerStyle = {
    display: "flex",
    gap: "10px"
  };

  const inputStyle = {
    flex: "1",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px"
  };

  const buttonStyle = {
    padding: "10px 20px",
    backgroundColor: loading ? "#ccc" : "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: loading ? "not-allowed" : "pointer"
  };

  if (apiKeyMissing) {
    return (
      <div>
        <Navigation />
        <div style={containerStyle}>
          <h2>Chat with Your Coach</h2>
          <div style={{ 
            padding: "20px", 
            backgroundColor: "#fff3cd", 
            border: "1px solid #ffeaa7", 
            borderRadius: "10px",
            textAlign: "center"
          }}>
            <h3>⚠️ API Key Required</h3>
            <p>To use the chat feature, you need to set up your Gemini API key.</p>
            <p>Get your free API key from: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div style={containerStyle}>
        <h2>Chat with {userProfile?.coachName || "Your Coach"} 🏃‍♀️</h2>
        
        {isGeneratingPlan && (
          <div style={{ 
            backgroundColor: "#d4edda", 
            border: "1px solid #c3e6cb", 
            color: "#155724",
            padding: "10px", 
            borderRadius: "5px", 
            marginBottom: "20px",
            textAlign: "center"
          }}>
            🎯 Generating your personalized weekly training plan...
          </div>
        )}
        
        <div style={chatContainerStyle}>
          {messages.slice(1).map((message, index) => ( // Skip system message
            <div key={index} style={messageStyle(message.role)}>
              <strong>{message.role === "user" ? "You" : userProfile?.coachName || "Coach"}:</strong>
              <p style={{ margin: "5px 0 0 0" }}>{message.content}</p>
            </div>
          ))}
          {(loading || isGeneratingPlan) && (
            <div style={messageStyle("assistant")}>
              <strong>{userProfile?.coachName || "Coach"}:</strong>
              <p style={{ margin: "5px 0 0 0" }}>
                {isGeneratingPlan ? "Creating your perfect training plan... 🎯" : "Thinking... 🤔"}
              </p>
            </div>
          )}
        </div>

        <div style={inputContainerStyle}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask your coach anything..."
            style={inputStyle}
            disabled={loading || isGeneratingPlan}
          />
          <button 
            onClick={handleSend} 
            disabled={loading || isGeneratingPlan || !input.trim()} 
            style={buttonStyle}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatCoach;