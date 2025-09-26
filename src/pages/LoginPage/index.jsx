import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      login({ email, password });
      nav("/dashboard");
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="flex items-center justify-center flex-grow w-full bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          로그인
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="flex text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="flex text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700"
          >
            로그인
          </button>
        </form>
        <div className="flex justify-center mt-4 text-sm text-gray-600">
          <Link to="/register" className="text-indigo-600 hover:underline">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
