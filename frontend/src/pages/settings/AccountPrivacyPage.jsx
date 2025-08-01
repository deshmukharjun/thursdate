import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../utils/api';

// A reusable Toggle Switch component to match the Figma design
const ToggleSwitch = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    disabled={disabled}
    className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${checked ? 'bg-black' : 'bg-gray-300'}`}
  >
    <span
      className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
);

export default function AccountPrivacyPage() {
  const navigate = useNavigate();

  // State for the component
  const [isPrivate, setIsPrivate] = useState(false);
  const [originalIsPrivate, setOriginalIsPrivate] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch the user's data directly when the component mounts
  useEffect(() => {
    const loadPrivacySetting = async () => {
      try {
        const userData = await userAPI.getProfile();
        const initialValue = userData.isPrivate || false;
        setIsPrivate(initialValue);
        setOriginalIsPrivate(initialValue);
      } catch (err) {
        setError("Failed to load your privacy setting.");
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };

    loadPrivacySetting();
  }, []); // Empty dependency array means this runs once on mount

  // This function only updates the UI state
  const handleToggle = () => {
    setIsPrivate(currentValue => !currentValue);
  };

  // The save handler for the button
  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      await userAPI.updateProfile({
        isPrivate: isPrivate,
      });
      // After saving, navigate back to the settings page
      navigate('/settings');
    } catch (err) {
      setError("Couldn't save change. Please try again.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (initialLoading) {
    return <div className="h-screen bg-white flex justify-center items-center">Loading...</div>;
  }

  const hasChanged = isPrivate !== originalIsPrivate;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center">
            <img src="/backarrow.svg" alt="Back" width={24} height={24} />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-gray-800">Account privacy</h1>
          <div style={{ width: 32 }}></div> {/* Spacer */}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
          <div>
            <label className="font-semibold text-gray-800">
              Private account
            </label>
          </div>
          <ToggleSwitch 
            checked={isPrivate}
            onChange={handleToggle}
          />
        </div>
        <p className="text-sm text-gray-500 mt-3 px-2">
          When your account is private, only profiles you've matched with can view your profile.
        </p>
      </div>

      {/* Error display */}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      
      {/* Sticky Save Button Footer */}
      <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={!hasChanged || isSaving}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base bg-black disabled:bg-gray-300"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}