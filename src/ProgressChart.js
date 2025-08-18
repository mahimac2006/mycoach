import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "./firebase";
import Navigation from "./Navigation";
import "./GlobalStyles.css";

function ProgressChart() {
  const [runs, setRuns] = useState([]);
  const [timeFrame, setTimeFrame] = useState("month"); // week, month, year
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRuns();
  }, [timeFrame]);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const runsRef = collection(db, "runs");
      
      // Try with orderBy first, fallback to simple query if index missing
      try {
        const q = query(
          runsRef,
          where("userId", "==", auth.currentUser.uid),
          orderBy("date", "asc")
        );
        const querySnapshot = await getDocs(q);
        const allRuns = [];
        querySnapshot.forEach((doc) => {
          allRuns.push({ id: doc.id, ...doc.data() });
        });
        
        const filteredRuns = filterRunsByTimeFrame(allRuns);
        setRuns(filteredRuns);
      } catch (orderByError) {
        console.log("OrderBy failed, using simple query:", orderByError);
        
        // Fallback: simple query and manual sort
        const simpleQ = query(
          runsRef,
          where("userId", "==", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(simpleQ);
        const allRuns = [];
        querySnapshot.forEach((doc) => {
          allRuns.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort manually by date
        allRuns.sort((a, b) => new Date(a.date) - new Date(b.date));
        const filteredRuns = filterRunsByTimeFrame(allRuns);
        setRuns(filteredRuns);
      }
    } catch (error) {
      console.error("Error fetching runs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterRunsByTimeFrame = (allRuns) => {
    const now = new Date();
    
    return allRuns.filter(run => {
      const runDate = new Date(run.date);
      const daysDiff = (now - runDate) / (1000 * 60 * 60 * 24);
      
      switch(timeFrame) {
        case "week":
          return daysDiff <= 7;
        case "month":
          return daysDiff <= 30;
        case "year":
          return daysDiff <= 365;
        default:
          return true;
      }
    });
  };

  const calculateStats = () => {
    if (runs.length === 0) return null;

    const totalDistance = runs.reduce((sum, run) => sum + run.distance, 0);
    const totalTime = runs.reduce((sum, run) => sum + run.duration, 0);
    const avgDistance = totalDistance / runs.length;
    const avgPace = totalTime / totalDistance; // minutes per mile/km

    return {
      totalRuns: runs.length,
      totalDistance: totalDistance.toFixed(1),
      totalTime: Math.round(totalTime),
      avgDistance: avgDistance.toFixed(1),
      avgPace: avgPace.toFixed(1)
    };
  };

  const stats = calculateStats();

  // Create simple charts using CSS and divs
  const createDistanceChart = () => {
    if (runs.length === 0) return null;
    
    const maxDistance = Math.max(...runs.map(run => run.distance));
    
    return runs.map((run, index) => {
      const height = (run.distance / maxDistance) * 200; // Max height 200px
      const width = Math.max(400 / runs.length - 5, 20); // Responsive width
      
      return (
        <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0 2px" }}>
          <div style={{ fontSize: "10px", marginBottom: "5px", height: "20px", color: "#374151" }}>
            {run.distance}
          </div>
          <div
            style={{
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: "#3b82f6",
              borderRadius: "2px 2px 0 0",
              transition: "all 0.3s ease"
            }}
            title={`${run.date}: ${run.distance} miles in ${run.duration} minutes`}
          ></div>
          <div style={{ fontSize: "8px", marginTop: "5px", transform: "rotate(-45deg)", transformOrigin: "center", color: "#6b7280" }}>
            {new Date(run.date).getMonth() + 1}/{new Date(run.date).getDate()}
          </div>
        </div>
      );
    });
  };

  const createDurationChart = () => {
    if (runs.length === 0) return null;
    
    const maxDuration = Math.max(...runs.map(run => run.duration));
    
    return runs.map((run, index) => {
      const height = (run.duration / maxDuration) * 200;
      const width = Math.max(400 / runs.length - 5, 20);
      
      return (
        <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0 2px" }}>
          <div style={{ fontSize: "10px", marginBottom: "5px", height: "20px", color: "#374151" }}>
            {run.duration}m
          </div>
          <div
            style={{
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: "#10b981",
              borderRadius: "2px 2px 0 0"
            }}
            title={`${run.date}: ${run.distance} miles in ${run.duration} minutes`}
          ></div>
          <div style={{ fontSize: "8px", marginTop: "5px", transform: "rotate(-45deg)", transformOrigin: "center", color: "#6b7280" }}>
            {new Date(run.date).getMonth() + 1}/{new Date(run.date).getDate()}
          </div>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="loading-container" style={{ height: "400px" }}>
          <div className="loading-spinner"></div>
          <div style={{ color: "white" }}>Loading your progress...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="page-container">
        <h2 style={{ color: "white", marginBottom: "30px" }}>Your Running Progress 📈</h2>
        
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "30px"
        }}>
          <button 
            className={timeFrame === "week" ? "btn btn-primary" : "btn btn-secondary"}
            onClick={() => setTimeFrame("week")}
          >
            Last Week
          </button>
          <button 
            className={timeFrame === "month" ? "btn btn-primary" : "btn btn-secondary"}
            onClick={() => setTimeFrame("month")}
          >
            Last Month
          </button>
          <button 
            className={timeFrame === "year" ? "btn btn-primary" : "btn btn-secondary"}
            onClick={() => setTimeFrame("year")}
          >
            Last Year
          </button>
        </div>

        {stats ? (
          <>
            <div className="stats-grid" style={{ marginBottom: "30px" }}>
              <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                padding: "24px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}>
                <h3 style={{ color: "#3b82f6", margin: "0 0 10px 0", fontSize: "2rem" }}>{stats.totalRuns}</h3>
                <p style={{ margin: 0, color: "#6b7280" }}>Total Runs</p>
              </div>
              
              <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                padding: "24px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}>
                <h3 style={{ color: "#10b981", margin: "0 0 10px 0", fontSize: "2rem" }}>{stats.totalDistance}</h3>
                <p style={{ margin: 0, color: "#6b7280" }}>Total Distance</p>
              </div>
              
              <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                padding: "24px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}>
                <h3 style={{ color: "#f59e0b", margin: "0 0 10px 0", fontSize: "2rem" }}>{stats.totalTime}</h3>
                <p style={{ margin: 0, color: "#6b7280" }}>Total Minutes</p>
              </div>
              
              <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                padding: "24px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}>
                <h3 style={{ color: "#8b5cf6", margin: "0 0 10px 0", fontSize: "2rem" }}>{stats.avgDistance}</h3>
                <p style={{ margin: 0, color: "#6b7280" }}>Avg Distance</p>
              </div>
              
              <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                padding: "24px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}>
                <h3 style={{ color: "#ef4444", margin: "0 0 10px 0", fontSize: "2rem" }}>{stats.avgPace}</h3>
                <p style={{ margin: 0, color: "#6b7280" }}>Avg Pace (min/unit)</p>
              </div>
            </div>

            <div style={{
              background: "rgba(255, 255, 255, 0.95)",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              marginBottom: "24px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}>
              <h3 style={{ textAlign: "center", marginBottom: "20px", color: "#1f2937" }}>Distance Progress 🏃‍♀️</h3>
              <div style={{
                display: "flex",
                alignItems: "end",
                justifyContent: "center",
                height: "250px",
                padding: "20px 0"
              }}>
                {createDistanceChart()}
              </div>
            </div>

            <div style={{
              background: "rgba(255, 255, 255, 0.95)",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              marginBottom: "24px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}>
              <h3 style={{ textAlign: "center", marginBottom: "20px", color: "#1f2937" }}>Duration Progress ⏱️</h3>
              <div style={{
                display: "flex",
                alignItems: "end",
                justifyContent: "center",
                height: "250px",
                padding: "20px 0"
              }}>
                {createDurationChart()}
              </div>
            </div>
          </>
        ) : (
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            padding: "50px",
            borderRadius: "12px",
            textAlign: "center",
            color: "#6b7280"
          }}>
            <h3 style={{ color: "#374151" }}>No runs found for the selected time period</h3>
            <p>Start logging your runs to see your progress!</p>
            <button 
              onClick={() => window.location.href = "/dashboard"}
              className="btn btn-primary"
              style={{ marginTop: "20px" }}
            >
              Log Your First Run
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressChart;
