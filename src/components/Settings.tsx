import React, { useState, useEffect } from "react";
import {
  Sliders,
  DollarSign,
  User,
  RotateCcw,
  Sparkles,
  Layers,
  Database,
  Trash2,
  Check,
} from "lucide-react";

interface SettingsProps {
  currentUser: any;
  onUpdateUser: (user: any) => void;
  onResetDatabase: () => void;
}

export default function Settings({ currentUser, onUpdateUser, onResetDatabase }: SettingsProps) {
  const [budgetLimit, setBudgetLimit] = useState("10.00");
  const [routingStrategy, setRoutingStrategy] = useState<"budget" | "balanced" | "accuracy">("balanced");
  const [autoRemember, setAutoRemember] = useState(true);
  const [defaultTags, setDefaultTags] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  useEffect(() => {
    if (currentUser) {
      setRoutingStrategy(currentUser.preferences.routingStrategy || "balanced");
      setAutoRemember(currentUser.preferences.autoRemember !== false);
      setDefaultTags(currentUser.preferences.defaultTags?.join(", ") || "");
    }
  }, [currentUser]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess("");

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budgetLimit: Number(budgetLimit),
          userEmail: currentUser.email,
          preferences: {
            routingStrategy,
            autoRemember,
            defaultTags: defaultTags.split(",").map((t) => t.trim()).filter(Boolean),
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedUser = data.users.find((u: any) => u.email === currentUser.email);
        if (updatedUser) {
          onUpdateUser(updatedUser);
        }
        setSaveSuccess("Configuration settings saved successfully!");
        setTimeout(() => setSaveSuccess(""), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to restore all preloaded demo databases and reset cost metrics to zero?")) {
      return;
    }

    try {
      const response = await fetch("/api/reset", { method: "POST" });
      if (response.ok) {
        setResetSuccess("Database reset to pristine demo state!");
        onResetDatabase();
        setTimeout(() => setResetSuccess(""), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h3 className="text-slate-100 font-bold text-base flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          System Settings & Profile Options
        </h3>
        <p className="text-slate-400 text-xs mt-1">
          Adjust cascadeflow model prioritization parameters, system budgets, and engineer configurations.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-teal-950/20 border border-teal-800/40 rounded-xl text-teal-300 text-xs text-center font-semibold animate-fade-in">
          {saveSuccess}
        </div>
      )}

      {resetSuccess && (
        <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl text-amber-300 text-xs text-center font-semibold animate-fade-in">
          {resetSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Details left card */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 shadow-sm space-y-4 h-fit">
          <div className="flex flex-col items-center text-center p-3">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full border-2 border-teal-500 object-cover shadow-md shadow-teal-500/10 mb-3"
            />
            <h4 className="text-slate-100 font-bold text-sm truncate max-w-full">{currentUser?.name}</h4>
            <p className="text-slate-400 text-xs mt-1 truncate max-w-full font-mono">{currentUser?.email}</p>
            <span className="bg-slate-900 border border-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-lg mt-3 font-semibold tracking-wider uppercase">
              {currentUser?.role}
            </span>
          </div>
        </div>

        {/* Form settings right card */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-sm md:col-span-2 space-y-5">
          <h4 className="text-slate-200 text-sm font-bold flex items-center gap-1.5 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-teal-400" /> System Control Options
          </h4>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            {/* Monthly Budget Setting */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                1. Monthly API Budget Limit (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  placeholder="10.00"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-teal-500 rounded-xl py-3 pl-10 pr-4 text-slate-200 text-xs font-mono outline-none transition"
                />
              </div>
              <p className="text-slate-500 text-[10px] leading-relaxed">
                If the cumulative AI routing cost exceeds this limit, cascadeflow automatically downgrades all subsequent evaluations to the lowest cost model (Gemini 3.1 Flash Lite).
              </p>
            </div>

            {/* Default Routing Strategy */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                2. Default cascadeflow Routing Strategy
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["budget", "balanced", "accuracy"] as const).map((strat) => (
                  <button
                    key={strat}
                    type="button"
                    onClick={() => setRoutingStrategy(strat)}
                    className={`p-2.5 rounded-xl border text-xs capitalize font-semibold transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      routingStrategy === strat
                        ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-slate-100 border-teal-500"
                        : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{strat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Remember toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="pr-4">
                <span className="text-slate-200 text-xs font-semibold block">Auto-Remember Verified Solutions</span>
                <span className="text-[10px] text-slate-500 mt-0.5 leading-relaxed block">
                  Automatically register analyses marked Correct or Helpful in Hindsight Persistent Memory.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoRemember}
                onChange={(e) => setAutoRemember(e.target.checked)}
                className="w-4 h-4 accent-teal-500 cursor-pointer shrink-0"
              />
            </div>

            {/* Default Tags */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                3. Default Incident Tags
              </label>
              <input
                type="text"
                value={defaultTags}
                onChange={(e) => setDefaultTags(e.target.value)}
                placeholder="prod, aws, cluster"
                className="w-full bg-slate-900 border border-slate-700 focus:border-teal-500 rounded-xl p-3 text-slate-200 text-xs outline-none transition"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-500/10"
            >
              <Check className="w-4 h-4" /> Save Configuration Parameters
            </button>
          </form>
        </div>
      </div>

      {/* Database control section */}
      <div className="bg-red-950/10 border border-red-900/30 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-3.5">
          <Trash2 className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-red-400 font-bold text-sm">Danger Zone</h4>
            <p className="text-slate-400 text-xs mt-1">Destructive actions for database maintenance and demo reset capabilities.</p>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-slate-200 text-xs font-semibold block">Reset Database & Cache</span>
            <span className="text-[10px] text-slate-500 mt-0.5">
              Clear all history, audits, and custom memories, restoring preloaded scenarios to test from scratch.
            </span>
          </div>

          <button
            onClick={handleReset}
            className="bg-red-950 hover:bg-red-900 text-red-300 font-semibold px-4 py-2 border border-red-800/60 rounded-xl text-xs cursor-pointer transition flex items-center gap-1.5 shadow"
          >
            <RotateCcw className="w-4 h-4" /> Reset Demo
          </button>
        </div>
      </div>
    </div>
  );
}
