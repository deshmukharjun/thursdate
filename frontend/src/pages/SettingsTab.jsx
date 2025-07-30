import { authAPI } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const navOptions = [
  { key: "matches", label: "Matches", icon: "/matches-icon.svg" },
  { key: "game", label: "Game", icon: "/game-icon.svg" },
  { key: "discover", label: "Discover", icon: "/discover-icon.svg" },
  { key: "chats", label: "Chats", icon: "/chats-icon.svg" },
  { key: "profile", label: "Profile", icon: "/profile-icon.svg" },
];

export default function SettingsTab() {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("profile");
  const navigate = useNavigate();

  const handleLogout = async () => {
    authAPI.logout();
    navigate("/login");
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm("Are you sure you want to delete your profile? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      await authAPI.deleteAccount();
      authAPI.logout();
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="h-screen flex flex-col bg-white font-sans">
      {/* Top Bar */}
      <div className="p-4 border-b">
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
      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto pb-20 px-4 max-w-md mx-auto w-full">
        <h2 className="text-xl font-semibold mb-6">Settings</h2>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        <button
          className="w-full py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition mb-4"
          onClick={handleLogout}
        >
          Logout
        </button>
        <button
          className="w-full py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-700 transition"
          onClick={handleDeleteProfile}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete Account"}
        </button>
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