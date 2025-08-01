import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../utils/api';

export default function AgePreferencePage() {
  const navigate = useNavigate();
  const [ageRange, setAgeRange] = useState([40, 60]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const minAge = 30;
  const maxAge = 85;
  const [activeThumb, setActiveThumb] = useState(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    const loadCurrentPreference = async () => {
      try {
        const userData = await userAPI.getProfile();
        if (userData.intent?.preferredAgeRange) {
          setAgeRange(userData.intent.preferredAgeRange);
        }
      } catch (err) {
        setError("Failed to load your preference.");
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };
    loadCurrentPreference();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      await userAPI.updateProfile({
        intent: {
          preferredAgeRange: ageRange,
        },
      });
      navigate('/settings');
    } catch (err) {
      setError("Failed to save your changes. Please try again.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const onMove = (e) => {
      if (activeThumb === null || !sliderRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const rect = sliderRef.current.getBoundingClientRect();
      let percent = (clientX - rect.left) / rect.width;
      percent = Math.max(0, Math.min(1, percent));
      let value = Math.round(minAge + percent * (maxAge - minAge));
      let newRange = [...ageRange];
      if (activeThumb === 0) {
        newRange[0] = Math.min(value, newRange[1] - 1);
      } else {
        newRange[1] = Math.max(value, newRange[0] + 1);
      }
      setAgeRange(newRange);
    };
    const onUp = () => setActiveThumb(null);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchend', onUp);
    };
  }, [activeThumb, ageRange, minAge, maxAge]);

  if (initialLoading) {
    return <div className="h-screen bg-white flex justify-center items-center">Loading...</div>;
  }
  
  const minThumbPos = ((ageRange[0] - minAge) / (maxAge - minAge)) * 100;
  const maxThumbPos = ((ageRange[1] - minAge) / (maxAge - minAge)) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center">
            <img src="/backarrow.svg" alt="Back" width={24} height={24} />
          </button>
          <div style={{ width: 32 }}></div> {/* Spacer */}
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <div className="text-left mb-16">
            <h1 className="text-2xl font-semibold text-gray-800">What age range do you prefer in a partner?</h1>
            <p className="text-sm text-gray-500 mt-2">The legal age of marriage is 18 years for girls and 21 years for boys.</p>
        </div>

        <div ref={sliderRef} className="relative w-full max-w-xs mx-auto">
          <div className="absolute w-full" style={{ top: '-36px' }}>
            <div className="absolute transform -translate-x-1/2" style={{ left: `${minThumbPos}%` }}>
              <div className="bg-black text-white text-sm rounded-full px-4 py-1 relative z-10">{ageRange[0]}<span className="absolute left-1/2 -bottom-2 w-2 h-2 bg-black rotate-45 transform -translate-x-1/2"></span></div>
            </div>
            <div className="absolute transform -translate-x-1/2" style={{ left: `${maxThumbPos}%` }}>
              <div className="bg-black text-white text-sm rounded-full px-4 py-1 relative z-10">{ageRange[1]}<span className="absolute left-1/2 -bottom-2 w-2 h-2 bg-black rotate-45 transform -translate-x-1/2"></span></div>
            </div>
          </div>
          <div className="relative h-3 flex items-center">
            <div className="absolute left-0 right-0 h-1.5 rounded-full bg-gray-200"></div>
            <div className="absolute h-1.5 rounded-full bg-black" style={{ left: `${minThumbPos}%`, width: `${maxThumbPos - minThumbPos}%` }}></div>
            <button type="button" className="absolute z-10 w-6 h-6 rounded-full bg-white border-4 border-black flex items-center justify-center" style={{ left: `calc(${minThumbPos}% - 12px)` }} onMouseDown={() => setActiveThumb(0)} onTouchStart={() => setActiveThumb(0)}><div className="w-3 h-3 bg-black rounded-full"></div></button>
            <button type="button" className="absolute z-10 w-6 h-6 rounded-full bg-white border-4 border-black flex items-center justify-center" style={{ left: `calc(${maxThumbPos}% - 12px)` }} onMouseDown={() => setActiveThumb(1)} onTouchStart={() => setActiveThumb(1)}><div className="w-3 h-3 bg-black rounded-full"></div></button>
          </div>
          <div className="flex justify-between w-full mt-4 text-gray-500 font-semibold text-lg"><span>{minAge}</span><span>{maxAge}</span></div>
        </div>
      </div>
      
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base bg-black disabled:bg-gray-300"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}