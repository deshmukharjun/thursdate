import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../utils/api';

// --- Static Data for Subscription Plans ---
const basicPlans = [
  { id: 'b1', name: 'Luyona Monthly', price: 'INR 3,000', period: 'per month' },
  { id: 'b2', name: 'Luyona Annual', price: 'INR 25,000', period: 'annually' },
];

const proPlans = [
  { id: 'p1', name: 'Luyona Pro Monthly', price: 'INR 5,000', period: 'per month' },
  { id: 'p2', name: 'Luyona Pro Annual', price: 'INR 40,000', period: 'annually' },
];

// --- Reusable UI Components ---

// Component for each plan item, now aware of the current plan
const PlanItem = ({ name, price, period, isCurrentPlan }) => (
  <div className="flex justify-between items-center py-3">
    <div>
      <p className="font-semibold text-gray-800">{name}</p>
      <p className="text-sm text-gray-500">{price} {period}</p>
    </div>
    <button 
      disabled={isCurrentPlan}
      className={`text-sm font-semibold px-6 py-2 rounded-lg transition-colors ${
        isCurrentPlan 
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
          : 'bg-black text-white hover:bg-gray-800'
      }`}
    >
      {isCurrentPlan ? 'Current' : 'Buy'}
    </button>
  </div>
);

// Modal component for pausing/deleting
const PauseDeleteModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleYes = () => {
    console.log("User chose to pause or delete.");
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-md rounded-t-2xl p-6 text-center animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <img src="/membership-icon.svg" alt="Membership Icon" className="w-20 h-20" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Pause or Delete Membership</h2>
        <p className="text-sm text-gray-600 mb-6">Are you sure you want to pause or cancel your membership?</p>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-black text-white font-semibold">No</button>
          <button onClick={handleYes} className="flex-1 py-3 rounded-xl bg-white text-black font-semibold border border-gray-300">Yes</button>
        </div>
      </div>
    </div>
  );
};

export default function MembershipPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // For now, we'll define the current plan ID here.
  // In the future, this would come from the userInfo object.
  const currentPlanId = 'b1'; // This corresponds to 'Luyona Monthly'

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userData = await userAPI.getProfile();
        setUserInfo(userData);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  if (loading) {
    return <div className="h-screen bg-white flex justify-center items-center">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center">
            <img src="/backarrow.svg" alt="Back" width={24} height={24} />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-gray-800">Manage membership</h1>
          <div style={{ width: 32 }}></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center gap-4">
            <img src={userInfo?.profilePicUrl || 'https://via.placeholder.com/50'} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <p className="font-bold text-lg text-gray-900">{userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'User Name'}</p>
              <button onClick={() => navigate('/home', { state: { selectedTab: 'profile' } })} className="text-sm text-blue-600">My Profile &gt;</button>
            </div>
          </div>
          <div className="mt-4 text-sm">
            <p className="text-gray-800">Current membership: <span className="font-semibold">Luyona monthly</span></p>
            <p className="text-gray-500">Renews on: Aug 28, 2025</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="text-md font-bold text-gray-800 mb-2">Basic plans</h2>
          {basicPlans.map(plan => (
            <PlanItem 
              key={plan.id} 
              {...plan} 
              isCurrentPlan={plan.id === currentPlanId} 
            />
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="text-md font-bold text-gray-800 mb-2">Pro plans</h2>
          {proPlans.map(plan => (
            <PlanItem 
              key={plan.id} 
              {...plan} 
              isCurrentPlan={plan.id === currentPlanId} 
            />
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-4">
          <button onClick={() => setIsModalOpen(true)} className="flex justify-between items-center w-full p-4 text-left">
            <div>
              <h2 className="text-md font-bold text-gray-800">Pause or Delete Membership</h2>
              <p className="text-sm text-gray-500 mt-1">This is for when you want to take a break from the app. Your profile and connections will be saved, and no one will be able to view or message you while you're away.</p>
            </div>
            <img src="/right-icon.svg" alt="Arrow" className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <PauseDeleteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}