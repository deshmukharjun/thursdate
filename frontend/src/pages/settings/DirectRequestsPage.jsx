import { useNavigate } from 'react-router-dom';

const requestPacks = [
  { id: 'dr1', amount: 1, price: 299 },
  { id: 'dr2', amount: 5, price: 549 },
  { id: 'dr3', amount: 10, price: 999 },
];

export default function DirectRequestsPage() {
  const navigate = useNavigate();

  const handlePurchase = (pack) => {
    console.log(`Purchase initiated for ${pack.amount} Direct Request(s) at ₹${pack.price}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center">
            <img src="/backarrow.svg" alt="Back" width={24} height={24} />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-gray-800">Direct Messages</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center p-4 text-center">
        <p className="text-gray-600 mb-4 text-left">
          Direct Messages are a way to let us know that you're really interested in connecting with another member.
        </p>

        <div className="w-full max-w-sm space-y-4">
          {requestPacks.map((pack) => (
            <button
              key={pack.id}
              onClick={() => handlePurchase(pack)}
              className="w-full bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 text-sm py-4 px-6 rounded-xl transition-colors"
            >
              {pack.amount} Direct Request{pack.amount > 1 ? 's' : ''} for ₹ {pack.price}
            </button>
          ))}
        </div>

        <button 
          onClick={() => navigate(-1)}
          className="mt-8 text-gray-600 hover:text-gray-900 font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}