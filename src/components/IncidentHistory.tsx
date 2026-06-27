import React, { useState, useEffect } from "react";
import {
  History,
  Search,
  Calendar,
  Layers,
  DollarSign,
  Clock,
  CheckCircle,
  ThumbsUp,
  X,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { IncidentHistoryItem } from "../types";

interface IncidentHistoryProps {
  onSelectIncident: (incident: IncidentHistoryItem) => void;
  selectedIncident: IncidentHistoryItem | null;
  onClearSelection: () => void;
}

export default function IncidentHistory({ onSelectIncident, selectedIncident, onClearSelection }: IncidentHistoryProps) {
  const [historyList, setHistoryList] = useState<IncidentHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/history");
      const data = await response.json();
      setHistoryList(data.history || []);
    } catch (err) {
      console.error("Failed to fetch incident history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedIncident]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchHistory();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?type=history&query=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      setHistoryList(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      {/* List Column */}
      <div className={`${selectedIncident ? "lg:col-span-5" : "lg:col-span-12"} space-y-5 transition-all duration-300`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-slate-100 font-bold text-base flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              SRE Incident History
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Browse previously evaluated production incident logs and routing decisions.
            </p>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="bg-slate-800/40 border border-slate-700/30 p-4 rounded-2xl flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search history by error code, labels, or content..."
              className="w-full bg-slate-900 border border-slate-700 focus:border-teal-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 text-xs outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-950 border border-slate-700 text-teal-400 hover:text-teal-300 font-semibold px-5 rounded-xl text-xs cursor-pointer transition"
          >
            Search
          </button>
        </form>

        {loading ? (
          <div className="text-center py-20 text-slate-500 text-xs">
            <span className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p>Querying execution history...</p>
          </div>
        ) : historyList.length === 0 ? (
          <div className="bg-slate-800/10 border border-slate-700/20 rounded-2xl p-12 text-center text-slate-500 text-xs">
            No past incident evaluations found matching criteria.
          </div>
        ) : (
          <div className="space-y-3.5">
            {historyList.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectIncident(item)}
                className={`p-4 rounded-2xl border transition duration-250 cursor-pointer flex items-center justify-between group ${
                  selectedIncident?.id === item.id
                    ? "bg-teal-950/25 border-teal-500/80 shadow-md"
                    : "bg-slate-800/40 border-slate-700/50 hover:border-slate-600/60"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-slate-200 font-bold text-xs truncate max-w-xs">{item.title}</span>
                    {item.isMemoryHit ? (
                      <span className="bg-teal-950/40 text-teal-400 border border-teal-800/40 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                        HINDSIGHT MEM HIT
                      </span>
                    ) : (
                      <span className="bg-slate-900 text-slate-500 border border-slate-800 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                        FULL AI
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3.5 text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>{item.modelUsed}</span>
                    <span>•</span>
                    <span className="text-amber-500">{item.latency}ms</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-slate-300">${item.cost.toFixed(4)}</p>
                    <p className="text-[9px] text-slate-500 font-sans font-medium">{item.userEmail.split("@")[0]}</p>
                  </div>
                  <Eye className={`w-4 h-4 text-slate-500 group-hover:text-teal-400 transition ${
                    selectedIncident?.id === item.id ? "text-teal-400" : ""
                  }`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Column */}
      {selectedIncident && (
        <div className="lg:col-span-7 bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-6 animate-slide-right h-fit">
          <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-700/50">
            <div>
              <span className="text-[10px] text-teal-400 font-mono font-bold uppercase tracking-widest">Incident Record ID: {selectedIncident.id}</span>
              <h4 className="text-slate-100 font-bold text-base mt-1">{selectedIncident.title}</h4>
            </div>
            <button
              onClick={onClearSelection}
              className="p-1.5 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800/60 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-sans">Model Routed</span>
              <p className="text-slate-200 font-bold mt-0.5">{selectedIncident.modelUsed}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-sans">Query Cost</span>
              <p className="text-emerald-400 font-bold mt-0.5">${selectedIncident.cost.toFixed(5)}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-sans">Duration</span>
              <p className="text-amber-400 font-bold mt-0.5">{selectedIncident.latency}ms</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-sans">Memory Match</span>
              <p className="text-teal-400 font-bold mt-0.5">{selectedIncident.isMemoryHit ? "Hit" : "Miss"}</p>
            </div>
          </div>

          <div className="space-y-4">
            {selectedIncident.description && (
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">User Description</span>
                <p className="text-slate-300 text-xs bg-slate-900/40 p-3 rounded-xl border border-slate-900 leading-relaxed font-sans">{selectedIncident.description}</p>
              </div>
            )}

            {selectedIncident.stackTrace && (
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Stack Trace</span>
                <pre className="text-[11px] text-amber-500 font-mono bg-slate-950 p-3.5 rounded-xl border border-slate-900 overflow-x-auto max-h-48 leading-relaxed">
                  {selectedIncident.stackTrace}
                </pre>
              </div>
            )}

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Probable Root Cause</span>
              <div className="text-slate-200 text-xs bg-slate-900/40 p-4 rounded-xl border border-slate-900/60 whitespace-pre-wrap leading-relaxed font-sans">
                {selectedIncident.rootCause}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Resolution Recommendations</span>
              <div className="text-slate-200 text-xs bg-slate-900/40 p-4 rounded-xl border border-slate-900/60 whitespace-pre-wrap leading-relaxed font-mono">
                {selectedIncident.resolution}
              </div>
            </div>
          </div>

          {/* Feedback section summary */}
          {selectedIncident.feedback && (
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-start gap-3.5 text-xs">
              <CheckCircle className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-200 font-bold uppercase tracking-wider text-[10px] font-mono flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  SRE Verification Feedback: {selectedIncident.feedback.replace("_", " ")}
                </p>
                {selectedIncident.feedbackNote && (
                  <p className="text-slate-400 mt-1 italic font-sans">"{selectedIncident.feedbackNote}"</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
