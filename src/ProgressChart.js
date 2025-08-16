import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "./firebase";
import Navigation from "./Navigation";

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

  // Create simple charts using CSS and divs (no external library needed)
  const createDistanceChart = () => {
    if (runs.length === 0) return null;
    
    const maxDistance = Math.max(...runs.map(run => run.distance));
    
    return runs.map((run, index) => {
      const height = (run.distance / maxDistance) * 200; // Max height 200px
      const width = Math.max(400 / runs.length - 5, 20); // Responsive width
      
      return (
        <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0 2px" }}>
          <div style={{ fontSize: "10px", marginBottom: "5px", height: "20px" }}>
            {run.distance}
          </div>
          <div
            style={{
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: "#007bff",
              borderRadius: "2px 2px 0 0",
              transition: "all 0.3s ease"
            }}
            title={`${run.date}: ${run.distance} miles in ${run.duration} minutes`}
          ></div>
          <div style={{ fontSize: "8px", marginTop: "5px", transform: "rotate(-45deg)", transformOrigin: "center" }}>
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
          <div style={{ fontSize: "10px", marginBottom: "5px", height: "20px" }}>
            {run.duration}m
          </div>
          <div
            style={{
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: "#28a745",
              borderRadius: "2px 2px 0 0"
            }}
            title={`${run.date}: ${run.distance} miles in ${run.duration} minutes`}
          ></div>
          <div style={{ fontSize: "8px", marginTop: "5px", transform: "rotate(-45deg)", transformOrigin: "center" }}>
            {new Date(run.date).getMonth() + 1}/{new Date(run.date).getDate()}
          </div>
        </div>
      );
    });
  };

  const containerStyle = {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "20px"
  };

  const controlsStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "30px"
  };

  const buttonStyle = (active) => ({
    padding: "10px 20px",
    border: "1px solid #007bff",
    backgroundColor: active ? "#007bff" : "white",
    color: active ? "white" : "#007bff",
    borderRadius: "5px",
    cursor: "pointer"
  });

  const statsStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "20px",
    marginBottom: "30px"
  };

  const statItemStyle = {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    border: "1px solid #dee2e6"
  };

  const chartContainerStyle = {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #dee2e6",
    marginBottom: "20px"
  };

  const chartStyle = {
    display: "flex",
    alignItems: "end",
    justifyContent: "center",
    height: "250px",
    padding: "20px 0"
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div style={{ textAlign: "center", padding: "50px" }}>Loading your progress...</div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div style={containerStyle}>
        <h2>Your Running Progress 📈</h2>
        
        <div style={controlsStyle}>
          <button 
            style={buttonStyle(timeFrame === "week")}
            onClick={() => setTimeFrame("week")}
          >
            Last Week
          </button>
          <button 
            style={buttonStyle(timeFrame === "month")}
            onClick={() => setTimeFrame("month")}
          >
            Last Month
          </button>
          <button 
            style={buttonStyle(timeFrame === "year")}
            onClick={() => setTimeFrame("year")}
          >
            Last Year
          </button>
        </div>

        {stats ? (
          <>
            <div style={statsStyle}>
              <div style={statItemStyle}>
                <h3 style={{ color: "#007bff", margin: "0 0 10px 0" }}>{stats.totalRuns}</h3>
                <p style={{ margin: 0 }}>Total Runs</p>
              </div>
              <div style={statItemStyle}>
                <h3 style={{ color: "#28a745", margin: "0 0 10px 0" }}>{stats.totalDistance}</h3>
                <p style={{ margin: 0 }}>Total Distance</p>
              </div>
              <div style={statItemStyle}>
                <h3 style={{ color: "#ffc107", margin: "0 0 10px 0" }}>{stats.totalTime}</h3>
                <p style={{ margin: 0 }}>Total Minutes</p>
              </div>
              <div style={statItemStyle}>
                <h3 style={{ color: "#17a2b8", margin: "0 0 10px 0" }}>{stats.avgDistance}</h3>
                <p style={{ margin: 0 }}>Avg Distance</p>
              </div>
              <div style={statItemStyle}>
                <h3 style={{ color: "#6f42c1", margin: "0 0 10px 0" }}>{stats.avgPace}</h3>
                <p style={{ margin: 0 }}>Avg Pace (min/unit)</p>
              </div>
            </div>

            <div style={chartContainerStyle}>
              <h3 style={{ textAlign: "center", marginBottom: "20px" }}>Distance Progress 🏃‍♀️</h3>
              <div style={chartStyle}>
                {createDistanceChart()}
              </div>
            </div>

            <div style={chartContainerStyle}>
              <h3 style={{ textAlign: "center", marginBottom: "20px" }}>Duration Progress ⏱️</h3>
              <div style={chartStyle}>
                {createDurationChart()}
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
            <h3>No runs found for the selected time period</h3>
            <p>Start logging your runs to see your progress!</p>
            <button 
              onClick={() => window.location.href = "/dashboard"}
              style={{
                padding: "15px 30px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontSize: "16px",
                cursor: "pointer"
              }}
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
