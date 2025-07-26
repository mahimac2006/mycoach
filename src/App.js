import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ChatCoach from "./ChatCoach";
import ProgressChart from "./ProgressChart";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<ChatCoach />} />
        <Route path="/progress" element={<ProgressChart />} />
      </Routes>
    </Router>
  );
}

export default App;


