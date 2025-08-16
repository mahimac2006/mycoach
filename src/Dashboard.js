import React, { useState, useEffect } from "react";
import { addDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "./firebase";
import Navigation from "./Navigation";
import "./GlobalStyles.css";

function Dashboard() {
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [mood, setMood] = useState("happy");
  const [recentRuns, setRecentRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingRuns, setFetchingRuns] = useState(true);

  useEffect(() => {
    fetchRecentRuns();
  }, []);

  const fetchRecentRuns = async () => {
    setFetchingRuns(true);
    try {
      const runsRef = collection(db, "runs");
      
      try {
        const q = query(
          runsRef, 
          where("userId", "==", auth.currentUser.uid),
          orderBy("date", "desc")
        );
        const querySnapshot = await getDocs(q);
        const runs = [];
        querySnapshot.forEach((doc) => {
          runs.push({ id: doc.id, ...doc.data() });
        });
        setRecentRuns(runs.slice(0, 5));
      } catch (orderByError) {
        console.log("OrderBy failed, trying without orderBy:", orderByError);
        
        const simpleQ = query(
          runsRef, 
          where("userId", "==", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(simpleQ);
        const runs = [];
        querySnapshot.forEach((doc) => {
          runs.push({ id: doc.id, ...doc.data() });
        });
        
        runs.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentRuns(runs.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching runs:", error);
    } finally {
      setFetchingRuns(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!distance || !duration) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "runs"), {
        userId: auth.currentUser.uid,
        date: new Date().toISOString().split("T")[0],
        distance: parseFloat(distance),
        duration: parseInt(duration),
        mood,
        timestamp: new Date()
      });
      
      setDistance("");
      setDuration("");
      setMood("happy");
      await fetchRecentRuns();
      alert("Run logged successfully!");
    } catch (error) {
      console.error("Error logging run:", error);
      alert("Error logging run. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navigation />
      <div className="page-container">
        <h2 style={{ color: "white", marginBottom: "30px" }}>Log Your Run</h2>
        
        <div className="card">
          <form onSubmit={handleSubmit}>
            <input 
              type="number"
              step="0.1"
              placeholder="Distance (miles or km)" 
              value={distance}
              onChange={e => setDistance(e.target.value)} 
              className="form-input"
              style={{ 
                background: "white",
                border: "1px solid #d1d5db",
                color: "#1f2937"
              }}
              required
            />
            
            <input 
              type="number"
              placeholder="Duration (minutes)" 
              value={duration}
              onChange={e => setDuration(e.target.value)} 
              className="form-input"
              style={{ 
                background: "white",
                border: "1px solid #d1d5db",
                color: "#1f2937"
              }}
              required
            />
            
            <select 
              value={mood}
              onChange={e => setMood(e.target.value)}
              className="form-select"
              style={{ 
                background: "white",
                border: "1px solid #d1d5db",
                color: "#1f2937"
              }}
            >
              <option value="happy">Happy 😊</option>
              <option value="tired">Tired 😴</option>
              <option value="motivated">Motivated 💪</option>
              <option value="challenged">Challenged 😤</option>
              <option value="accomplished">Accomplished 🏆</option>
            </select>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="btn btn-primary btn-full"
              style={{ marginTop: "20px" }}
            >
              {loading ? "Logging Run..." : "Log Run"}
            </button>
          </form>
        </div>

        <h3 style={{ color: "white", marginBottom: "20px" }}>Recent Runs</h3>
        
        {fetchingRuns ? (
          <div className="loading-container" style={{ height: "200px" }}>
            <div className="loading-spinner"></div>
            <p style={{ color: "white" }}>Loading runs...</p>
          </div>
        ) : recentRuns.length > 0 ? (
          <div>
            {recentRuns.map((run) => (
              <div key={run.id} className="card" style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                background: "white",
                color: "#1f2937"
              }}>
                <div>
                  <strong>{run.date}</strong> - {run.distance} miles in {run.duration} minutes
                </div>
                <div style={{ fontSize: "20px" }}>
                  {run.mood === "happy" && "😊"}
                  {run.mood === "tired" && "😴"}
                  {run.mood === "motivated" && "💪"}
                  {run.mood === "challenged" && "😤"}
                  {run.mood === "accomplished" && "🏆"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ 
            textAlign: "center", 
            background: "white",
            color: "#6b7280"
          }}>
            <p>No runs logged yet. Log your first run above!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;