import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Auth from "./Auth";
import Onboarding from "./Onboarding"; // Fixed capitalization
import Dashboard from "./Dashboard";
import ChatCoach from "./ChatCoach";
import ProgressChart from "./ProgressChart";
import TrainingPlan from "./TrainingPlan";
import Account from "./Account"; // New component

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", paddingTop: "50px" }}>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
        <Route path="/onboarding" element={user ? <Onboarding /> : <Navigate to="/" />} />
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



