import React, { useState, useEffect } from "react";
import { userAPI } from "../utils/api";
import { useNavigate } from "react-router-dom";

const navOptions = [
  { key: "matches", label: "Matches", icon: "/matches-icon.svg" },
  { key: "game", label: "Game", icon: "/game-icon.svg" },
  { key: "discover", label: "Discover", icon: "/discover-icon.svg" },
  { key: "chats", label: "Chats", icon: "/chats-icon.svg" },
  { key: "profile", label: "Profile", icon: "/profile-icon.svg" },
];

export default function EditProfileTab() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selected, setSelected] = useState("profile");
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSection, setModalSection] = useState(null); // 'bio', 'about', 'interest', 'bingebox'
  const [modalValue, setModalValue] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalAbout, setModalAbout] = useState({ gender: "", dob: "", currentLocation: "", work: "" });
  const [modalInterest, setModalInterest] = useState([]);
  const [modalBinge, setModalBinge] = useState({ tvShow: '', movie: '', watchList: '' });


  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      setError("");
      try {
        const userData = await userAPI.getProfile();
        setUserInfo(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await userAPI.updateProfile(userInfo);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Modal open handlers
  const openModal = (section) => {
    setModalSection(section);
    setModalError("");
    if (section === "bio") {
      setModalValue(userInfo?.intent?.bio || userInfo?.bio || "");
    } else if (section === "about") {
      setModalAbout({
        gender: userInfo?.gender || "",
        currentLocation: userInfo?.currentLocation || "",
        work: userInfo?.work || "",
      });
    } else if (section === "interest") {
      setModalInterest(userInfo?.intent?.interests || []);
    } else if (section === "bingebox") {
      setModalBinge({
        tvShow: userInfo?.intent?.tvShow || '',
        movie: userInfo?.intent?.movie || '',
        watchList: userInfo?.intent?.watchList || '',
      });
    }
    setModalOpen(true);
  };

  // Modal save handler
  const handleModalSave = async () => {
    setModalLoading(true);
    setModalError("");
    try {
      let updateData = {};
      
      if (modalSection === "bio") {
        updateData = { intent: { ...userInfo.intent, bio: modalValue } };
        setUserInfo((prev) => ({ ...prev, intent: { ...prev.intent, bio: modalValue } }));
      } else if (modalSection === "about") {
        updateData = {
          gender: modalAbout.gender,
          dob: modalAbout.dob,
          currentLocation: modalAbout.currentLocation,
          work: modalAbout.work,
        };
        setUserInfo((prev) => ({ ...prev, ...modalAbout }));
      } else if (modalSection === "interest") {
        updateData = { intent: { ...userInfo.intent, interests: modalInterest } };
        setUserInfo((prev) => ({ ...prev, intent: { ...prev.intent, interests: modalInterest } }));
      } else if (modalSection === "bingebox") {
        updateData = {
          intent: { 
            ...userInfo.intent, 
            tvShow: modalBinge.tvShow, 
            movie: modalBinge.movie, 
            watchList: modalBinge.watchList 
          }
        };
        setUserInfo((prev) => ({
          ...prev,
          intent: { ...prev.intent, tvShow: modalBinge.tvShow, movie: modalBinge.movie, watchList: modalBinge.watchList },
        }));
      }
      
      await userAPI.updateProfile(updateData);
      setModalOpen(false);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
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
            Edit Profile
          </div>
          <div style={{ width: 24 }}></div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20 px-2 max-w-md mx-auto w-full">
        {/* Profile Picture Card */}
        <div className="bg-white rounded-xl shadow p-4 mt-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-gray-900">Your Profile picture</div>
            <div className="text-xs text-gray-400">{userInfo && userInfo.profilePicUrl ? '1 image' : 'No image'}</div>
          </div>
          <div className="flex flex-col items-center justify-center mb-2">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 mb-2">
              {userInfo && userInfo.profilePicUrl ? (
                <img src={userInfo.profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>
            <button 
              className="mt-2 px-4 py-1 rounded-lg bg-black text-white text-sm font-semibold"
              onClick={() => navigate('/edit-profile-picture')}
            >
              Edit profile picture
            </button>
          </div>
        </div>
        {/* Lifestyle Pictures Card */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-gray-900">Your Lifestyle pictures</div>
            <div className="text-xs text-gray-400">{userInfo && userInfo.intent && userInfo.intent.lifestyleImageUrls ? `${userInfo.intent.lifestyleImageUrls.filter(Boolean).length} Images` : '0 Images'}</div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto mb-2">
            {userInfo && userInfo.intent && userInfo.intent.lifestyleImageUrls && userInfo.intent.lifestyleImageUrls.filter(Boolean).length > 0 ? (
              userInfo.intent.lifestyleImageUrls.filter(Boolean).map((url, idx) => (
                <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
                  <img src={url} alt={`Lifestyle ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))
            ) : (
              <div className="w-full h-20 bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg">No Images</div>
            )}
          </div>
          <button 
            className="mt-2 px-4 py-1 rounded-lg bg-black text-white text-sm font-semibold"
            onClick={() => navigate('/edit-lifestyle-images')}
          >
            Edit lifestyle pictures
          </button>
        </div>
        {/* Bio Card */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-900 flex-1">Bio</span>
            <button className="text-xs text-blue-600 font-semibold" onClick={() => openModal("bio")}>Edit</button>
          </div>
          <div className="text-gray-700 text-sm">
            {userInfo && userInfo.intent && userInfo.intent.bio ? userInfo.intent.bio : (userInfo && userInfo.bio ? userInfo.bio : 'No bio set yet.')}
          </div>
        </div>
        {/* About Card */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="flex items-center gap-2 mb-2 font-semibold text-gray-900">About
            <button className="ml-auto text-xs text-blue-600 font-semibold" onClick={() => openModal("about")}>Edit</button>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            {userInfo && userInfo.gender && (
              <div><span className="font-medium">Gender</span> <span className="ml-2">{userInfo.gender}</span></div>
            )}
            {userInfo && userInfo.currentLocation && (
              <div><span className="font-medium">Lives in</span> <span className="ml-2">{userInfo.currentLocation}</span></div>
            )}
            {userInfo && userInfo.work && (
              <div><span className="font-medium">Work</span> <span className="ml-2">{userInfo.work}</span></div>
            )}
          </div>
        </div>
        {/* Interest Card */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="flex items-center gap-2 mb-2 font-semibold text-gray-900">Interest
            <button className="ml-auto text-xs text-blue-600 font-semibold" onClick={() => openModal("interest")}>Edit</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {userInfo && userInfo.intent && userInfo.intent.interests && userInfo.intent.interests.length > 0 ? (
              userInfo.intent.interests.map((interest, idx) => (
                <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-700">{interest}</span>
              ))
            ) : (
              <span className="text-gray-400 text-xs">No interests set yet.</span>
            )}
          </div>
        </div>
        {/* BingeBox Card */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="flex items-center gap-2 mb-2 font-semibold text-gray-900">BingeBox
            <button className="ml-auto text-xs text-blue-600 font-semibold" onClick={() => openModal("bingebox")}>Edit</button>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <div><span className="font-medium">Favourite TV show</span> <span className="ml-2">{userInfo && userInfo.intent && userInfo.intent.tvShow ? userInfo.intent.tvShow : 'Not set'}</span></div>
            <div><span className="font-medium">Favourite movie</span> <span className="ml-2">{userInfo && userInfo.intent && userInfo.intent.movie ? userInfo.intent.movie : 'Not set'}</span></div>
            <div><span className="font-medium">Current watch list</span> <span className="ml-2">{userInfo && userInfo.intent && userInfo.intent.watchList ? userInfo.intent.watchList : 'Not set'}</span></div>
          </div>
        </div>
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
      {/* Modal for editing sections */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setModalOpen(false)}>&times;</button>
            <h2 className="text-lg font-semibold mb-4 capitalize">Edit {modalSection}</h2>
            {modalSection === "bio" && (
              <textarea
                className="w-full border border-gray-200 rounded-lg p-3 mb-4 min-h-[100px]"
                value={modalValue}
                onChange={e => setModalValue(e.target.value)}
                maxLength={300}
              />
            )}
            {modalSection === "about" && (
              <div className="space-y-3">
                <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Gender" value={modalAbout.gender} onChange={e => setModalAbout(a => ({ ...a, gender: e.target.value }))} />
                <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Current Location" value={modalAbout.currentLocation} onChange={e => setModalAbout(a => ({ ...a, currentLocation: e.target.value }))} />
                <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Work" value={modalAbout.work} onChange={e => setModalAbout(a => ({ ...a, work: e.target.value }))} />
              </div>
            )}
            {modalSection === "interest" && (
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Add interest and press Enter"
                  onKeyDown={e => {
                    if (e.key === "Enter" && e.target.value.trim()) {
                      setModalInterest(prev => [...prev, e.target.value.trim()]);
                      e.target.value = "";
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {modalInterest.map((interest, idx) => (
                    <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-700 flex items-center">
                      {interest}
                      <button className="ml-2 text-gray-400 hover:text-red-500" onClick={() => setModalInterest(prev => prev.filter((_, i) => i !== idx))}>&times;</button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {modalSection === "bingebox" && (
              <div className="space-y-3">
                <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Favourite TV show" value={modalBinge.tvShow} onChange={e => setModalBinge(b => ({ ...b, tvShow: e.target.value }))} />
                <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Favourite movie" value={modalBinge.movie} onChange={e => setModalBinge(b => ({ ...b, movie: e.target.value }))} />
                <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Current watch list" value={modalBinge.watchList} onChange={e => setModalBinge(b => ({ ...b, watchList: e.target.value }))} />
              </div>
            )}
            {modalError && <div className="text-red-500 text-sm mt-2">{modalError}</div>}
            <button
              className="w-full mt-6 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition"
              onClick={handleModalSave}
              disabled={modalLoading}
            >
              {modalLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 