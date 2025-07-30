import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadAPI, userAPI } from '../../utils/api';

export default function EditLifestyleImages() {
  const [lifestyleImages, setLifestyleImages] = useState([null, null, null, null, null]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Load current lifestyle images on component mount
  React.useEffect(() => {
    const loadCurrentImages = async () => {
      try {
        const userData = await userAPI.getProfile();
        if (userData.intent && userData.intent.lifestyleImageUrls) {
          setLifestyleImages(userData.intent.lifestyleImageUrls);
        }
      } catch (error) {
        console.error('Error loading current images:', error);
      }
    };

    loadCurrentImages();
  }, []);

  const handleImageUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const result = await uploadAPI.uploadLifestyleImage(file);
      
      const newImages = [...lifestyleImages];
      newImages[index] = result.url;
      setLifestyleImages(newImages);
      
      // Update user profile in database
      await userAPI.updateProfile({
        intent: {
          lifestyleImageUrls: newImages
        }
      });
      
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (index) => {
    const newImages = [...lifestyleImages];
    newImages[index] = null;
    setLifestyleImages(newImages);
    
    // Update user profile in database
    await userAPI.updateProfile({
      intent: {
        lifestyleImageUrls: newImages
      }
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const getImageCount = () => {
    return lifestyleImages.filter(img => img !== null).length;
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
            Edit Lifestyle Pictures
          </div>
          <div style={{ width: 24 }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20 px-4">
        <div className="max-w-md mx-auto w-full pt-4">
          <h2 className="text-xl font-bold mb-2">Edit Lifestyle pictures</h2>
          <p className="text-gray-600 mb-8">
            Add at least 5 photos that don't show your face but give a glimpse into your lifestyle.
          </p>

          {/* Images Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {lifestyleImages.map((image, index) => (
              <div key={index} className="relative aspect-square">
                {image ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={image} 
                      alt={`Lifestyle ${index + 1}`} 
                      className="w-full h-full object-cover rounded-lg"
                    />
                    
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                    
                    {/* Replace overlay */}
                    <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                      <div className="text-white text-center">
                        <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-xs">Replace</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e)}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-xs text-gray-400">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(index, e)}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>

          {/* Image Count */}
          <div className="text-center mb-6">
            <span className="text-sm text-gray-600">
              {getImageCount()} of 5 photos added
            </span>
          </div>

          {/* Edit Button */}
          <div className="w-full py-4 bg-black text-white text-center rounded-lg font-medium cursor-pointer hover:bg-gray-800 transition-colors">
            {uploading ? 'Uploading...' : 'Edit'}
          </div>

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