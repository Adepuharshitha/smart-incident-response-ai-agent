import React from "react";
import {
  TrendingUp,
  BrainCircuit,
  Zap,
  DollarSign,
  Activity,
  History,
  ShieldCheck,
  AlertTriangle,
  Layers,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { DashboardData, IncidentHistoryItem } from "../types";

interface DashboardProps {
  data: DashboardData;
  onNavigate: (tab: string) => void;
  onSelectIncident: (incident: IncidentHistoryItem) => void;
}

export default function Dashboard({ data, onNavigate, onSelectIncident }: DashboardProps) {
  const { metrics, modelStats, recentIncidents, memoriesCount, auditsCount } = data;

  // Chart data 1: Savings & Budget Burn Simulation
  const savingsChartData = [
    { name: "Day 1", Cost: 0.00, Savings: 0.00, Budget: metrics.budgetLimit },
    { name: "Day 5", Cost: 0.05, Savings: 0.15, Budget: metrics.budgetLimit },
    { name: "Day 10", Cost: 0.18, Savings: 0.45, Budget: metrics.budgetLimit },
    { name: "Day 15", Cost: 0.32, Savings: 1.10, Budget: metrics.budgetLimit },
    { name: "Day 20", Cost: 0.58, Savings: 2.80, Budget: metrics.budgetLimit },
    { name: "Day 25", Cost: 0.84, Savings: 4.50, Budget: metrics.budgetLimit },
    { name: "Now", Cost: metrics.budgetConsumed, Savings: metrics.totalCostSaved, Budget: metrics.budgetLimit },
  ];

  // Chart data 2: Model Usage Breakdown
  const modelUsageData = [
    { name: "Flash Lite", value: modelStats["gemini-3.1-flash-lite"] || 1, color: "#14b8a6" },
    { name: "Gemini 3.5 Flash", value: modelStats["gemini-3.5-flash"] || 2, color: "#6366f1" },
    { name: "Gemini 3.1 Pro", value: modelStats["gemini-3.1-pro-preview"] || 1, color: "#a855f7" },
  ];

  // Chart data 3: Latency Comparison
  const latencyData = [
    { name: "Full AI (Flash)", Latency: 2200 },
    { name: "Full AI (Pro)", Latency: 4200 },
    { name: "Hindsight Memory", Latency: 420 },
    { name: "Mean System", Latency: metrics.averageLatency },
  ];

  const COLORS = ["#14b8a6", "#6366f1", "#a855f7"];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Incidents */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 shadow-md hover:border-slate-600/60 transition duration-200 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-sans">
                Total Analysed
              </p>
              <h3 className="text-3xl font-bold text-slate-100 mt-2 font-mono">
                {metrics.totalIncidentsAnalyzed}
              </h3>
            </div>
            <div className="w-12 h-12 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-teal-400 font-medium mt-4">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>SRE incident resolution tracking</span>
          </div>
        </div>

        {/* Memory Hits */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 shadow-md hover:border-slate-600/60 transition duration-200 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-sans">
                Hindsight Hits
              </p>
              <h3 className="text-3xl font-bold text-slate-100 mt-2 font-mono">
                {metrics.memoryHits}
              </h3>
            </div>
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center shadow-lg">
              <BrainCircuit className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium mt-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {metrics.totalIncidentsAnalyzed > 0
                ? `${Math.round((metrics.memoryHits / metrics.totalIncidentsAnalyzed) * 100)}% recall efficiency`
                : "Active memory cache"}
            </span>
          </div>
        </div>

        {/* AI Cost Saved */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 shadow-md hover:border-slate-600/60 transition duration-200 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-sans">
                Budget Saved
              </p>
              <h3 className="text-3xl font-bold text-emerald-400 mt-2 font-mono">
                ${metrics.totalCostSaved.toFixed(3)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium mt-4">
            <Layers className="w-3.5 h-3.5" />
            <span>By bypassing premium LLM routing</span>
          </div>
        </div>

        {/* Avg Latency */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 shadow-md hover:border-slate-600/60 transition duration-200 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-sans">
                Mean Latency
              </p>
              <h3 className="text-3xl font-bold text-slate-100 mt-2 font-mono">
                {metrics.averageLatency} <span className="text-sm font-sans font-normal text-slate-400">ms</span>
              </h3>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-medium mt-4">
            <Activity className="w-3.5 h-3.5" />
            <span>Includes local memory retrieval</span>
          </div>
        </div>
      </div>

      {/* Budget Consumption Progress */}
      <div className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h4 className="text-slate-100 text-sm font-semibold tracking-tight">cascadeflow Budget Cap Enforcement</h4>
            <p className="text-slate-400 text-xs mt-1">Real-time monthly limits set for API expenditures.</p>
          </div>
          <div className="text-right">
            <span className="text-slate-100 text-sm font-bold font-mono">
              ${metrics.budgetConsumed.toFixed(4)}
            </span>
            <span className="text-slate-500 text-xs font-mono"> / ${metrics.budgetLimit.toFixed(2)} USD</span>
          </div>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              metrics.budgetConsumed / metrics.budgetLimit > 0.8
                ? "bg-gradient-to-r from-red-500 to-orange-500"
                : "bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-500"
            }`}
            style={{ width: `${Math.min((metrics.budgetConsumed / metrics.budgetLimit) * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-3 text-[11px] text-slate-500 font-mono">
          <span>0.00% consumed</span>
          {metrics.budgetConsumed >= metrics.budgetLimit ? (
            <span className="text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Budget Cap Triggered: Downgraded to Flash Lite only
            </span>
          ) : (
            <span>{Math.round((metrics.budgetConsumed / metrics.budgetLimit) * 100)}% limit used</span>
          )}
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost & Savings Line Area Chart */}
        <div className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-6 shadow-sm lg:col-span-2">
          <h4 className="text-slate-200 text-sm font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Cumulative Cost Savings (Hindsight Memory)
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={savingsChartData}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155/30" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569", borderRadius: "8px" }}
                  labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                />
                <Area type="monotone" dataKey="Cost" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" name="AI Bill ($)" />
                <Area type="monotone" dataKey="Savings" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" name="Budget Saved ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Usage Stats Pie Chart */}
        <div className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-6 shadow-sm">
          <h4 className="text-slate-200 text-sm font-semibold mb-6 flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            cascadeflow Routing Ratio
          </h4>
          <div className="h-48 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modelUsageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {modelUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569", borderRadius: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {modelUsageData.map((m) => (
              <div key={m.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-slate-300">{m.name}</span>
                </div>
                <span className="text-slate-400 font-mono font-medium">{m.value} calls</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latency Comparison */}
        <div className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-6 shadow-sm lg:col-span-1">
          <h4 className="text-slate-200 text-sm font-semibold mb-6 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Execution Velocity (ms)
          </h4>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155/30" opacity={0.1} horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} tickLine={false} width={85} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569" }} />
                <Bar dataKey="Latency" fill="#eab308" radius={[0, 4, 4, 0]} name="Latency (ms)">
                  {latencyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name.includes("Memory") ? "#14b8a6" : entry.name.includes("Mean") ? "#6366f1" : "#eab308"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Incidents Activity List */}
        <div className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-slate-200 text-sm font-semibold flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              Recent Incidents Analyzed
            </h4>
            <button
              onClick={() => onNavigate("history")}
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 cursor-pointer transition"
            >
              See All <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3.5">
            {recentIncidents.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No incidents analyzed yet. Run a production log trace in the Incident Analyzer.
              </div>
            ) : (
              recentIncidents.map((incident) => (
                <div
                  key={incident.id}
                  onClick={() => onSelectIncident(incident)}
                  className="p-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition duration-150 flex items-center justify-between cursor-pointer group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-slate-200 font-semibold text-xs truncate max-w-sm">
                        {incident.title}
                      </span>
                      {incident.isMemoryHit ? (
                        <span className="bg-teal-950/40 text-teal-400 border border-teal-800/40 text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold">
                          HINDSIGHT HIT
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-400 text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold">
                          FULL AI RUN
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3.5 text-[10px] text-slate-500 font-mono">
                      <span>{new Date(incident.timestamp).toLocaleTimeString()}</span>
                      <span>•</span>
                      <span>{incident.modelUsed}</span>
                      <span>•</span>
                      <span className="text-amber-500/90 font-medium">{incident.latency}ms</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      ${incident.cost.toFixed(4)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
