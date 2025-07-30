import { useNavigate } from "react-router-dom";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex flex-col justify-between items-center px-6 py-10 bg-white">
      {/* Centered logo and text */}
      <div className="flex flex-col items-center justify-center flex-1">
        <img src="/lock.png" alt="Lock" className="h-44 mb-2" />
        <p className="text-center text-black font-medium text-lg max-w-xs mb-4">
          Your Privacy, Our Priority
        </p>
        <p className="text-center text-[#767F89] text-xs max-w-xs">
          We keep your personal information
        </p>
        <p className="text-center text-[#767F89] text-xs max-w-xs">
          completely confidential.
        </p>
        <p className="text-center text-[#767F89] text-xs max-w-xs">
          No screenshots are allowed.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="w-full">
        <button
          onClick={() => navigate("/different")}
          className="w-full py-4 mb-3 rounded-xl bg-[#222222] text-white text-sm font-medium"
        >
          Next
        </button>
      </div>
    </div>
  );
}
