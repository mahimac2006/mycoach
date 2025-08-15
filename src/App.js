import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useNavigate } from "react-router-dom";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import ChatCoach from "./ChatCoach";
import ProgressChart from "./ProgressChart";
import TrainingPlan from "./TrainingPlan";
import Account from "./Account";

// Enhanced onboarding component with better redirect
function SimpleOnboarding() {
  const [form, setForm] = useState({
    age: "",
    experience: "beginner",
    goal: "",
    coachStyle: "chill",
    coachName: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    console.log("Form submission started");
    console.log("Form data:", form);
    
    try {
      const user = auth.currentUser;
      console.log("Current user:", user?.uid);
      
      if (!user) {
        throw new Error("No user logged in");
      }

      console.log("Saving user profile...");
      
      // Save user profile
      await setDoc(doc(db, "users", user.uid), {
        ...form,
        createdAt: new Date().toISOString()
      });

      console.log("User profile saved successfully");

      // Create basic training plan
      const basicPlan = `Welcome ${form.coachName}! Here's your personalized ${form.experience} level plan for: ${form.goal}

Monday: Rest day or light stretching
Tuesday: Easy 20-30 minute run
Wednesday: Cross training (swimming, cycling, or yoga)
Thursday: Easy 20-30 minute run  
Friday: Rest day
Saturday: Longer run (30-45 minutes)
Sunday: Rest or easy walk

Remember to listen to your body and adjust as needed. You've got this! 🏃‍♀️`;

      console.log("Saving training plan...");

      await setDoc(doc(db, "trainingPlans", user.uid), {
        planText: basicPlan,
        createdAt: new Date().toISOString(),
        completedDays: []
      });

      console.log("Training plan saved successfully");
      console.log("Redirecting to dashboard...");
      
      // Redirect to dashboard
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Error during onboarding:", error);
      setError("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", padding: "30px", border: "1px solid #ddd", borderRadius: "10px", backgroundColor: "#f9f9f9" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Tell us about yourself!</h2>
      
      {error && (
        <div style={{ 
          backgroundColor: "#f8d7da", 
          color: "#721c24", 
          padding: "10px", 
          borderRadius: "5px", 
          marginBottom: "20px",
          border: "1px solid #f5c6cb"
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <input 
          placeholder="Your age" 
          type="number"
          value={form.age}
          onChange={e => setForm({...form, age: e.target.value})}
          style={{ width: "100%", padding: "10px", margin: "10px 0", border: "1px solid #ccc", borderRadius: "5px", boxSizing: "border-box" }}
          required
          disabled={loading}
        />
        
        <select 
          value={form.experience}
          onChange={e => setForm({...form, experience: e.target.value})}
          style={{ width: "100%", padding: "10px", margin: "10px 0", border: "1px solid #ccc", borderRadius: "5px", boxSizing: "border-box" }}
          disabled={loading}
        >
          <option value="beginner">Beginner (0-1 years)</option>
          <option value="intermediate">Intermediate (1-3 years)</option>
          <option value="advanced">Advanced (3+ years)</option>
        </select>
        
        <input 
          placeholder="Running goal (e.g., run a 5K, lose weight, marathon)"
          value={form.goal}
          onChange={e => setForm({...form, goal: e.target.value})}
          style={{ width: "100%", padding: "10px", margin: "10px 0", border: "1px solid #ccc", borderRadius: "5px", boxSizing: "border-box" }}
          required
          disabled={loading}
        />
        
        <select 
          value={form.coachStyle}
          onChange={e => setForm({...form, coachStyle: e.target.value})}
          style={{ width: "100%", padding: "10px", margin: "10px 0", border: "1px solid #ccc", borderRadius: "5px", boxSizing: "border-box" }}
          disabled={loading}
        >
          <option value="chill">Chill and Relaxed</option>
          <option value="serious">Serious and Professional</option>
          <option value="funny">Funny and Motivating</option>
          <option value="supportive">Supportive and Encouraging</option>
        </select>
        
        <input 
          placeholder="What would you like to call your coach?"
          value={form.coachName}
          onChange={e => setForm({...form, coachName: e.target.value})}
          style={{ width: "100%", padding: "10px", margin: "10px 0", border: "1px solid #ccc", borderRadius: "5px", boxSizing: "border-box" }}
          required
          disabled={loading}
        />
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: "15px", 
            backgroundColor: loading ? "#ccc" : "#007bff", 
            color: "white", 
            border: "none", 
            borderRadius: "5px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Setting up your account..." : "Start Training!"}
        </button>
      </form>
      
      {/* Debug info */}
      <div style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
        <strong>Debug Info:</strong><br />
        Current User: {auth.currentUser?.uid || "Not logged in"}<br />
        Form filled: {form.age && form.goal && form.coachName ? "Yes" : "No"}
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user?.uid);
      setUser(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const completed = userDoc.exists();
          console.log("Onboarding completed:", completed);
          setHasCompletedOnboarding(completed);
          
          // Check if this is a new signup vs existing login
          // We can't perfectly detect this, but if they have no profile, they're likely new
          setIsNewUser(!completed);
        } catch (error) {
          console.error("Error checking onboarding status:", error);
          setHasCompletedOnboarding(false);
          setIsNewUser(true);
        }
      } else {
        setHasCompletedOnboarding(false);
        setIsNewUser(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", paddingTop: "50px" }}>Loading...</div>;
  }

  // If user is not logged in, show auth
  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Auth />} />
        </Routes>
      </Router>
    );
  }

  // If user is logged in but hasn't completed onboarding, show onboarding
  if (user && !hasCompletedOnboarding) {
    return (
      <Router>
        <Routes>
          <Route path="/onboarding" element={<SimpleOnboarding />} />
          <Route path="*" element={<Navigate to="/onboarding" />} />
        </Routes>
      </Router>
    );
  }

  // User is logged in and has completed onboarding
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/onboarding" element={<SimpleOnboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<ChatCoach />} />
        <Route path="/progress" element={<ProgressChart />} />
        <Route path="/training-plan" element={<TrainingPlan />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </Router>
  );
}

export default App;


