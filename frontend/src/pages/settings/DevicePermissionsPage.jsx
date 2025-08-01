import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Static Data for Permissions ---
// The status is static for this example. The modalText guides the user.
const permissionsData = [
  {
    key: 'camera',
    title: 'Camera',
    status: 'Not allowed',
    modalTitle: 'Camera Access',
    modalText: "To take and upload photos directly in the app, please allow access to your camera in your phone's settings."
  },
  {
    key: 'contacts',
    title: 'Contacts',
    status: 'Allowed',
    modalTitle: 'Contacts Access',
    modalText: 'We use contacts to help you find and connect with people you may know. You can manage this in your phone\'s settings.'
  },
  {
    key: 'location',
    title: 'Location services',
    status: 'Allowed',
    modalTitle: 'Location Access',
    modalText: 'We use your location to show you potential matches nearby. Please manage this in your phone\'s privacy settings.'
  },
  {
    key: 'mic',
    title: 'Microphones',
    status: 'Not allowed',
    modalTitle: 'Microphone Access',
    modalText: 'To send voice messages or use video chat features, please allow access to your microphone in your phone\'s settings.'
  },
  {
    key: 'photos',
    title: 'Photos',
    status: 'Allowed - Full Access',
    modalTitle: 'Photos Access',
    modalText: 'You have granted access to your photos, allowing you to upload them to your profile. Manage this in your phone\'s settings.'
  },
  {
    key: 'notifications',
    title: 'Notifications',
    status: 'Allowed',
    modalTitle: 'Notifications',
    modalText: 'You will receive notifications for new matches and messages. You can turn this off in your phone\'s notification settings.'
  },
];

// --- Reusable UI Components ---

// Modal component to display guidance
const PermissionModal = ({ content, onClose }) => {
  if (!content) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-sm rounded-xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{content.modalTitle}</h2>
        <p className="text-sm text-gray-600 mb-6">{content.modalText}</p>
        <button onClick={onClose} className="w-full py-3 rounded-lg bg-black text-white font-semibold">OK</button>
      </div>
    </div>
  );
};

export default function DevicePermissionsPage() {
  const navigate = useNavigate();
  // State to manage which modal to show. `null` means no modal.
  const [modalContent, setModalContent] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center">
            <img src="/backarrow.svg" alt="Back" width={24} height={24} />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-gray-800">Device permissions</h1>
          <div style={{ width: 32 }}></div> {/* Spacer */}
        </div>
      </div>

      {/* Permissions List */}
      <div className="flex-1 p-4">
        <div className="bg-white rounded-lg shadow-sm">
          {permissionsData.map((permission, index) => (
            <button
              key={permission.key}
              onClick={() => setModalContent(permission)}
              className={`flex items-center justify-between w-full p-4 text-left ${index < permissionsData.length - 1 ? 'border-b border-gray-200' : ''}`}
            >
              <div>
                <p className="font-semibold text-gray-800">{permission.title}</p>
                <p className="text-sm text-gray-500">{permission.status}</p>
              </div>
              <img src="/right-icon.svg" alt="Arrow" className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>
      
      {/* Render the Modal */}
      <PermissionModal content={modalContent} onClose={() => setModalContent(null)} />
    </div>
  );
}