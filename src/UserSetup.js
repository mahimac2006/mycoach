import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

function UserSetup() {
  const [form, setForm] = useState({
    age: "",
    experience: "",
    goal: "",
    coachStyle: "",
    coachName: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const user = auth.currentUser;
    if (!user) {
      alert("No user logged in");
      setLoading(false);
      return;
    }

    try {
      console.log("Saving user profile...");
      
      // Save user profile
      await setDoc(doc(db, "users", user.uid), {
        ...form,
        createdAt: new Date().toISOString()
      });

      // Create a simple training plan for now
      const basicPlan = `Welcome ${form.coachName ? `to training with ${form.coachName}` : 'to your training plan'}!
      
Here's your ${form.experience} level plan for: ${form.goal}

Monday: Rest day
Tuesday: Easy 20-30 minute run
Wednesday: Cross training or rest
Thursday: Easy 20-30 minute run  
Friday: Rest day
Saturday: Longer run (30-45 minutes)
Sunday: Rest or easy walk

Remember to listen to your body and adjust as needed!`;

      // Save training plan
      await setDoc(doc(db, "trainingPlans", user.uid), {
        planText: basicPlan,
        createdAt: new Date().toISOString(),
        completedDays: []
      });

      console.log("Profile and plan saved successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error during setup:", error);
      alert("Error setting up your account: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    maxWidth: "500px",
    margin: "50px auto",
    padding: "30px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    backgroundColor: "#f9f9f9"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px",
    boxSizing: "border-box"
  };

  const buttonStyle = {
    width: "100%",
    padding: "15px",
    backgroundColor: loading ? "#ccc" : "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: loading ? "not-allowed" : "pointer"
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
        Tell us about yourself!
      </h2>
      
      <form onSubmit={handleSubmit}>
        <input 
          name="age" 
          type="number"
          placeholder="Your age" 
          value={form.age}
          onChange={handleChange} 
          style={inputStyle}
          required 
        />
        
        <select 
          name="experience" 
          value={form.experience}
          onChange={handleChange} 
          style={inputStyle}
          required
        >
          <option value="">Select your running experience</option>
          <option value="beginner">Beginner (0-1 years)</option>
          <option value="intermediate">Intermediate (1-3 years)</option>
          <option value="advanced">Advanced (3+ years)</option>
        </select>
        
        <input 
          name="goal" 
          placeholder="Running goal (e.g., run a 5K, lose weight, marathon)" 
          value={form.goal}
          onChange={handleChange} 
          style={inputStyle}
          required 
        />
        
        <select 
          name="coachStyle" 
          value={form.coachStyle}
          onChange={handleChange} 
          style={inputStyle}
          required
        >
          <option value="">Choose your coach's personality</option>
          <option value="chill">Chill and Relaxed</option>
          <option value="serious">Serious and Professional</option>
          <option value="funny">Funny and Motivating</option>
          <option value="supportive">Supportive and Encouraging</option>
        </select>
        
        <input 
          name="coachName" 
          placeholder="What would you like to call your coach?" 
          value={form.coachName}
          onChange={handleChange} 
          style={inputStyle}
          required 
        />

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Setting up your account..." : "Start Training!"}
        </button>
      </form>
    </div>
  );
}

export default UserSetup;