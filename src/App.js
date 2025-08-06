
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import ChatCoach from "./ChatCoach";
import UserSetup from "./UserSetup"; 
import ProgressChart from "./ProgressChart";
import TrainingPlan from "./TrainingPlan";
import Account from "./Account";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedUserSetup, setHasCompletedUserSetup] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Check if user has completed UserSetup
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          setHasCompletedUserSetup(userDoc.exists());
        } catch (error) {
          console.error("Error checking UserSetup status:", error);
          setHasCompletedUserSetup(false);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", paddingTop: "50px" }}>Loading...</div>;
  }

  // If user is logged in but hasn't completed UserSetup, redirect to UserSetup
  if (user && !hasCompletedUserSetup) {
    return (
      <Router>
        <Routes>
          <Route path="/UserSetup" element={<UserSetup />} />
          <Route path="*" element={<Navigate to="/UserSetup" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
        <Route path="/UserSetup" element={user ? <UserSetup /> : <Navigate to="/" />} />
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


