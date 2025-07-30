import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../utils/api";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authAPI.register(email, password);
      navigate("/user-info");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-white">
      <form className="w-full max-w-xs space-y-4" onSubmit={handleSignup}>
        <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 border rounded-xl"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 border rounded-xl"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full py-3 bg-black text-white rounded-xl font-medium"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        <div className="text-center text-sm mt-2">
          Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
        </div>
      </form>
    </div>
  );
} 