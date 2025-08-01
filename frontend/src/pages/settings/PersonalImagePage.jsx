import { useNavigate } from 'react-router-dom';

const imagePacks = [
  { id: 'pi1', amount: 1, price: 1499 },
  { id: 'pi2', amount: 3, price: 3999 },
];

export default function PersonalImagePage() {
  const navigate = useNavigate();

  const handlePurchase = (pack) => {
    console.log(`Purchase initiated for ${pack.amount} Personal Image Request(s) at ₹${pack.price}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center">
            <img src="/backarrow.svg" alt="Back" width={24} height={24} />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-gray-800">Personal Image</h1>

        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center p-6 text-center">
        <p className="text-gray-600 mb-4 text-left">
          See personal photos of your matches if you want to skip the wait—only if that's your thing.
        </p>

        <div className="w-full max-w-sm space-y-4">
          {imagePacks.map((pack) => (
            <button
              key={pack.id}
              onClick={() => handlePurchase(pack)}
              className="w-full bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 text-sm py-4 px-6 rounded-xl transition-colors"
            >
              {pack.amount} Request{pack.amount > 1 ? 's' : ''} for Personal Image{pack.amount > 1 ? 's are' : ' is'} ₹ {pack.price}
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