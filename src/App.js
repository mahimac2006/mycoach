import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ChatCoach from "./ChatCoach";
import ProgressChart from "./ProgressChart";
import Onboarding from "./onboarding";
import TrainingPlan from "./TrainingPlan"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<ChatCoach />} />
        <Route path="/progress" element={<ProgressChart />} />
        <Route path="/training-plan" element={<TrainingPlan />} />
      </Routes>
    </Router>
  );
}

export default App;


