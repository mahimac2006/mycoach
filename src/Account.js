import React, { useState, useEffect } from "react";
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navigation";

function Account() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        const profile = userDoc.data();
        setUserProfile(profile);
        setEditForm(profile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Error signing out. Please try again.");
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), editForm);
      setUserProfile(editForm);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    try {
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        passwordForm.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, passwordForm.newPassword);
      
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
      alert("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      if (error.code === "auth/wrong-password") {
        alert("Current password is incorrect!");
      } else {
        alert("Error updating password. Please try again.");
      }
    }
  };

  const containerStyle = {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    color: "#000"
  };

  const cardStyle = {
    backgroundColor: "#fff",
    border: "1px solid #dee2e6",
    borderRadius: "10px",
    padding: "30px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    color: "#000"
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
    padding: "10px 20px",
    margin: "5px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px"
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#007bff",
    color: "white"
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#6c757d",
    color: "white"
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#dc3545",
    color: "white"
  };

  const profileItemStyle = {
    padding: "10px 0",
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    color: "#000"
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: "center", padding: "50px" }}>Loading account...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={containerStyle}>
        <h2>Account Settings</h2>

        {/* User Info Card */}
        <div style={cardStyle}>
          <h3>Profile Information</h3>
          <div style={profileItemStyle}>
            <strong>Email:</strong>
            <span>{auth.currentUser?.email}</span>
          </div>
          
          {userProfile && !editing && (
            <>
              <div style={profileItemStyle}>
                <strong>Age:</strong>
                <span>{userProfile.age}</span>
              </div>
              <div style={profileItemStyle}>
                <strong>Experience:</strong>
                <span>{userProfile.experience}</span>
              </div>
              <div style={profileItemStyle}>
                <strong>Goal:</strong>
                <span>{userProfile.goal}</span>
              </div>
              <div style={profileItemStyle}>
                <strong>Coach Style:</strong>
                <span>{userProfile.coachStyle}</span>
              </div>
              <div style={profileItemStyle}>
                <strong>Coach Name:</strong>
                <span>{userProfile.coachName}</span>
              </div>
              <button style={primaryButtonStyle} onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            </>
          )}

          {editing && (
            <>
              <input
                type="number"
                placeholder="Age"
                value={editForm.age}
                onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                style={inputStyle}
              />
              <select
                value={editForm.experience}
                onChange={(e) => setEditForm({...editForm, experience: e.target.value})}
                style={inputStyle}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <input
                placeholder="Running Goal"
                value={editForm.goal}
                onChange={(e) => setEditForm({...editForm, goal: e.target.value})}
                style={inputStyle}
              />
              <select
                value={editForm.coachStyle}
                onChange={(e) => setEditForm({...editForm, coachStyle: e.target.value})}
                style={inputStyle}
              >
                <option value="chill">Chill</option>
                <option value="serious">Serious</option>
                <option value="funny">Funny</option>
                <option value="supportive">Supportive</option>
              </select>
              <input
                placeholder="Coach Name"
                value={editForm.coachName}
                onChange={(e) => setEditForm({...editForm, coachName: e.target.value})}
                style={inputStyle}
              />
              <div>
                <button style={primaryButtonStyle} onClick={handleSaveProfile}>
                  Save Changes
                </button>
                <button style={secondaryButtonStyle} onClick={() => {
                  setEditing(false);
                  setEditForm(userProfile);
                }}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

        {/* Password Change Card */}
        <div style={cardStyle}>
          <h3>Change Password</h3>
          {!showPasswordForm ? (
            <button style={primaryButtonStyle} onClick={() => setShowPasswordForm(true)}>
              Change Password
            </button>
          ) : (
            <form onSubmit={handlePasswordChange}>
              <input
                type="password"
                placeholder="Current Password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                style={inputStyle}
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                style={inputStyle}
                required
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                style={inputStyle}
                required
              />
              <div>
                <button type="submit" style={primaryButtonStyle}>
                  Update Password
                </button>
                <button type="button" style={secondaryButtonStyle} onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Logout Card */}
        <div style={cardStyle}>
          <h3>Account Actions</h3>
          <button style={dangerButtonStyle} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Account;