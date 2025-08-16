import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { getGeminiReply } from "./gemini";
import Navigation from "./Navigation";
import "./GlobalStyles.css";

function ChatCoach() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  useEffect(() => {
    fetchUserProfile();
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
        
        const systemMessage = {
          role: "system",
          content: `You are ${profile.coachName}, a ${profile.coachStyle} running coach. The user is a ${profile.age}-year-old ${profile.experience} runner whose goal is: ${profile.goal}. Be encouraging, give specific advice, and maintain your ${profile.coachStyle} personality throughout the conversation.`
        };
        
        if (profile.isNewUser) {
          await generateWeeklyPlan(profile, systemMessage);
          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            isNewUser: false
          });
        } else {
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
    
    const newUserWelcomeMessage = {
      role: "assistant",
      content: `Welcome! 🎉 I'm so excited to be your ${profile.coachStyle} running coach! 

Let me create a personalized weekly training plan for you right now based on your goal of ${profile.goal}. Give me just a moment to design the perfect plan for a ${profile.experience} runner like yourself...`
    };
    
    setMessages([systemMessage, newUserWelcomeMessage]);
    
    try {
      console.log("Auto-generating weekly plan for new user...");
      
      const planGenerationPrompt = [
        systemMessage,
        {
          role: "user",
          content: `Please create a detailed weekly training plan for me. I'm a ${profile.age}-year-old ${profile.experience} runner and my goal is: ${profile.goal}. 

IMPORTANT: Please include ALL 7 days of the week (Monday through Sunday). Even if it's a rest day, please include it and specify "Rest day" or light activities.

Please format your response EXACTLY like this:

**Monday:** [specific activity or "Rest day"]
**Tuesday:** [specific activity]  
**Wednesday:** [specific activity or "Rest day"]
**Thursday:** [specific activity]
**Friday:** [specific activity or "Rest day"] 
**Saturday:** [specific activity]
**Sunday:** [specific activity or "Rest day"]

For each day, include:
- Specific activities (running, cross-training, rest)
- Distance/time recommendations appropriate for my ${profile.experience} level
- Any tips specific to my goal of ${profile.goal}
- Make it personal and motivating in your ${profile.coachStyle} style

Remember: Include ALL 7 days, even rest days!`
        }
      ];
      
      const generatedPlan = await getGeminiReply(planGenerationPrompt);
      
      await setDoc(doc(db, "trainingPlans", auth.currentUser.uid), {
        planText: generatedPlan,
        createdAt: new Date().toISOString(),
        completedDays: [],
        generatedByAI: true
      });
      
      const planMessage = {
        role: "assistant",
        content: `Here's your personalized weekly training plan! 🏃‍♀️\n\n${generatedPlan}\n\nThis plan is now saved in your Training Plan section too! Feel free to ask me any questions about it, or if you want me to adjust anything. I'm here to help you succeed! 💪`
      };
      
      setMessages([systemMessage, newUserWelcomeMessage, planMessage]);
      
      console.log("Weekly plan generated and saved successfully");
      
    } catch (error) {
      console.error("Error generating weekly plan:", error);
      
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

  if (apiKeyMissing) {
    return (
      <div>
        <Navigation />
        <div className="page-container">
          <h2 style={{ color: "white", marginBottom: "30px" }}>Chat with Your Coach</h2>
          <div className="card" style={{ 
            textAlign: "center",
            background: "rgba(255, 255, 255, 0.95)",
            color: "#1f2937"
          }}>
            <h3 style={{ color: "#f59e0b" }}>⚠️ API Key Required</h3>
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
      <div className="page-container">
        <h2 style={{ color: "white", marginBottom: "30px" }}>
          Chat with {userProfile?.coachName || "Your Coach"} 🏃‍♀️
        </h2>
        
        {isGeneratingPlan && (
          <div style={{ 
            background: "rgba(34, 197, 94, 0.2)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            color: "#bbf7d0",
            padding: "15px", 
            borderRadius: "8px", 
            marginBottom: "20px",
            textAlign: "center"
          }}>
            🎯 Generating your personalized weekly training plan...
          </div>
        )}
        
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "12px",
          height: "500px",
          padding: "20px",
          overflowY: "auto",
          marginBottom: "20px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
        }}>
          {messages.slice(1).map((message, index) => (
            <div key={index} style={{
              marginBottom: "15px",
              padding: "12px 16px",
              borderRadius: message.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              backgroundColor: message.role === "user" ? "#3b82f6" : "#f3f4f6",
              color: message.role === "user" ? "white" : "#1f2937",
              maxWidth: "80%",
              marginLeft: message.role === "user" ? "auto" : "0",
              marginRight: message.role === "user" ? "0" : "auto",
              whiteSpace: "pre-line"
            }}>
              <strong style={{ color: message.role === "user" ? "white" : "#374151" }}>
                {message.role === "user" ? "You" : userProfile?.coachName || "Coach"}:
              </strong>
              <p style={{ 
                margin: "5px 0 0 0", 
                color: message.role === "user" ? "white" : "#1f2937",
                lineHeight: "1.5"
              }}>
                {message.content}
              </p>
            </div>
          ))}
          {(loading || isGeneratingPlan) && (
            <div style={{
              marginBottom: "15px",
              padding: "12px 16px",
              borderRadius: "16px 16px 16px 4px",
              backgroundColor: "#f3f4f6",
              color: "#1f2937",
              maxWidth: "80%"
            }}>
              <strong style={{ color: "#374151" }}>{userProfile?.coachName || "Coach"}:</strong>
              <p style={{ margin: "5px 0 0 0", color: "#1f2937" }}>
                {isGeneratingPlan ? "Creating your perfect training plan... 🎯" : "Thinking... 🤔"}
              </p>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask your coach anything..."
            style={{
              flex: "1",
              padding: "14px 16px",
              background: "white",
              border: "2px solid #d1d5db",
              borderRadius: "25px",
              color: "#1f2937",
              fontSize: "16px"
            }}
            disabled={loading || isGeneratingPlan}
          />
          <button 
            onClick={handleSend} 
            disabled={loading || isGeneratingPlan || !input.trim()} 
            className="btn btn-primary"
            style={{ borderRadius: "25px", padding: "14px 24px" }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatCoach;