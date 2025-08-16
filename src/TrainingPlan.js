import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import Navigation from "./Navigation";

function TrainingPlan() {
  const [plan, setPlan] = useState("");
  const [completedDays, setCompletedDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [planData, setPlanData] = useState(null);

  useEffect(() => {
    fetchPlanAndProfile();
  }, []);

  const fetchPlanAndProfile = async () => {
    try {
      // Fetch training plan
      const planRef = doc(db, "trainingPlans", auth.currentUser.uid);
      const planSnap = await getDoc(planRef);
      
      // Fetch user profile
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (planSnap.exists()) {
        const planData = planSnap.data();
        console.log("Training plan data:", planData);
        setPlanData(planData);
        setPlan(planData.planText || "");
        setCompletedDays(planData.completedDays || []);
      } else {
        setPlan("No training plan found. Complete onboarding to get your personalized plan!");
      }

      if (userSnap.exists()) {
        setUserProfile(userSnap.data());
      }
    } catch (error) {
      console.error("Error fetching plan:", error);
      setPlan("Error loading training plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleDayCompletion = async (dayKey) => {
    try {
      const updatedCompletedDays = completedDays.includes(dayKey)
        ? completedDays.filter(day => day !== dayKey)
        : [...completedDays, dayKey];

      setCompletedDays(updatedCompletedDays);

      // Update in Firestore
      const planRef = doc(db, "trainingPlans", auth.currentUser.uid);
      await updateDoc(planRef, {
        completedDays: updatedCompletedDays
      });
    } catch (error) {
      console.error("Error updating completion status:", error);
    }
  };

  const parsePlanIntoDays = (planText) => {
    if (!planText) return null;
    
    // All days of the week in order
    const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const daysMap = {};
    
    // Initialize all days
    allDays.forEach(day => {
      daysMap[day] = {
        day: day,
        activities: []
      };
    });
    
    // Try to parse the plan into daily activities
    const lines = planText.split('\n').filter(line => line.trim());
    let currentDay = null;

    lines.forEach(line => {
      // Check if line contains day indicators (more flexible matching)
      const dayMatch = line.match(/\*?\*?(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\*?\*?:?/i);
      if (dayMatch) {
        const dayName = dayMatch[1];
        currentDay = dayName;
        
        // Extract activity from the same line if it exists
        const activityMatch = line.match(/\*?\*?(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\*?\*?:?\s*(.+)/i);
        if (activityMatch && activityMatch[2] && activityMatch[2].trim()) {
          daysMap[dayName].activities.push(activityMatch[2].trim());
        }
      } else if (currentDay && line.trim() && !line.match(/^(Here's|This|Welcome|Feel free|Remember)/i)) {
        // Filter out intro/outro text and add meaningful activities
        const cleanLine = line.replace(/^[-*•]\s*/, '').trim(); // Remove bullet points
        if (cleanLine.length > 3) { // Only add substantial content
          daysMap[currentDay].activities.push(cleanLine);
        }
      }
    });

    // Ensure all days have at least something
    allDays.forEach(day => {
      if (daysMap[day].activities.length === 0) {
        daysMap[day].activities.push("Rest day - Take it easy and let your body recover!");
      }
    });

    // Convert back to array format in order
    const orderedDays = allDays.map(day => daysMap[day]);
    
    return orderedDays.length > 0 ? orderedDays : null;
  };

  const parsedDays = parsePlanIntoDays(plan);

  const containerStyle = {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px"
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "30px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "10px"
  };

  const dayCardStyle = {
    backgroundColor: "#fff",
    border: "1px solid #dee2e6",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  };

  const dayHeaderStyle = (isCompleted) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    padding: "10px",
    backgroundColor: isCompleted ? "#d4edda" : "#f8f9fa",
    borderRadius: "5px",
    border: `2px solid ${isCompleted ? "#28a745" : "#dee2e6"}`
  });

  const checkboxStyle = {
    width: "20px",
    height: "20px",
    cursor: "pointer"
  };

  const activityStyle = {
    padding: "8px 0",
    borderBottom: "1px solid #eee",
    lineHeight: "1.5"
  };

  const plainTextStyle = {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "10px",
    whiteSpace: "pre-line",
    fontFamily: "Arial, sans-serif",
    lineHeight: "1.6"
  };

  const refreshButtonStyle = {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "20px"
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div style={{ textAlign: "center", padding: "50px" }}>Loading your training plan...</div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2>Your Training Plan</h2>
          {userProfile && (
            <p style={{ color: "#666", margin: "10px 0 0 0" }}>
              Designed by {userProfile.coachName} for your goal: {userProfile.goal}
            </p>
          )}
          {planData?.generatedByAI && (
            <p style={{ color: "#28a745", fontWeight: "bold", margin: "10px 0 0 0" }}>
              ✨ AI-Generated Personalized Plan
            </p>
          )}
          {parsedDays && (
            <p style={{ color: "#28a745", fontWeight: "bold", margin: "10px 0 0 0" }}>
              Progress: {completedDays.length} / {parsedDays.length} days completed
            </p>
          )}
        </div>

        {parsedDays ? (
          <div>
            {parsedDays.map((dayData, index) => {
              const dayKey = `${dayData.day}-${index}`;
              const isCompleted = completedDays.includes(dayKey);
              
              return (
                <div key={index} style={dayCardStyle}>
                  <div style={dayHeaderStyle(isCompleted)}>
                    <h3 style={{ margin: 0, color: isCompleted ? "#155724" : "#333" }}>
                      {dayData.day}
                    </h3>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => toggleDayCompletion(dayKey)}
                        style={checkboxStyle}
                      />
                      <span style={{ fontWeight: "bold" }}>
                        {isCompleted ? "Completed ✅" : "Mark as Complete"}
                      </span>
                    </label>
                  </div>
                  <div>
                    {dayData.activities.length > 0 ? (
                      dayData.activities.map((activity, actIndex) => (
                        <div key={actIndex} style={activityStyle}>
                          {activity}
                        </div>
                      ))
                    ) : (
                      <div style={activityStyle}>
                        <em>Rest day or no specific activities planned</em>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <div style={plainTextStyle}>
              {plan}
            </div>
            {plan.includes("No training plan found") && (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <p>Don't have a plan yet? Chat with your coach to get one!</p>
                <button 
                  onClick={() => window.location.href = "/chat"}
                  style={refreshButtonStyle}
                >
                  Chat with Coach
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button onClick={fetchPlanAndProfile} style={refreshButtonStyle}>
            Refresh Plan
          </button>
        </div>

        {/* Debug info */}
        <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "5px", fontSize: "12px", color: "#666" }}>
          <strong>Debug Info:</strong><br />
          Plan exists: {plan ? "Yes" : "No"}<br />
          AI Generated: {planData?.generatedByAI ? "Yes" : "No"}<br />
          Parsed days: {parsedDays ? parsedDays.length : 0}<br />
          Last updated: {planData?.createdAt ? new Date(planData.createdAt).toLocaleString() : "Unknown"}
        </div>
      </div>
    </div>
  );
}

export default TrainingPlan;
