import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

// Enhanced onboarding component
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
    
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user logged in");
      }

      console.log("Saving user profile...");
      
      // Save user profile with a flag indicating this is a new signup
      await setDoc(doc(db, "users", user.uid), {
        ...form,
        createdAt: new Date().toISOString(),
        onboardingCompleted: true,
        isNewUser: true // Flag to indicate this user just signed up
      });

      // Create a basic training plan (coach will generate a better one in chat)
      const basicPlan = `Welcome ${form.coachName}! I'm your ${form.coachStyle} running coach, and I'm excited to help you achieve your goal of ${form.goal}.

I'll create a personalized weekly training plan for you right now in our chat. Let's get started! 🏃‍♀️`;

      await setDoc(doc(db, "trainingPlans", user.uid), {
        planText: basicPlan,
        createdAt: new Date().toISOString(),
        completedDays: []
      });

      console.log("Profile and plan saved successfully");
      
      // Redirect new users to chat instead of dashboard
      window.location.href = "/chat";
      
    } catch (error) {
      console.error("Error during onboarding:", error);
      setError("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", padding: "30px", border: "1px solid #ddd", borderRadius: "10px", backgroundColor: "#f9f9f9" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Welcome! Let's set up your training 🏃‍♀️</h2>
      
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
            backgroundColor: loading ? "#ccc" : "#28a745", 
            color: "white", 
            border: "none", 
            borderRadius: "5px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Setting up your account..." : "Meet My Coach! 💬"}
        </button>
      </form>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user?.uid);
      setUser(user);
      
      if (user) {
        try {
          // Check if user has completed onboarding
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User data found:", userData);
            
            // Check for onboarding completion
            const completed = userData.onboardingCompleted === true || 
                            (userData.age && userData.goal && userData.coachName); // Fallback check
            
            console.log("Onboarding completed:", completed);
            setHasCompletedOnboarding(completed);
          } else {
            console.log("No user document found - needs onboarding");
            setHasCompletedOnboarding(false);
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error);
          setHasCompletedOnboarding(false);
        }
      } else {
        setHasCompletedOnboarding(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        flexDirection: "column",
        gap: "20px"
      }}>
        <div style={{ fontSize: "18px" }}>Loading your running coach...</div>
        <div style={{ fontSize: "14px", color: "#666" }}>🏃‍♀️ Getting ready for your training!</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* If no user, show auth */}
        <Route path="/" element={
          !user ? <Auth /> : 
          hasCompletedOnboarding ? <Navigate to="/dashboard" /> : 
          <Navigate to="/onboarding" />
        } />
        
        {/* Onboarding route */}
        <Route path="/onboarding" element={
          !user ? <Navigate to="/" /> : 
          hasCompletedOnboarding ? <Navigate to="/dashboard" /> :
          <SimpleOnboarding />
        } />
        
        {/* Protected routes - require auth and completed onboarding */}
        <Route path="/dashboard" element={
          !user ? <Navigate to="/" /> :
          !hasCompletedOnboarding ? <Navigate to="/onboarding" /> :
          <Dashboard />
        } />
        
        <Route path="/chat" element={
          !user ? <Navigate to="/" /> :
          !hasCompletedOnboarding ? <Navigate to="/onboarding" /> :
          <ChatCoach />
        } />
        
        <Route path="/progress" element={
          !user ? <Navigate to="/" /> :
          !hasCompletedOnboarding ? <Navigate to="/onboarding" /> :
          <ProgressChart />
        } />
        
        <Route path="/training-plan" element={
          !user ? <Navigate to="/" /> :
          !hasCompletedOnboarding ? <Navigate to="/onboarding" /> :
          <TrainingPlan />
        } />
        
        <Route path="/account" element={
          !user ? <Navigate to="/" /> :
          !hasCompletedOnboarding ? <Navigate to="/onboarding" /> :
          <Account />
        } />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
