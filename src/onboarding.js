import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { generatePlan } from "./generatePlan";

function Onboarding() {
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
    if (user) {
      try {
        // Generate the AI training plan
        const trainingPlan = await generatePlan(form);

        // Store user profile and training plan
        await setDoc(doc(db, "users", user.uid), {
          ...form,
          createdAt: new Date().toISOString()
        });

        // Store training plan separately for easier access
        await setDoc(doc(db, "trainingPlans", user.uid), {
          planText: trainingPlan,
          createdAt: new Date().toISOString(),
          completedDays: [] // Track completed days
        });

        navigate("/dashboard");
      } catch (err) {
        console.error("Error during onboarding:", err);
        alert("There was a problem generating your plan. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const formStyle = {
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
    fontSize: "16px"
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
    <div style={formStyle}>
      <form onSubmit={handleSubmit}>
        <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Tell us about yourself!</h2>
        
        <input 
          name="age" 
          type="number"
          placeholder="Age" 
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
          placeholder="Running Goal (e.g., run a 5K, lose weight, marathon)" 
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
          {loading ? "Generating Your Personalized Plan..." : "Start Training"}
        </button>
      </form>
    </div>
  );
}

export default Onboarding;
