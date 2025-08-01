import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

// --- Dummy Data ---
// This is a placeholder. You will replace this with data fetched from your API.
const dummyBlockedAccounts = [
  { id: 1, name: 'Jessica Miller', profilePicUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&q=80' },
  { id: 2, name: 'David Chen', profilePicUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&q=80' },
  { id: 3, name: 'Sophia Rodriguez', profilePicUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&q=80' },
  { id: 4, name: 'Michael Lee', profilePicUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&q=80' },
  { id: 5, name: 'Emily White', profilePicUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&q=80' },
];

export default function BlockedAccountsPage() {
  const navigate = useNavigate();
  // State to manage the list of blocked accounts
  const [blockedAccounts, setBlockedAccounts] = useState(dummyBlockedAccounts);

  // Future function to handle unblocking a user
  const handleUnblock = (accountId) => {
    // For now, it just filters the user from the local list.
    // Later, you will add an API call here.
    console.log(`Unblocking user with ID: ${accountId}`);
    setBlockedAccounts(currentAccounts => 
      currentAccounts.filter(account => account.id !== accountId)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center">
            <img src="/backarrow.svg" alt="Back" width={24} height={24} />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-gray-800">Blocked accounts</h1>
          <div style={{ width: 32 }}></div> {/* Spacer */}
        </div>
      </div>

      {/* Blocked Accounts List */}
      <div className="flex-1 p-4">
        {blockedAccounts.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm">
            {blockedAccounts.map((account, index) => (
              <div 
                key={account.id} 
                className={`flex items-center justify-between p-4 ${index < blockedAccounts.length - 1 ? 'border-b border-gray-200' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <img 
                    src={account.profilePicUrl} 
                    alt={account.name} 
                    className="w-12 h-12 rounded-full object-cover" 
                  />
                  <p className="font-semibold text-gray-800">{account.name}</p>
                </div>
                <button 
                  onClick={() => handleUnblock(account.id)}
                  className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">You haven't blocked any accounts.</p>
          </div>
        )}
      </div>
    </div>
  );
}