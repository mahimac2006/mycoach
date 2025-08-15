import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { getGeminiReply } from "./gemini"; // Changed from gpt to gemini
import Navigation from "./Navigation";

function ChatCoach() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

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
        
        const welcomeMessage = {
          role: "assistant",
          content: `Hey there! I'm ${profile.coachName}, your ${profile.coachStyle} running coach. I'm here to help you achieve your goal of ${profile.goal}. How's your training going? Feel free to ask me anything about running, your plan, or if you need motivation!`
        };
        
        setMessages([systemMessage, welcomeMessage]);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
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
      
      // More specific error messages
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
    marginRight: role === "user" ? "0" : "auto"
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
            <p>Add <code>REACT_APP_GEMINI_API_KEY=your_key_here</code> to your environment variables</p>
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
        
        <div style={chatContainerStyle}>
          {messages.slice(1).map((message, index) => ( // Skip system message
            <div key={index} style={messageStyle(message.role)}>
              <strong>{message.role === "user" ? "You" : userProfile?.coachName || "Coach"}:</strong>
              <p style={{ margin: "5px 0 0 0" }}>{message.content}</p>
            </div>
          ))}
          {loading && (
            <div style={messageStyle("assistant")}>
              <strong>{userProfile?.coachName || "Coach"}:</strong>
              <p style={{ margin: "5px 0 0 0" }}>Thinking... 🤔</p>
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
            disabled={loading}
          />
          <button onClick={handleSend} disabled={loading || !input.trim()} style={buttonStyle}>
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatCoach;