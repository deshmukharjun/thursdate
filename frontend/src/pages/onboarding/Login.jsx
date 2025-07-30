import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI, userAPI } from "../../utils/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authAPI.login(email, password);
      // Check if user profile exists
      try {
        const userData = await userAPI.getProfile();
        if (userData.approval) {
          navigate("/home");
        } else {
          navigate("/waitlist-status");
        }
      } catch (profileError) {
        // If profile doesn't exist, go to user-info
        navigate("/user-info");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-white">
      <form className="w-full max-w-xs space-y-4" onSubmit={handleLogin}>
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
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
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="text-center text-sm mt-2">
          Don't have an account? <Link to="/signup" className="text-blue-600">Sign Up</Link>
        </div>
      </form>
    </div>
  );
} 