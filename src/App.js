
import Onboarding from "./onboarding"; 
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import ChatCoach from "./ChatCoach";
import ProgressChart from "./ProgressChart";
import TrainingPlan from "./TrainingPlan";
import Account from "./Account";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Check if user has completed onboarding
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          setHasCompletedOnboarding(userDoc.exists());
        } catch (error) {
          console.error("Error checking onboarding status:", error);
          setHasCompletedOnboarding(false);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", paddingTop: "50px" }}>Loading...</div>;
  }

  // If user is logged in but hasn't completed onboarding, redirect to onboarding
  if (user && !hasCompletedOnboarding) {
    return (
      <Router>
        <Routes>
          <Route path="/onboarding" element={<onboarding />} />
          <Route path="*" element={<Navigate to="/onboarding" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
        <Route path="/onboarding" element={user ? <onboarding /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/chat" element={user ? <ChatCoach /> : <Navigate to="/" />} />
        <Route path="/progress" element={user ? <ProgressChart /> : <Navigate to="/" />} />
        <Route path="/training-plan" element={user ? <TrainingPlan /> : <Navigate to="/" />} />
        <Route path="/account" element={user ? <Account /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;


