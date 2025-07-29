import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "./firebase";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Navbar from "./Navigation";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

      // Filter runs based on timeFrame
      const now = new Date();
      const filteredRuns = allRuns.filter(run => {
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

      setRuns(filteredRuns);
    } catch (error) {
      console.error("Error fetching runs:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: runs.map(run => {
      const date = new Date(run.date);
      return date.toLocaleDateString();
    }),
    datasets: [
      {
        label: "Distance (miles/km)",
        data: runs.map(run => run.distance),
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.1)",
        tension: 0.1,
        fill: true
      },
      {
        label: "Duration (minutes)",
        data: runs.map(run => run.duration),
        borderColor: "#28a745",
        backgroundColor: "rgba(40, 167, 69, 0.1)",
        tension: 0.1,
        fill: false,
        yAxisID: 'y1'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Running Progress - Last ${timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}`
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Distance'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Duration (min)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
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

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: "center", padding: "50px" }}>Loading your progress...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={containerStyle}>
        <h2>Your Running Progress</h2>
        
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

        {stats && (
          <div style={statsStyle}>
            <div style={statItemStyle}>
              <h3>{stats.totalRuns}</h3>
              <p>Total Runs</p>
            </div>
            <div style={statItemStyle}>
              <h3>{stats.totalDistance}</h3>
              <p>Total Distance</p>
            </div>
            <div style={statItemStyle}>
              <h3>{stats.totalTime}</h3>
              <p>Total Minutes</p>
            </div>
            <div style={statItemStyle}>
              <h3>{stats.avgDistance}</h3>
              <p>Avg Distance</p>
            </div>
            <div style={statItemStyle}>
              <h3>{stats.avgPace}</h3>
              <p>Avg Pace (min/unit)</p>
            </div>
          </div>
        )}

        {runs.length > 0 ? (
          <div style={{ height: "400px", marginTop: "30px" }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
            <h3>No runs found for the selected time period</h3>
            <p>Start logging your runs to see your progress!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressChart;
