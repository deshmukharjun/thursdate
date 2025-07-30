import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Splash from "./pages/onboarding/Splash";
import Gateway from "./pages/onboarding/Gateway";
import UserInfo from "./pages/onboarding/UserInfo";
import Referral from "./pages/onboarding/Referral";
import ApplicationStatus from "./pages/onboarding/ApplicationStatus";
import Privacy from "./pages/onboarding/Privacy";
import Different from "./pages/onboarding/Different";
import Permissions from "./pages/onboarding/Permissions";
import WaitlistStatus from "./pages/onboarding/WaitlistStatus";
import Login from "./pages/onboarding/Login";
import Signup from "./pages/onboarding/Signup";
import Home from "./pages/onboarding/Home";
import SettingsTab from "./pages/tabs/SettingsTab";
import EditProfileTab from "./pages/edits/EditProfileTab";
import EditProfilePicture from "./pages/edits/EditProfilePicture";
import EditLifestyleImages from "./pages/edits/EditLifestyleImages";
import UserIntent from "./pages/onboarding/UserIntent";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminWaitlist from "./pages/admin/AdminWaitlist";
import AdminUsers from "./pages/admin/AdminUsers";
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
