// src/onboarding.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { generatePlan } from "./generatePlan"; // ✅ Import GPT helper

function Onboarding() {
  const [form, setForm] = useState({
    age: "",
    experience: "",
    goal: "",
    coachStyle: "",
    coachName: ""
  });
  const [loading, setLoading] = useState(false); // optional spinner
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // start spinner
    const user = auth.currentUser;
    if (user) {
      try {
        // ✅ 1. Get the GPT training plan
        const trainingPlan = await generatePlan(form);

        // ✅ 2. Store everything in Firestore
        await setDoc(doc(db, "users", user.uid), {
          ...form,
          trainingPlan
        });

        // ✅ 3. Route to dashboard
        navigate("/dashboard");
      } catch (err) {
        console.error("Error during onboarding:", err);
        alert("There was a problem. Please try again.");
      } finally {
        setLoading(false); // end spinner
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Tell us about yourself!</h2>
      <input name="age" placeholder="Age" onChange={handleChange} required />
      <select name="experience" onChange={handleChange} required>
        <option value="">Select experience</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      <input name="goal" placeholder="Running Goal" onChange={handleChange} required />
      <select name="coachStyle" onChange={handleChange} required>
        <option value="">Coach personality</option>
        <option value="chill">Chill</option>
        <option value="serious">Serious</option>
        <option value="funny">Funny</option>
      </select>
      <input name="coachName" placeholder="Coach's Name" onChange={handleChange} required />

      <button type="submit" disabled={loading}>
        {loading ? "Generating..." : "Start Training"}
      </button>
    </form>
  );
}

export default Onboarding;

