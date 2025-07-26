import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "./firebase";

function Dashboard() {
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [mood, setMood] = useState("happy");

  const handleSubmit = async () => {
    await addDoc(collection(db, "runs"), {
      userId: auth.currentUser.uid,
      date: new Date().toISOString().split("T")[0],
      distance,
      duration,
      mood,
    });
    alert("Run logged!");
  };

  return (
    <div>
      <h2>Log your run</h2>
      <input placeholder="Distance (mi/km)" onChange={e => setDistance(e.target.value)} />
      <input placeholder="Duration (minutes)" onChange={e => setDuration(e.target.value)} />
      <select onChange={e => setMood(e.target.value)}>
        <option value="happy">Happy</option>
        <option value="tired">Tired</option>
        <option value="motivated">Motivated</option>
      </select>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default Dashboard;