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
import "./GlobalStyles.css";

// Onboarding component
function UserOnboarding() {
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
    
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user logged in");
      }

      // Save user profile
      await setDoc(doc(db, "users", user.uid), {
        ...form,
        createdAt: new Date().toISOString(),
        onboardingCompleted: true,
        isNewUser: true
      });

      // Create basic training plan
      const basicPlan = `Welcome ${form.coachName}! I'm your ${form.coachStyle} running coach, and I'm excited to help you achieve your goal of ${form.goal}.

I'll create a personalized weekly training plan for you right now in our chat. Let's get started! 🏃‍♀️`;

      await setDoc(doc(db, "trainingPlans", user.uid), {
        planText: basicPlan,
        createdAt: new Date().toISOString(),
        completedDays: []
      });

      // Redirect to chat
      window.location.href = "/chat";
      
    } catch (error) {
      console.error("Error during onboarding:", error);
      setError("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="form-container">
        <div className="card-header">
          <h2 style={{
            background: "linear-gradient(135deg, #ffffff, #60a5fa)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Welcome to myCoach! 🏃‍♀️
          </h2>
          <p style={{ margin: "10px 0 0 0", color: "rgba(255, 255, 255, 0.8)" }}>
            Tell us about yourself to get a personalized training plan
          </p>
        </div>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input 
            type="number"
            placeholder="Your age" 
            value={form.age}
            onChange={e => setForm({...form, age: e.target.value})}
            className="form-input"
            required
            disabled={loading}
          />
          
          <select 
            value={form.experience}
            onChange={e => setForm({...form, experience: e.target.value})}
            className="form-select"
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
            className="form-input"
            required
            disabled={loading}
          />
          
          <select 
            value={form.coachStyle}
            onChange={e => setForm({...form, coachStyle: e.target.value})}
            className="form-select"
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
            className="form-input"
            required
            disabled={loading}
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary btn-full"
            style={{ marginTop: "20px" }}
          >
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <div className="loading-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
                Setting up your account...
              </div>
            ) : (
              "Meet My Coach! 💬"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const completed = userData.onboardingCompleted === true || 
                            (userData.age && userData.goal && userData.coachName);
            setHasCompletedOnboarding(completed);
          } else {
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

  if (loading) {
    return (
      <div className="loading-container" style={{ height: "100vh" }}>
        <div className="loading-spinner"></div>
        <div style={{ fontSize: "18px" }}>Loading your running coach...</div>
        <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>🏃‍♀️ Getting ready for your training!</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          !user ? <Auth /> : 
          hasCompletedOnboarding ? <Navigate to="/dashboard" /> : 
          <Navigate to="/onboarding" />
        } />
        
        <Route path="/onboarding" element={
          !user ? <Navigate to="/" /> : 
          hasCompletedOnboarding ? <Navigate to="/dashboard" /> :
          <UserOnboarding />
        } />
        
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
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
