import { useState, useEffect } from "react";
import { userAPI } from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function ProfileTab() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  // Use lifestyle image as background if available
  const bgUrl = userInfo && userInfo.intent && userInfo.intent.lifestyleImageUrls && userInfo.intent.lifestyleImageUrls.length > 0 && userInfo.intent.lifestyleImageUrls[0]
    ? userInfo.intent.lifestyleImageUrls[0]
    : "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80";
  // Placeholder images
  const pfpUrl = "https://randomuser.me/api/portraits/men/32.jpg";

  // Helper to calculate age from dob
  function getAge(dob) {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  return (
    <div className="w-full max-w-md mx-auto pb-6">
      {loading && <div className="text-center text-gray-500">Loading...</div>}
      {error && <div className="text-red-500 text-center">{error}</div>}
      {/* Profile Header with background and avatar */}
      <div className="relative h-72 rounded-2xl overflow-hidden shadow-md mt-5">
        <img src={bgUrl} alt="Background" className="w-full h-full object-cover" />
        {/* Settings button */}
        <button
          className="absolute top-4 right-4 bg-white rounded-full p-2 shadow hover:bg-gray-100 transition"
          onClick={() => navigate('/settings')}
        >
          <img src="/setting-icon.svg" alt="Settings" className="w-6 h-6" />
        </button>
        {/* Profile picture at top left */}
        {userInfo && userInfo.profilePicUrl && (
          <div
            className="absolute top-4 left-4 z-30 w-20 h-20 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}
          >
            <img
              src={userInfo.profilePicUrl}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        )}
      </div>
      {/* Main Info Card */}
      <div className="mt-16 px-4 flex flex-col items-center">
        <div className="text-2xl font-semibold text-gray-900">
          {userInfo ? `${userInfo.firstName || ''}${userInfo.lastName ? ', ' + userInfo.lastName : ''}${userInfo.dob ? ', ' + getAge(userInfo.dob) : ''}` : 'Name, Age'}
        </div>
        {userInfo && userInfo.gender && (
          <div className="text-sm text-gray-500 font-medium">{userInfo.gender}</div>
        )}
        {userInfo && userInfo.email && (
          <div className="text-sm text-blue-600 font-medium">{userInfo.email}</div>
        )}
        {userInfo && userInfo.currentLocation && (
          <div className="text-xs text-gray-400">{userInfo.currentLocation}</div>
        )}
        <button
          className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center gap-2 shadow hover:bg-gray-50 transition"
          onClick={() => navigate('/edit-profile')}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/></svg>
          Edit Profile
        </button>
      </div>
      {/* Bio Card */}
      <div className="mt-8 px-4 flex flex-col gap-4">
        <div className="bg-white rounded-xl shadow p-4 mb-0 relative">
          <div className="flex items-center gap-2 mb-2 font-semibold text-gray-700">Bio
            <button className="ml-auto" onClick={() => navigate('/edit-profile')}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/></svg>
            </button>
          </div>
          <div className="text-gray-700 text-sm">
            {userInfo && ((userInfo.intent && userInfo.intent.bio) ? userInfo.intent.bio : userInfo.bio)
              ? (userInfo.intent && userInfo.intent.bio ? userInfo.intent.bio : userInfo.bio)
              : 'No bio set yet.'}
          </div>
        </div>
        {/* About Card */}
        <div className="bg-white rounded-xl shadow p-4 relative mb-0">
          <div className="flex items-center gap-2 mb-2 font-semibold text-gray-700">About
            <button className="ml-auto" onClick={() => navigate('/edit-profile')}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/></svg>
            </button>
          </div>
          <div className="text-sm text-gray-700 space-y-3">
            <div>
              <div className="text-xs text-gray-400 font-semibold mb-1">Gender</div>
              <div className="flex items-center gap-2">
                {/* No icon for gender */}
                <span>{userInfo && userInfo.gender}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold mb-1">Age</div>
              <div className="flex items-center gap-2">
                <img src="/age-icon.svg" alt="Age" className="w-4 h-4" />
                <span>{userInfo && userInfo.dob ? getAge(userInfo.dob) + ' Years' : ''}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold mb-1">Lives In</div>
              <div className="flex items-center gap-2">
                <img src="/location-icon.svg" alt="Location" className="w-4 h-4" />
                <span>{userInfo && userInfo.currentLocation}</span>
              </div>
            </div>
            {userInfo && userInfo.from && (
              <div>
                <div className="text-xs text-gray-400 font-semibold mb-1">From</div>
                <div className="flex items-center gap-2">
                  <img src="/location-icon.svg" alt="From" className="w-4 h-4" />
                  <span>{userInfo.from}</span>
                </div>
              </div>
            )}
            {userInfo && userInfo.instagram && (
              <div>
                <div className="text-xs text-gray-400 font-semibold mb-1">Instagram</div>
                <div className="flex items-center gap-2">
                  {/* Instagram icon can remain inline or be replaced if you have a file */}
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" stroke="#A0AEC0" strokeWidth="2"/><circle cx="12" cy="12" r="5" stroke="#A0AEC0" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="#A0AEC0"/></svg>
                  <span className="text-blue-600">@{userInfo.instagram}</span>
                </div>
              </div>
            )}
            {userInfo && userInfo.linkedin && (
              <div>
                <div className="text-xs text-gray-400 font-semibold mb-1">LinkedIn</div>
                <div className="flex items-center gap-2">
                  {/* LinkedIn icon can remain inline or be replaced if you have a file */}
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" stroke="#A0AEC0" strokeWidth="2"/><path d="M7 10v7" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round"/><path d="M7 7v.01" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round"/><path d="M11 14v-4a2 2 0 1 1 4 0v4" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round"/><path d="M11 17v-3.5" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round"/></svg>
                  <a href={userInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 break-all">{userInfo.linkedin}</a>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Interest Card */}
        <div className="bg-white rounded-xl shadow p-4 relative mb-0">
          <div className="flex items-center gap-2 mb-2 font-semibold text-gray-900">Interest
            <button className="ml-auto" onClick={() => navigate('/edit-profile')}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/></svg>
            </button>
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
        <div className="bg-white rounded-xl shadow p-4 relative mb-0">
          <div className="flex items-center gap-2 mb-2 font-semibold text-gray-900">BingeBox
            <button className="ml-auto" onClick={() => navigate('/edit-profile')}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/></svg>
            </button>
          </div>
          <div className="text-sm text-gray-700 space-y-4">
            <div>
              <div className="text-xs text-gray-400 font-semibold mb-1">favourite TV show</div>
              <div className="flex items-center gap-2">
                <img src="/tvshow-icon.svg" alt="TV Show" className="w-4 h-4" />
                <span>{userInfo && userInfo.intent && userInfo.intent.tvShow ? userInfo.intent.tvShow : 'Not set'}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold mb-1">favourite movie</div>
              <div className="flex items-center gap-2">
                <img src="/movie-icon.svg" alt="Movie" className="w-4 h-4" />
                <span>{userInfo && userInfo.intent && userInfo.intent.movie ? userInfo.intent.movie : 'Not set'}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold mb-1">Watchlists</div>
              <div className="flex items-center gap-2">
                <img src="/watchlist-icon.svg" alt="Watchlist" className="w-4 h-4" />
                <span>{userInfo && userInfo.intent && userInfo.intent.watchList ? userInfo.intent.watchList : 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 