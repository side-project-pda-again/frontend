import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 로그인 API 호출
    console.log("email:", email, "password:", password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          로그인
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 이메일 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            로그인
          </button>
        </form>

        {/* 부가 링크 */}
        <div className="flex justify-center mt-4 text-sm text-gray-600">
          <a href="/register" className="hover:underline">
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
}
