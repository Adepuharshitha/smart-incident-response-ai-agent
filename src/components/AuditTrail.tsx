import React, { useState, useEffect } from "react";
import {
  Layers,
  Calendar,
  Zap,
  DollarSign,
  AlertTriangle,
  Info,
  Sliders,
  TrendingDown,
  Terminal,
} from "lucide-react";
import { AuditLog } from "../types";

export default function AuditTrail() {
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/audit");
      const data = await response.json();
      setAudits(data.audits || []);
    } catch (err) {
      console.error("Failed to load audit trails:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-slate-100 font-bold text-base flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          cascadeflow Routing Audit Trail
        </h3>
        <p className="text-slate-400 text-xs mt-1">
          Detailed telemetry showing runtime model selections, size thresholds, latency, and quality escalations.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs">
          <span className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p>Gathering cascadeflow telemetry logs...</p>
        </div>
      ) : audits.length === 0 ? (
        <div className="bg-slate-800/10 border border-slate-700/20 rounded-2xl p-12 text-center text-slate-500 text-xs">
          No routing decisions audited yet. Analyze logs in the Analyzer.
        </div>
      ) : (
        <div className="space-y-4">
          {audits.map((audit) => (
            <div
              key={audit.id}
              className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-600/50 transition"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase font-semibold">Audit Key: {audit.id}</span>
                    <span>•</span>
                    <span className="text-slate-300 text-xs font-bold truncate max-w-xs">{audit.incidentTitle}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[10px] text-slate-500 font-mono mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(audit.timestamp).toLocaleDateString()} {new Date(audit.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {audit.escalated ? (
                    <span className="bg-red-950/40 text-red-400 border border-red-800/40 text-[9px] px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> ESCALATED
                    </span>
                  ) : (
                    <span className="bg-slate-900 text-slate-500 border border-slate-800 text-[9px] px-2 py-0.5 rounded font-mono font-bold">
                      NOMINAL ROUTING
                    </span>
                  )}
                </div>
              </div>

              {/* Grid telemetry parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-xs font-mono">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-sans">Input Format</span>
                  <p className="text-slate-300 mt-0.5 capitalize">{audit.inputType.replace("_", " ")}</p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-sans">Payload Footprint</span>
                  <p className="text-slate-300 mt-0.5">{(audit.inputSize / 1024).toFixed(3)} KB</p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-sans">Model Assigned</span>
                  <p className="text-indigo-400 font-bold mt-0.5">{audit.selectedModel}</p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-sans">Query Cost</span>
                  <p className="text-emerald-400 font-bold mt-0.5">${audit.cost.toFixed(5)}</p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-sans">Latency</span>
                  <p className="text-amber-500 font-bold mt-0.5">{audit.latency}ms</p>
                </div>
              </div>

              {/* Logic Detail */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-400">cascadeflow Logic: </span>
                    <span className="font-sans text-slate-300">{audit.routingReason}</span>
                  </div>
                </div>

                {audit.escalationReason && (
                  <div className="flex items-start gap-2.5 text-xs text-red-400 bg-red-950/10 border border-red-900/30 rounded-xl p-3">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Quality Escalation Decision: </span>
                      <span className="font-sans text-red-300/90">{audit.escalationReason}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress/Budget indicator info */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/50">
                <span>Monthly Budget Cap: ${audit.budgetCap.toFixed(2)}</span>
                <span>Cumulative cost after run: ${audit.cumulativeCostAfter.toFixed(5)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
