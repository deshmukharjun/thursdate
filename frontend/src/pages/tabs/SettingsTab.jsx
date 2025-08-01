import { authAPI, userAPI } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

const SettingItem = ({ title, value, onClick, isDestructive = false, isButton = false, disabled = false }) => (
  <div onClick={!disabled ? onClick : null} className={`flex justify-between items-center py-3 border-b border-gray-200 cursor-pointer last:border-b-0 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
    <div>
      <p className={`text-sm ${isDestructive ? "text-red-500 font-semibold" : "text-gray-800"}`}>{title}</p>
      {value && <p className="text-xs text-gray-500 mt-1">{value}</p>}
    </div>
    {onClick && !isDestructive && (
      <img src="/right-icon.svg" alt="Arrow" className="w-4 h-4" />
    )}
  </div>
);

const SettingsGroup = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-sm mb-4">
    {title && <h3 className="text-md font-semibold text-gray-800 p-4 border-b border-gray-200">{title}</h3>}
    <div className="p-4">
      {children}
    </div>
  </div>
);

export default function SettingsTab() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Wrap fetchUserInfo in useCallback to keep its reference stable
  const fetchUserInfo = useCallback(async () => {
    setError("");
    try {
      const userData = await userAPI.getProfile();
      setUserInfo(userData);
    } catch (err) {
      setError("Failed to fetch user data. Please try again.");
    } finally {
      // Only show the main loading spinner on the first load
      if (loading) {
        setLoading(false);
      }
    }
  }, [loading]);

  // This effect runs once on initial mount
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  // This effect adds a listener to re-fetch data when the window is focused
  useEffect(() => {
    // When the user navigates back to this tab, it will re-fetch the data
    window.addEventListener('focus', fetchUserInfo);
    
    // Cleanup function to remove the listener
    return () => {
      window.removeEventListener('focus', fetchUserInfo);
    };
  }, [fetchUserInfo]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigate("/login");
    } catch (err) {
      setError("Failed to logout. Please try again.");
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm("Are you sure you want to delete your profile? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      await authAPI.deleteAccount();
      authAPI.logout();
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

const handleBack = () => {
  navigate("/home", { state: { selectedTab: "profile" } });
};
  
  const formatAgePreference = (intent) => {
    if (!intent || !intent.preferredAgeRange || intent.preferredAgeRange.length < 2) {
      return "Not set";
    }
    const [min, max] = intent.preferredAgeRange;
    return `${min}-${max} years`;
  };

  const formatInterestedIn = (intent) => {
    if (!intent || !intent.interestedGender) {
      return "Not set";
    }
    return intent.interestedGender;
  };

  const formatAccountPrivacy = (user) => {
    if (!user) return "Public"; // Default value
    return user.isPrivate ? "Private" : "Public";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p>Loading settings...</p>
      </div>
    );
  }

  if (error && !userInfo) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button onClick={handleBack} className="w-8 h-8 flex items-center justify-center">
              <img src="/backarrow.svg" alt="Back" width={24} height={24} />
            </button>
            <div className="flex-1 text-center text-lg font-semibold text-gray-800">Settings</div>
            <div style={{ width: 32 }}></div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pb-20 p-4 max-w-md mx-auto w-full text-center text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button onClick={handleBack} className="w-8 h-8 flex items-center justify-center">
            <img src="/backarrow.svg" alt="Back" width={24} height={24} />
          </button>
          <div className="flex-1 text-center text-lg font-semibold text-gray-800">
            Settings
          </div>
          <div style={{ width: 32 }}></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-20 p-4 max-w-md mx-auto w-full">
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <SettingsGroup title="Preferences">
          <SettingItem
            title="Age preference"
            value={formatAgePreference(userInfo?.intent)}
            onClick={() => navigate("/settings/age-preference")}
          />
          <SettingItem
            title="Interested in"
            value={formatInterestedIn(userInfo?.intent)}
            onClick={() => navigate("/settings/gender-preference")}
          />
        </SettingsGroup>

        <SettingsGroup title="Account Details">
          <SettingItem title="Direct Requests" value="2" onClick={() => navigate('/settings/direct-requests')} />
          <SettingItem title="Direct Personal Image" value="3/month" onClick={() => navigate('/settings/personal-image')} />
          <SettingItem title="Email address" value={userInfo?.email || "Not set"} />
          <SettingItem
            title="Account privacy"
            value={formatAccountPrivacy(userInfo)}
            onClick={() => navigate("/settings/account-privacy")}
          />
          <SettingItem
            title="Blocked"
            value="05"
            onClick={() => navigate("/settings/blocked-accounts")}
          />
        </SettingsGroup>

        <SettingsGroup title="Manage subscription">
          <SettingItem
            title="Membership"
            value="Monthly"
            onClick={() => navigate("/settings/membership")}
          />
        </SettingsGroup>

        <SettingsGroup title="App and media">
          <SettingItem
            title="Device permissions"
            onClick={() => navigate("/settings/device-permissions")}
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingItem title="Email us" />
          <SettingItem title="Terms & Conditions" />
          <SettingItem title="Privacy Policy" />
          <SettingItem
            title="Logout"
            onClick={handleLogout}
            isDestructive={true}
            isButton={true}
          />
          <SettingItem
            title={deleting ? "Deleting..." : "Delete Account"}
            onClick={handleDeleteProfile}
            isDestructive={true}
            isButton={true}
            disabled={deleting}
          />
        </SettingsGroup>
      </div>
    </div>
  );
}