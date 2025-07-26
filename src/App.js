import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ChatCoach from "./ChatCoach";
import ProgressChart from "./ProgressChart";

function App() {
  console.log("App rendered");
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;


