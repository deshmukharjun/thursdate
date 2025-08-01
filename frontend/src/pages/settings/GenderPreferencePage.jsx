import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../utils/api';

const RadioOption = ({ label, checked, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center justify-between px-5 py-4 mb-5 rounded-2xl border transition-all shadow-md bg-white text-left ${checked ? 'border-black shadow-lg' : 'border-gray-200'} hover:border-black`}
  >
    <div className="font-semibold text-base text-gray-900">{label}</div>
    <span className={`ml-4 w-6 h-6 flex items-center justify-center rounded-full border-2 ${checked ? 'border-black' : 'border-gray-300'}`} style={{ minWidth: '24px' }}>
      {checked && <span className="block w-3 h-3 bg-black rounded-full"></span>}
    </span>
  </button>
);

export default function GenderPreferencePage() {
  const navigate = useNavigate();
  const [interestedGender, setInterestedGender] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCurrentPreference = async () => {
      try {
        const userData = await userAPI.getProfile();
        if (userData.intent?.interestedGender) {
          setInterestedGender(userData.intent.interestedGender);
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
          interestedGender: interestedGender,
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

  if (initialLoading) {
    return <div className="h-screen bg-white flex justify-center items-center">Loading...</div>;
  }
  
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

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Who are you interested in meeting?</h1>
        <RadioOption label="Women" checked={interestedGender === 'Women'} onClick={() => setInterestedGender('Women')} />
        <RadioOption label="Men" checked={interestedGender === 'Men'} onClick={() => setInterestedGender('Men')} />
        <RadioOption label="Anyone" checked={interestedGender === 'Anyone'} onClick={() => setInterestedGender('Anyone')} />
      </div>
      
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSaving || !interestedGender}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base bg-black disabled:bg-gray-300"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}