import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../src/lib/firebase";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const signup = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-card p-6 rounded-xl w-80 space-y-4">
        <h2 className="text-[2rem] font-bold text-center">Create Account</h2>

        <form onSubmit={(e) => { e.preventDefault(); signup(); }} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Sign Up
          </button>
        </form>

        <a href="/login" className="block text-center text-blue-600 hover:underline">
          I have an account already
        </a>
      </div>
    </div>
  );
}
