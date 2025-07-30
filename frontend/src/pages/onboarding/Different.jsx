import { useNavigate } from "react-router-dom";

export default function Privacy() {
  const navigate = useNavigate();

  const points = [
    { icon: "/diff1.svg", text: "Members only platform for the NDA Society" },
    { icon: "/diff2.svg", text: "Connect through vibes, not photos" },
    { icon: "/diff3.svg", text: "Your photo is hidden until you make a connection" },
    { icon: "/diff4.svg", text: "Connect with someone locally or globally" },
  ];

  return (
    <div className="h-screen w-screen flex flex-col justify-between items-center py-10 bg-white">
      {/* Top Image and Heading */}
      <div className="flex flex-col items-center justify-center flex-1 w-full">
        <img
          src="/different.png"
          alt="Different"
          className="w-full object-contain mb-24"
        />

        <p className="text-center text-black font-medium text-lg mb-6">
          What makes us different
        </p>

        {/* Bullet Points */}
        <div className="w-full max-w-xs space-y-2">
          {points.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <img src={item.icon} alt={`diff${index + 1}`} className="h-5 w-5 flex-shrink-0" />
              <p className="text-[#767F89] text-xs whitespace-nowrap">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="w-full px-6">
        <button
          onClick={() => navigate("/login")}
          className="w-full py-4 mb-3 rounded-xl bg-[#222222] text-white text-sm font-medium"
        >
          Next
        </button>
      </div>
    </div>
  );
}
