import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  LayoutDashboard,
  Zap,
  BrainCircuit,
  History,
  Layers,
  Sliders,
  LogOut,
  Sparkles,
  AlertTriangle,
  Menu,
  X,
} from "lucide-react";
import { User, DashboardData, IncidentHistoryItem } from "./types";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import IncidentAnalyzer from "./components/IncidentAnalyzer";
import MemoryViewer from "./components/MemoryViewer";
import IncidentHistory from "./components/IncidentHistory";
import AuditTrail from "./components/AuditTrail";
import Settings from "./components/Settings";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<IncidentHistoryItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load active session from local storage if available
  useEffect(() => {
    const cachedUser = localStorage.getItem("sre_user");
    if (cachedUser) {
      try {
        setCurrentUser(JSON.parse(cachedUser));
      } catch (e) {
        localStorage.removeItem("sre_user");
      }
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("sre_user", JSON.stringify(user));
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("sre_user");
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser, activeTab]);

  const handleAnalysisSuccess = (data: {
    incident: IncidentHistoryItem;
    audit: any;
    metrics: any;
    matchingMemory: any;
  }) => {
    fetchDashboardData();
    // Auto focus on the newly analyzed incident in the history viewer if desired, 
    // or simply keep them on the screen. Let's keep them on the screen and refresh metrics!
  };

  const handleSelectIncidentFromDashboard = (incident: IncidentHistoryItem) => {
    setSelectedIncident(incident);
    setActiveTab("history");
  };

  const handleResetDatabase = () => {
    setSelectedIncident(null);
    fetchDashboardData();
    setActiveTab("dashboard");
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("sre_user", JSON.stringify(updatedUser));
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Navigation Items
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "analyzer", label: "Incident Analyzer", icon: Zap },
    { id: "memory", label: "Memory Viewer", icon: BrainCircuit },
    { id: "history", label: "Incident History", icon: History },
    { id: "audit", label: "Audit Trail", icon: Layers },
    { id: "settings", label: "Settings", icon: Sliders },
  ];

  const ActiveIcon = navItems.find((t) => t.id === activeTab)?.icon || LayoutDashboard;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans select-none selection:bg-teal-500/30 selection:text-teal-300">
      {/* Background ambient radial glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.02),transparent_45%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.02),transparent_45%)] pointer-events-none" />

      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-950/80 backdrop-blur-md border-r border-slate-800/80 shrink-0 z-20">
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center shadow shadow-teal-500/10">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-slate-100 tracking-wider uppercase font-mono">Incident Agent</h1>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Control Panel v2.1</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id !== "history") setSelectedIncident(null);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition duration-150 group cursor-pointer ${
                  activeTab === item.id
                    ? "bg-slate-800/90 text-teal-400 border border-slate-700/50 shadow"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 transition duration-150 ${
                  activeTab === item.id ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"
                }`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Active SRE User Profile panel */}
        <div className="p-4 border-t border-slate-800/80 space-y-4">
          <div className="flex items-center gap-3.5 p-2 bg-slate-900/50 border border-slate-800 rounded-xl">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-slate-800"
            />
            <div className="min-w-0 flex-1">
              <p className="text-slate-200 text-xs font-bold truncate">{currentUser.name}</p>
              <p className="text-slate-500 text-[10px] truncate font-mono">{currentUser.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:border-red-900/40 text-slate-400 hover:text-red-400 text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Top Header bar */}
        <header className="lg:hidden h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-slate-900 border border-slate-800 rounded-lg text-slate-400 cursor-pointer"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-teal-400" />
              <span className="text-slate-200 font-bold text-xs font-mono uppercase tracking-wide">Incident agent</span>
            </div>
          </div>
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full border border-slate-800 object-cover"
          />
        </header>

        {/* Mobile slide-out sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in" onClick={() => setSidebarOpen(false)}>
            <div
              className="w-64 bg-slate-950 h-full border-r border-slate-800 flex flex-col p-6 space-y-6 animate-slide-right"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-teal-400" />
                  <span className="text-slate-200 font-bold text-xs font-mono tracking-wider uppercase">Menu</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-slate-900 border border-slate-800 rounded-lg text-slate-400 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                        if (item.id !== "history") setSelectedIncident(null);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide cursor-pointer transition ${
                        activeTab === item.id
                          ? "bg-slate-800 text-teal-400 border border-slate-700/50"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center gap-3 p-2 bg-slate-900 border border-slate-800 rounded-xl">
                  <img src={currentUser.avatar} alt={currentUser.name} referrerPolicy="no-referrer" className="w-9 h-9 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="text-slate-200 text-xs font-bold truncate">{currentUser.name}</p>
                    <p className="text-slate-500 text-[9px] font-mono">{currentUser.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-800 hover:border-red-950/40 text-slate-400 hover:text-red-400 text-xs font-semibold cursor-pointer transition"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Workspace Stage */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 focus:outline-none">
          {/* Work Area Header Title */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center shadow">
                <ActiveIcon className="w-5.5 h-5.5 text-teal-400" />
              </div>
              <div>
                <h2 className="text-slate-100 font-bold text-lg font-sans tracking-tight">
                  {navItems.find((t) => t.id === activeTab)?.label}
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  {activeTab === "dashboard" && "Central DevOps diagnostics & memory hits."}
                  {activeTab === "analyzer" && "Upload raw console logging dump files to resolve error vectors."}
                  {activeTab === "memory" && "Browse, search, and edit persistent SRE knowledge entries."}
                  {activeTab === "history" && "Browse, examine, and trace previous incidents."}
                  {activeTab === "audit" && "cascadeflow budget metrics & logic logging tracks."}
                  {activeTab === "settings" && "Fine-tune system thresholds and customize thresholds."}
                </p>
              </div>
            </div>

            {/* SRE notification bubble if budget consumed is near threshold */}
            {dashboardData && dashboardData.metrics.budgetConsumed >= dashboardData.metrics.budgetLimit && (
              <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-3 flex items-center gap-2 text-xs text-red-300 font-semibold animate-pulse">
                <AlertTriangle className="w-4.5 h-4.5" />
                <span>Budget Cap Exhausted: System routed to Flash Lite</span>
              </div>
            )}
          </div>

          {/* Tab Renderers */}
          {activeTab === "dashboard" && dashboardData && (
            <Dashboard
              data={dashboardData}
              onNavigate={setActiveTab}
              onSelectIncident={handleSelectIncidentFromDashboard}
            />
          )}

          {activeTab === "analyzer" && (
            <IncidentAnalyzer
              user={currentUser}
              onAnalysisSuccess={handleAnalysisSuccess}
              onRefreshMetrics={fetchDashboardData}
            />
          )}

          {activeTab === "memory" && <MemoryViewer />}

          {activeTab === "history" && (
            <IncidentHistory
              onSelectIncident={setSelectedIncident}
              selectedIncident={selectedIncident}
              onClearSelection={() => setSelectedIncident(null)}
            />
          )}

          {activeTab === "audit" && <AuditTrail />}

          {activeTab === "settings" && (
            <Settings
              currentUser={currentUser}
              onUpdateUser={handleUpdateUser}
              onResetDatabase={handleResetDatabase}
            />
          )}
        </main>
      </div>
    </div>
  );
}
