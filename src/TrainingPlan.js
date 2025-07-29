import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import Navbar from "./Navbar";

function TrainingPlan() {
  const [plan, setPlan] = useState("");
  const [completedDays, setCompletedDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

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
        setPlan(planData.planText);
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
    // Try to parse the plan into daily activities
    const lines = planText.split('\n').filter(line => line.trim());
    const days = [];
    let currentDay = null;

    lines.forEach(line => {
      // Check if line contains day indicators
      const dayMatch = line.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Day \d+)/i);
      if (dayMatch) {
        if (currentDay) {
          days.push(currentDay);
        }
        currentDay = {
          day: dayMatch[0],
          activities: []
        };
      } else if (currentDay && line.trim()) {
        currentDay.activities.push(line.trim());
      }
    });

    if (currentDay) {
      days.push(currentDay);
    }

    return days.length > 0 ? days : null;
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
    borderBottom: "1px solid #eee"
  };

  const plainTextStyle = {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "10px",
    whiteSpace: "pre-line",
    fontFamily: "monospace",
    lineHeight: "1.6"
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: "center", padding: "50px" }}>Loading your training plan...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2>Your Training Plan</h2>
          {userProfile && (
            <p style={{ color: "#666", margin: "10px 0 0 0" }}>
              Designed by {userProfile.coachName} for your goal: {userProfile.goal}
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
                    <h3 style={{ margin: 0 }}>{dayData.day}</h3>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => toggleDayCompletion(dayKey)}
                        style={checkboxStyle}
                      />
                      <span>{isCompleted ? "Completed ✅" : "Mark as Complete"}</span>
                    </label>
                  </div>
                  <div>
                    {dayData.activities.map((activity, actIndex) => (
                      <div key={actIndex} style={activityStyle}>
                        {activity}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={plainTextStyle}>
            {plan}
          </div>
        )}
      </div>
    </div>
  );
}

export default TrainingPlan;
