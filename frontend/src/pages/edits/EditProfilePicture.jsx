import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadAPI, userAPI } from '../../utils/api';

export default function EditProfilePicture() {
  const [currentImage, setCurrentImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Load current profile picture on component mount
  React.useEffect(() => {
    const loadCurrentImage = async () => {
      try {
        const userData = await userAPI.getProfile();
        if (userData.profilePicUrl) {
          setCurrentImage(userData.profilePicUrl);
        }
      } catch (error) {
        console.error('Error loading current image:', error);
      }
    };

    loadCurrentImage();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const result = await uploadAPI.uploadProfilePicture(file);
      setCurrentImage(result.url);
      
      // Update user profile in database
      await userAPI.updateProfile({
        profilePicUrl: result.url
      });
      
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
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
            Edit Profile Picture
          </div>
          <div style={{ width: 24 }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20 px-4">
        <div className="max-w-md mx-auto w-full pt-4">
          <h2 className="text-xl font-bold mb-2">Edit a profile picture</h2>
          <p className="text-gray-600 mb-8">
            Add at least 1 photo that will show your physique but not your face.
          </p>

          {/* Current Image Display */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100">
                {currentImage ? (
                  <img 
                    src={currentImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Upload overlay */}
              <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <div className="text-white text-center">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm">Change Photo</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Upload Button */}
          <label className="block w-full">
            <div className="w-full py-4 bg-black text-white text-center rounded-lg font-medium cursor-pointer hover:bg-gray-800 transition-colors">
              {uploading ? 'Uploading...' : 'Edit'}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {error && (
            <div className="mt-4 text-red-500 text-center text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 