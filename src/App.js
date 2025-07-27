import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./Auth"; // this combines Login + Signup
import onboarding from "./onboarding";
import Dashboard from "./Dashboard";
import ChatCoach from "./ChatCoach";
import ProgressChart from "./ProgressChart";
import TrainingPlan from "./TrainingPlan";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/onboarding" element={<onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<ChatCoach />} />
        <Route path="/progress" element={<ProgressChart />} />
        <Route path="/training-plan" element={<TrainingPlan />} />
      </Routes>
    </Router>
  );
}

export default App;



