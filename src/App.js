import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ChatCoach from "./ChatCoach";
import ProgressChart from "./ProgressChart";

function App() {
  return (
    <div className="App">
      <h1>Hello world, this is my AI running coach app!</h1>
    </div>
  );
}


export default App;

// trigger vercel redeploy
// trigger deploy
