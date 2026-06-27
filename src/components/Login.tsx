import React, { useState } from "react";
import { ShieldAlert, LogIn, Mail, Sparkles, Database } from "lucide-react";
import { User } from "../types";

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent, customEmail?: string) => {
    e.preventDefault();
    const loginEmail = customEmail || email;
    if (!loginEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail }),
      });

      if (!response.ok) {
        throw new Error("Login failed. Server rejected request.");
      }

      const data = await response.json();
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const presetUsers = [
    {
      email: "harshithaadepu06@gmail.com",
      name: "Harshitha Adepu",
      role: "Lead DevOps Engineer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    },
    {
      email: "engineer@cascade.io",
      name: "Alex Rivera",
      role: "Site Reliability Engineer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-teal-500 selection:text-slate-900">
      {/* Background ambient glows */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/60 p-8 shadow-2xl relative overflow-hidden">
        {/* Border accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-500" />

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-teal-500/20 mb-4 animate-pulse">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight font-sans">
            Smart Incident Response
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-[280px]">
            Powered by <span className="text-teal-400 font-semibold font-mono text-xs">Hindsight</span> & <span className="text-indigo-400 font-semibold font-mono text-xs">cascadeflow</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              SRE Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email..."
                className="w-full bg-slate-900/80 border border-slate-700 hover:border-slate-600 focus:border-teal-500 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-500 text-sm outline-none transition duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-900 font-semibold py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2 text-sm shadow-lg shadow-teal-500/15 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Access Command Center
              </>
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700/60" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-800/80 px-3 text-slate-500 font-semibold tracking-wider">
              Quick Switch Role
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {presetUsers.map((p) => (
            <button
              key={p.email}
              onClick={(e) => handleLogin(e, p.email)}
              disabled={loading}
              className="w-full flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-left transition duration-200 group cursor-pointer disabled:opacity-50"
            >
              <img
                src={p.avatar}
                alt={p.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-slate-700 group-hover:border-teal-500 transition duration-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-sm font-semibold truncate group-hover:text-teal-400 transition duration-200">
                  {p.name}
                </p>
                <p className="text-slate-400 text-xs truncate font-mono">{p.role}</p>
              </div>
              <div className="text-slate-600 group-hover:text-teal-500 transition duration-200">
                <Sparkles className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-slate-700/40 text-center flex items-center justify-center gap-2 text-slate-500 text-xs font-mono">
          <Database className="w-3.5 h-3.5 text-teal-500" />
          <span>Local Hindsight DB Active</span>
        </div>
      </div>
    </div>
  );
}
