import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Splash from "./pages/Splash";
import Gateway from "./pages/Gateway";
import UserInfo from "./pages/UserInfo";
import Referral from "./pages/Referral";
import ApplicationStatus from "./pages/ApplicationStatus";
import Privacy from "./pages/Privacy";
import Different from "./pages/Different";
import Permissions from "./pages/Permissions";
import WaitlistStatus from "./pages/WaitlistStatus";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import SettingsTab from "./pages/SettingsTab";
import EditProfileTab from "./pages/EditProfileTab";
import EditProfilePicture from "./pages/EditProfilePicture";
import EditLifestyleImages from "./pages/EditLifestyleImages";
import UserIntent from "./pages/UserIntent";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminWaitlist from "./pages/AdminWaitlist";
import AdminUsers from "./pages/AdminUsers";
import "@ncdai/react-wheel-picker/style.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/gateway" element={<Gateway />} />
        <Route path="/user-info" element={<UserInfo />} />
        <Route path="/referral" element={<Referral />} />
        <Route path="/application-status" element={<ApplicationStatus />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/different" element={<Different />} />
        <Route path="/permissions" element={<Permissions />} />
        <Route path="/waitlist-status" element={<WaitlistStatus />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/settings" element={<SettingsTab />} />
        <Route path="/edit-profile" element={<EditProfileTab />} />
        <Route path="/edit-profile-picture" element={<EditProfilePicture />} />
        <Route path="/edit-lifestyle-images" element={<EditLifestyleImages />} />
        <Route path="/user-intent" element={<UserIntent />} />
        
        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/waitlist" element={<AdminWaitlist />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}
