import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

function TrainingPlan() {
  const [plan, setPlan] = useState("");

  useEffect(() => {
    const fetchPlan = async () => {
      const planRef = doc(db, "trainingPlans", auth.currentUser.uid);
      const planSnap = await getDoc(planRef);
      if (planSnap.exists()) {
        setPlan(planSnap.data().planText);
      } else {
        setPlan("No training plan found. Complete onboarding!");
      }
    };
    fetchPlan();
  }, []);

  return (
    <div>
      <h2>Your Weekly Training Plan</h2>
      <pre>{plan}</pre>
    </div>
  );
}

export default TrainingPlan;
