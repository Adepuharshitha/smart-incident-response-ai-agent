import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Terminal,
  Play,
  BrainCircuit,
  Sparkles,
  Layers,
  Clock,
  DollarSign,
  CheckCircle,
  ThumbsUp,
  Award,
  AlertTriangle,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { User, IncidentHistoryItem } from "../types";

interface IncidentAnalyzerProps {
  user: User;
  onAnalysisSuccess: (data: {
    incident: IncidentHistoryItem;
    audit: any;
    metrics: any;
    matchingMemory: any;
  }) => void;
  onRefreshMetrics: () => void;
}

// Lightweight clean custom markdown rendering helper for full control
const MarkdownRenderer = ({ content }: { content: string }) => {
  if (!content) return null;
  
  const lines = content.split("\n");
  return (
    <div className="space-y-3 font-sans text-sm text-slate-300 leading-relaxed selection:bg-teal-500/20">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        
        // Headers
        if (trimmed.startsWith("### ")) {
          return <h5 key={idx} className="text-sm font-bold text-slate-200 mt-4 mb-2">{trimmed.replace("### ", "")}</h5>;
        }
        if (trimmed.startsWith("## ")) {
          return <h4 key={idx} className="text-base font-bold text-teal-400 mt-5 mb-2">{trimmed.replace("## ", "")}</h4>;
        }
        if (trimmed.startsWith("# ")) {
          return <h3 key={idx} className="text-lg font-bold text-teal-400 mt-6 mb-3 border-b border-slate-800 pb-1">{trimmed.replace("# ", "")}</h3>;
        }

        // Bullet lists
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          const listText = trimmed.substring(2);
          return (
            <li key={idx} className="list-none pl-5 relative before:content-['•'] before:absolute before:left-1 before:text-teal-400">
              {parseInlineFormatting(listText)}
            </li>
          );
        }

        // Number lists
        if (/^\d+\.\s/.test(trimmed)) {
          const numText = trimmed.replace(/^\d+\.\s/, "");
          const match = trimmed.match(/^(\d+)\./);
          const num = match ? match[1] : "1";
          return (
            <li key={idx} className="list-none pl-6 relative">
              <span className="absolute left-0 text-teal-400 font-mono font-bold text-xs top-0.5">{num}.</span>
              {parseInlineFormatting(numText)}
            </li>
          );
        }

        // Code block
        if (trimmed.startsWith("```")) {
          return null; // Skip code fence
        }
        if (line.includes("`")) {
          return <p key={idx} className="text-slate-300">{parseInlineFormatting(line)}</p>;
        }

        return <p key={idx} className="text-slate-300">{line}</p>;
      })}
    </div>
  );
};

// Helper for inline markdown bold & code tags
const parseInlineFormatting = (text: string) => {
  const parts = [];
  let index = 0;
  
  // Simple regex to parse standard code tag `code` and bold tag **bold**
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const matches = text.match(regex);
  
  if (!matches) return text;
  
  let matchIdx = 0;
  while (index < text.length) {
    const nextMatch = matches[matchIdx];
    if (!nextMatch) {
      parts.push(text.substring(index));
      break;
    }
    
    const startPos = text.indexOf(nextMatch, index);
    if (startPos > index) {
      parts.push(text.substring(index, startPos));
    }
    
    if (nextMatch.startsWith("**")) {
      parts.push(
        <strong key={startPos} className="text-teal-300 font-bold">
          {nextMatch.slice(2, -2)}
        </strong>
      );
    } else {
      parts.push(
        <code key={startPos} className="bg-slate-950 px-1.5 py-0.5 rounded text-xs text-amber-300 font-mono border border-slate-800">
          {nextMatch.slice(1, -1)}
        </code>
      );
    }
    
    index = startPos + nextMatch.length;
    matchIdx++;
  }
  
  return parts;
};

export default function IncidentAnalyzer({ user, onAnalysisSuccess, onRefreshMetrics }: IncidentAnalyzerProps) {
  const [description, setDescription] = useState("");
  const [stackTrace, setStackTrace] = useState("");
  const [logContent, setLogContent] = useState("");
  const [logFileName, setLogFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [preferredStrategy, setPreferredStrategy] = useState<"budget" | "balanced" | "accuracy">("balanced");
  const [customBudgetCap, setCustomBudgetCap] = useState("10.00");

  // Output response states
  const [analysisResult, setAnalysisResult] = useState<IncidentHistoryItem | null>(null);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [matchingMemory, setMatchingMemory] = useState<any>(null);

  // Feedback States
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [selectedRating, setSelectedRating] = useState<"correct" | "helpful" | "needs_improvement" | null>(null);
  const [feedbackNote, setFeedbackNote] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preloaded logs templates for the Demo Scenario
  const logsPresets = [
    {
      name: "payment_batch_error.log",
      description: "Payment processing thread pool memory crash",
      stack: `java.lang.OutOfMemoryError: Java heap space
 at com.payments.ProcessEngine.allocateBuffer(ProcessEngine.java:1024)
 at com.payments.ProcessEngine.processBatch(ProcessEngine.java:245)
 at com.payments.QueueConsumer.run(QueueConsumer.java:78)`,
      content: `[2026-06-27 04:12:11] [ERROR] [payment-service] java.lang.OutOfMemoryError: Java heap space
  at com.payments.ProcessEngine.allocateBuffer(ProcessEngine.java:1024)
  at com.payments.ProcessEngine.processBatch(ProcessEngine.java:245)
  at com.payments.QueueConsumer.run(QueueConsumer.java:78)
  at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)`,
    },
    {
      name: "auth_postgres_exhaustion.json",
      description: "Database connection pools timeout crash",
      stack: `FATAL: database connection pool exhausted. Active connections: 100, Idle: 0.`,
      content: `{"timestamp":"2026-06-27T05:01:23.111Z","level":"FATAL","service":"auth-service","message":"database connection pool exhausted. Active connections: 100, Idle: 0. Timeout waiting for connection.","class":"org.postgresql.ds.PGSimpleDataSource"}`,
    },
    {
      name: "redis_socket_disconnect.txt",
      description: "Silent cache client socket disconnect ECONNRESET",
      stack: `read ECONNRESET at TCP.onStreamRead`,
      content: `[2026-06-27 05:40:02] [WARNING] [cache-service] Redis connection lost. Socket hang up.
Error: read ECONNRESET at TCP.onStreamRead (node:internal/stream_base_commons:217:20)`,
    },
  ];

  const handleApplyPreset = (preset: typeof logsPresets[0]) => {
    setDescription(preset.description);
    setStackTrace(preset.stack);
    setLogContent(preset.content);
    setLogFileName(preset.name);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setLogFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setLogContent(text);
      // Automatically detect if a stack trace seems to exist in logs
      if (text.includes("at ") || text.includes("Exception") || text.includes("Error")) {
        const lines = text.split("\n");
        const matchLines = lines.filter(l => l.includes("at ") || l.includes("Exception") || l.includes("Error")).slice(0, 5).join("\n");
        setStackTrace(matchLines);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleResetAnalyzer = () => {
    setDescription("");
    setStackTrace("");
    setLogContent("");
    setLogFileName("");
    setAnalysisResult(null);
    setAuditResult(null);
    setMatchingMemory(null);
    setFeedbackSubmitted(false);
    setSelectedRating(null);
    setFeedbackNote("");
  };

  const handleTriggerAnalysis = async () => {
    if (!description && !stackTrace && !logContent) {
      return;
    }

    setLoading(true);
    setAnalysisResult(null);
    setAuditResult(null);
    setMatchingMemory(null);
    setFeedbackSubmitted(false);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          stackTrace,
          logContent,
          userEmail: user.email,
          customBudgetCap: Number(customBudgetCap),
          preferredStrategy,
        }),
      });

      if (!response.ok) {
        throw new Error("Incident analysis failed. Check server logs.");
      }

      const data = await response.json();
      setAnalysisResult(data.incident);
      setAuditResult(data.audit);
      setMatchingMemory(data.matchingMemory);
      onAnalysisSuccess(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFeedback = async () => {
    if (!selectedRating || !analysisResult) return;

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentId: analysisResult.id,
          memoryId: matchingMemory?.id || undefined,
          rating: selectedRating,
          feedbackNote: feedbackNote,
        }),
      });

      // If helpful or correct, push to hindsight memory if it wasn't a memory hit already
      if (!analysisResult.isMemoryHit && (selectedRating === "correct" || selectedRating === "helpful")) {
        await fetch("/api/remember", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: analysisResult.title,
            description: analysisResult.description,
            errorSignature: stackTrace ? stackTrace.split("\n")[0] : description,
            rootCause: analysisResult.rootCause,
            resolution: analysisResult.resolution,
            tags: analysisResult.tags,
            confidence: analysisResult.confidence,
          }),
        });
      }

      setFeedbackSubmitted(true);
      onRefreshMetrics();
    } catch (err) {
      console.error("Error submitting feedback:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header Card */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-slate-100 font-bold text-sm">cascadeflow Configuration parameters</h3>
          <p className="text-slate-400 text-xs mt-1">Select strategy to fine-tune cost vs reasoning depth.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {/* Strategy selection */}
          <div className="flex bg-slate-900 border border-slate-700/80 p-1 rounded-xl">
            {(["budget", "balanced", "accuracy"] as const).map((strat) => (
              <button
                key={strat}
                onClick={() => setPreferredStrategy(strat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs capitalize font-semibold transition cursor-pointer ${
                  preferredStrategy === strat
                    ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-slate-100 shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {strat}
              </button>
            ))}
          </div>

          {/* Budget Limit setting */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 py-1.5 px-3.5 rounded-xl">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Cap Limit</span>
            <span className="text-slate-400 font-mono text-xs">$</span>
            <input
              type="text"
              value={customBudgetCap}
              onChange={(e) => setCustomBudgetCap(e.target.value)}
              className="w-12 bg-transparent text-slate-100 text-xs font-mono font-bold focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-slate-200 text-sm font-semibold flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-teal-400" />
                Incident Log Inputs
              </h4>
              {description || stackTrace || logContent ? (
                <button
                  onClick={handleResetAnalyzer}
                  className="text-[10px] text-slate-400 hover:text-slate-200 font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear Inputs
                </button>
              ) : null}
            </div>

            {/* Manual Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                1. Describe Incident Manually
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe symptoms, e.g. Payment service batch task is locking up database with ECONNRESET..."
                className="w-full h-18 bg-slate-900/80 border border-slate-700 focus:border-teal-500/80 rounded-xl p-3 text-slate-300 placeholder:text-slate-500 text-xs outline-none transition"
              />
            </div>

            {/* Stack Trace */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                2. Paste Stack Trace (Optional)
              </label>
              <textarea
                value={stackTrace}
                onChange={(e) => setStackTrace(e.target.value)}
                placeholder="Paste Java heap traces, Python exceptions, or JavaScript hangups..."
                className="w-full h-24 bg-slate-950/80 border border-slate-800 focus:border-teal-500/80 rounded-xl p-3 text-amber-500 placeholder:text-slate-600 text-xs font-mono outline-none transition"
              />
            </div>

            {/* File Upload Area */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                3. Drag & Drop Production Logs
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? "border-teal-500 bg-teal-500/5"
                    : logFileName
                    ? "border-emerald-500/50 bg-emerald-500/2"
                    : "border-slate-700 hover:border-slate-600 bg-slate-900/30"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".log,.txt,.json,.csv"
                  className="hidden"
                />
                {logFileName ? (
                  <>
                    <FileText className="w-8 h-8 text-emerald-400" />
                    <p className="text-slate-200 text-xs font-semibold font-mono truncate max-w-xs">{logFileName}</p>
                    <p className="text-slate-500 text-[10px] font-mono">{(logContent.length / 1024).toFixed(2)} KB loaded</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-slate-500" />
                    <p className="text-slate-300 text-xs font-medium">Click to upload or drag files here</p>
                    <p className="text-slate-500 text-[10px] font-mono">Accepts .txt, .log, .json logs</p>
                  </>
                )}
              </div>
            </div>

            {/* Submit Trigger */}
            <button
              onClick={handleTriggerAnalysis}
              disabled={loading || (!description && !stackTrace && !logContent)}
              className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 text-sm shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Trigger cascadeflow Intelligence
                </>
              )}
            </button>
          </div>

          {/* Quick Demo Preset templates card */}
          <div className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-5 shadow-sm space-y-3">
            <h5 className="text-slate-200 text-xs font-bold flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Demo Incident Scenarios
            </h5>
            <p className="text-slate-400 text-[11px]">Select a preset incident to run the complete audit routing & recollection demo scenario.</p>
            <div className="space-y-2 mt-1">
              {logsPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleApplyPreset(preset)}
                  className="w-full p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/50 text-left transition flex items-center justify-between group cursor-pointer text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-300 font-semibold truncate group-hover:text-teal-400 transition">{preset.name}</p>
                    <p className="text-slate-500 text-[10px] truncate">{preset.description}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded font-mono font-medium group-hover:bg-teal-950/40 group-hover:text-teal-400 transition ml-2">Load</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Output Panel */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center space-y-4 min-h-[450px]">
              <div className="w-16 h-16 rounded-full border-4 border-teal-500 border-t-transparent animate-spin flex items-center justify-center shadow-lg" />
              <div className="space-y-1.5">
                <h4 className="text-slate-200 font-bold text-sm">Evaluating cascadeflow Model Routing...</h4>
                <p className="text-slate-500 text-xs max-w-sm">Calculating context tokens & analyzing Hindsight similarity database keys...</p>
              </div>
            </div>
          ) : analysisResult ? (
            <div className="space-y-5 animate-fade-in">
              {/* Telemetry Header Badge */}
              <div className={`p-4 border rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 ${
                analysisResult.isMemoryHit
                  ? "bg-teal-950/20 border-teal-800/50 text-teal-300"
                  : "bg-indigo-950/20 border-indigo-800/50 text-indigo-300"
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow ${
                    analysisResult.isMemoryHit ? "bg-teal-500/10 text-teal-400" : "bg-indigo-500/10 text-indigo-400"
                  }`}>
                    {analysisResult.isMemoryHit ? <BrainCircuit className="w-5.5 h-5.5" /> : <Sparkles className="w-5.5 h-5.5" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-wider font-mono">
                      {analysisResult.isMemoryHit ? "HINDSIGHT MEMORY HIT" : "FULL AI INCIDENT RESOLUTION"}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {analysisResult.isMemoryHit
                        ? `Instantly recalled matching fix with ${analysisResult.confidence}% confidence score!`
                        : `Bypassed cache. cascadeflow initiated full reasoning parse.`}
                    </p>
                  </div>
                </div>
                {/* Routing decisions mini board */}
                <div className="flex items-center gap-4 text-xs font-mono border-t md:border-t-0 pt-2 md:pt-0 border-slate-800/80 w-full md:w-auto">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase font-sans">Model Selected</span>
                    <span className="text-slate-200 font-bold">{analysisResult.modelUsed}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase font-sans">Cost</span>
                    <span className="text-emerald-400 font-bold">${analysisResult.cost.toFixed(5)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase font-sans">Latency</span>
                    <span className="text-amber-400 font-bold">{analysisResult.latency}ms</span>
                  </div>
                </div>
              </div>

              {/* Cascadeflow decision audit detail */}
              {auditResult && (
                <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-4 flex items-start gap-3 text-xs">
                  <Layers className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-slate-200 font-bold font-mono text-[11px] uppercase tracking-wider">cascadeflow Decision Reason</p>
                    <p className="text-slate-400 mt-1 font-sans">{auditResult.routingReason}</p>
                    {auditResult.escalated && (
                      <p className="text-indigo-400 mt-1.5 font-sans font-semibold flex items-center gap-1 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" /> {auditResult.escalationReason}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Main Analysis result card */}
              <div className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Probable Root Cause</h4>
                  <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-900">
                    <MarkdownRenderer content={analysisResult.rootCause} />
                  </div>
                </div>

                <div>
                  <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Recommended Fix Instructions</h4>
                  <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-900">
                    <MarkdownRenderer content={analysisResult.resolution} />
                  </div>
                </div>

                {/* Score & Tags */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-slate-700/40">
                  <div className="w-full sm:w-1/2 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Resolution Confidence</span>
                      <span className="text-teal-400 font-mono font-bold">{analysisResult.confidence}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-teal-400 h-full rounded-full" style={{ width: `${analysisResult.confidence}%` }} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {analysisResult.tags.map(t => (
                      <span key={t} className="bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded-lg">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* FEEDBACK LOOP CONTAINER */}
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-5 h-5 text-teal-400" />
                  <h5 className="text-slate-100 text-xs font-bold uppercase tracking-wider">Continuous Learning Feedback</h5>
                </div>

                {feedbackSubmitted ? (
                  <div className="p-4 bg-teal-950/20 border border-teal-800/40 rounded-xl text-teal-300 text-xs text-center flex flex-col items-center justify-center gap-1.5">
                    <Award className="w-8 h-8 text-teal-400 animate-bounce" />
                    <p className="font-semibold">Hindsight memory repository updated!</p>
                    <p className="text-slate-400 text-[11px] max-w-xs mt-0.5">Continuous training indexes updated. This incident will be recollected instantly on subsequent occurrences.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-slate-400 text-xs">Verify the suggested solution. Rating will improve future Hindsight search results.</p>
                    
                    {/* Rating buttons */}
                    <div className="grid grid-cols-3 gap-3">
                      {(["correct", "helpful", "needs_improvement"] as const).map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setSelectedRating(rate)}
                          className={`p-2.5 rounded-xl border text-xs capitalize font-semibold transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                            selectedRating === rate
                              ? rate === "correct"
                                ? "bg-emerald-950/30 border-emerald-500 text-emerald-400"
                                : rate === "helpful"
                                ? "bg-indigo-950/30 border-indigo-500 text-indigo-400"
                                : "bg-red-950/30 border-red-500 text-red-400"
                              : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {rate === "correct" && <ThumbsUp className="w-4 h-4" />}
                          {rate === "helpful" && <Sparkles className="w-4 h-4" />}
                          {rate === "needs_improvement" && <AlertTriangle className="w-4 h-4" />}
                          <span>{rate.replace("_", " ")}</span>
                        </button>
                      ))}
                    </div>

                    {/* Feedback Note */}
                    {selectedRating && (
                      <div className="space-y-2 animate-fade-in">
                        <textarea
                          value={feedbackNote}
                          onChange={(e) => setFeedbackNote(e.target.value)}
                          placeholder="Optional: Add final verified code adjustments or SRE observations to store in persistent memory..."
                          className="w-full h-18 bg-slate-900 border border-slate-800 focus:border-teal-500/80 rounded-xl p-3 text-slate-300 placeholder:text-slate-600 text-xs outline-none transition"
                        />
                        <button
                          onClick={handleSendFeedback}
                          className="w-full bg-slate-900 hover:bg-slate-950 border border-slate-700 hover:border-teal-500/50 text-teal-400 hover:text-teal-300 font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4" /> Save Solution to Hindsight Memory Store
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/10 border border-slate-700/20 rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center space-y-4 min-h-[450px]">
              <BrainCircuit className="w-12 h-12 text-slate-600 animate-pulse" />
              <div className="space-y-1">
                <h4 className="text-slate-400 font-bold text-sm">Awaiting Production Logs</h4>
                <p className="text-slate-500 text-xs max-w-sm">Load a preset incident template or drag-and-drop logs files to trigger automated AI routing and response recollection.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
