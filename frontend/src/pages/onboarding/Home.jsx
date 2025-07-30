import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HomeTab from "../tabs/HomeTab";
import ExploreTab from "../tabs/ExploreTab";
import MessagesTab from "../tabs/MessagesTab";
import ProfileTab from "../tabs/ProfileTab";
import GameTab from "../tabs/GameTab";
import EditProfileTab from "../edits/EditProfileTab";
import SettingsTab from "../tabs/SettingsTab";
import { userAPI } from "../../utils/api";

const navOptions = [
  { key: "matches", label: "Matches", icon: "/matches-icon.svg" },
  { key: "game", label: "Game", icon: "/game-icon.svg" },
  { key: "discover", label: "Discover", icon: "/discover-icon.svg" },
  { key: "chats", label: "Chats", icon: "/chats-icon.svg" },
  { key: "profile", label: "Profile", icon: "/profile-icon.svg" },
];

export default function Home() {
  const [selected, setSelected] = useState("matches");
  const navigate = useNavigate();

  useEffect(() => {
    // Check approval status on mount
    const checkApproval = async () => {
      try {
        const userData = await userAPI.getProfile();
        if (!userData.approval) {
          navigate("/waitlist-status", { replace: true });
        }
      } catch (err) {
        // If error, optionally handle (e.g., logout or show error)
      }
    };
    checkApproval();
  }, [navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  let ContentComponent;
  switch (selected) {
    case "matches":
      ContentComponent = HomeTab; // Placeholder, replace with MatchesTab if available
      break;
    case "game":
      ContentComponent = GameTab;
      break;
    case "discover":
      ContentComponent = ExploreTab;
      break;
    case "chats":
      ContentComponent = MessagesTab;
      break;
    case "profile":
      // Nested routing for profile, edit-profile, and settings
      ContentComponent = () => {
        const [subTab, setSubTab] = useState("profile");
        useEffect(() => {
          // Listen to navigation events or implement your own logic to set subTab
        }, []);
        switch (window.location.pathname) {
          case "/edit-profile":
            return <EditProfileTab />;
          case "/settings":
            return <SettingsTab />;
          default:
            return <ProfileTab />;
        }
      };
      break;
    default:
      ContentComponent = HomeTab;
  }

  return (
    <div className="h-screen flex flex-col bg-white font-sans">
      <div className="p-4 border-b">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button onClick={handleBack} className="w-6 h-6 flex items-center justify-center">
            <img src="/backarrow.svg" alt="Back" width={24} height={24} />
          </button>
          <div className="text-gray-400 text-[14px] font-semibold mx-auto">
            ThursDate.
          </div>
          <div style={{ width: 24 }}></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-20 px-4">
        <ContentComponent />
      </div>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-sm flex justify-around items-center h-16">
        {navOptions.map(opt => {
          const isActive = selected === opt.key;
          return (
            <button
              key={opt.key}
              className={`flex-1 flex flex-col items-center justify-center transition-all focus:outline-none ${
                isActive ? "text-black font-bold" : "text-gray-400 font-normal"
              }`}
              onClick={() => setSelected(opt.key)}
            >
              <img
                src={opt.icon}
                alt={opt.label}
                className="mb-1"
                style={{
                  filter: isActive
                    ? "invert(0%) brightness(0)"
                    : "invert(60%) brightness(1)",
                  width: 24,
                  height: 24,
                }}
                width={24}
                height={24}
              />
              <span className="text-xs mt-0.5">{opt.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
