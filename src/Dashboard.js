import React, { useState, useEffect } from "react";
import { addDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "./firebase";
import Navbar from "./Navbar";

function Dashboard() {
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [mood, setMood] = useState("happy");
  const [recentRuns, setRecentRuns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecentRuns();
  }, []);

  const fetchRecentRuns = async () => {
    try {
      const runsRef = collection(db, "runs");
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
      setRecentRuns(runs.slice(0, 5)); // Show last 5 runs
    } catch (error) {
      console.error("Error fetching runs:", error);
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
      
      // Clear form
      setDistance("");
      setDuration("");
      setMood("happy");
      
      // Refresh recent runs
      await fetchRecentRuns();
      
      alert("Run logged successfully!");
    } catch (error) {
      console.error("Error logging run:", error);
      alert("Error logging run. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px"
  };

  const formStyle = {
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "30px"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px"
  };

  const buttonStyle = {
    width: "100%",
    padding: "15px",
    backgroundColor: loading ? "#ccc" : "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: loading ? "not-allowed" : "pointer"
  };

  const runItemStyle = {
    backgroundColor: "#fff",
    padding: "15px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  };

  return (
    <div>
      <Navbar />
      <div style={containerStyle}>
        <h2>Log Your Run</h2>
        <form onSubmit={handleSubmit} style={formStyle}>
          <input 
            type="number"
            step="0.1"
            placeholder="Distance (miles or km)" 
            value={distance}
            onChange={e => setDistance(e.target.value)} 
            style={inputStyle}
            required
          />
          <input 
            type="number"
            placeholder="Duration (minutes)" 
            value={duration}
            onChange={e => setDuration(e.target.value)} 
            style={inputStyle}
            required
          />
          <select 
            value={mood}
            onChange={e => setMood(e.target.value)}
            style={inputStyle}
          >
            <option value="happy">Happy 😊</option>
            <option value="tired">Tired 😴</option>
            <option value="motivated">Motivated 💪</option>
            <option value="challenged">Challenged 😤</option>
            <option value="accomplished">Accomplished 🏆</option>
          </select>
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Logging Run..." : "Log Run"}
          </button>
        </form>

        <h3>Recent Runs</h3>
        {recentRuns.length > 0 ? (
          <div>
            {recentRuns.map((run) => (
              <div key={run.id} style={runItemStyle}>
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
          <p style={{ textAlign: "center", color: "#666" }}>
            No runs logged yet. Log your first run above!
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
