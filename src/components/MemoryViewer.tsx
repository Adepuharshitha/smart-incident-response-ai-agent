import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  Search,
  Plus,
  Tag,
  Calendar,
  ThumbsUp,
  Sparkles,
  AlertTriangle,
  User,
  Check,
  Code,
  X,
} from "lucide-react";
import { IncidentMemory } from "../types";

export default function MemoryViewer() {
  const [memories, setMemories] = useState<IncidentMemory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errorSignature, setErrorSignature] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [resolution, setResolution] = useState("");
  const [tags, setTags] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/memories");
      const data = await response.json();
      setMemories(data.memories || []);
    } catch (err) {
      console.error("Failed to load memories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchMemories();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?type=memory&query=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      setMemories(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !resolution) return;

    try {
      const response = await fetch("/api/memories/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          errorSignature,
          rootCause,
          resolution,
          tags,
        }),
      });

      if (response.ok) {
        setFormSuccess("Memory added successfully!");
        setTitle("");
        setDescription("");
        setErrorSignature("");
        setRootCause("");
        setResolution("");
        setTags("");
        fetchMemories();
        setTimeout(() => {
          setFormSuccess("");
          setShowAddForm(false);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-slate-100 font-bold text-base flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-teal-400" />
            Hindsight SRE Memory Cache
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Browse and query persistent resolution memories loaded across debugging sessions.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-teal-500/5"
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4" /> Close Form
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Add Manual Memory
            </>
          )}
        </button>
      </div>

      {/* Manual Memory Form */}
      {showAddForm && (
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-4 animate-slide-down relative">
          <h4 className="text-slate-200 text-sm font-bold flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-teal-400" /> Document Production Resolution Node
          </h4>

          {formSuccess && (
            <div className="p-3 bg-teal-950/20 border border-teal-800/40 rounded-xl text-teal-300 text-xs text-center font-semibold">
              {formSuccess}
            </div>
          )}

          <form onSubmit={handleAddMemory} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Memory Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Connection pool leak in user billing lookup"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-teal-500 rounded-xl p-3 text-slate-200 text-xs outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Error Signature (Key term)</label>
                <input
                  type="text"
                  value={errorSignature}
                  onChange={(e) => setErrorSignature(e.target.value)}
                  placeholder="e.g. java.lang.OutOfMemoryError or HikariCP pool limit exceeded"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-teal-500 rounded-xl p-3 text-slate-200 text-xs outline-none transition font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Short Symptoms Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred, what pods failed, and under what traffic load..."
                className="w-full h-16 bg-slate-900 border border-slate-700 focus:border-teal-500 rounded-xl p-3 text-slate-200 text-xs outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Detailed Root Cause</label>
                <textarea
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  placeholder="Describe thread deadlocks, missing db index, network drops..."
                  className="w-full h-24 bg-slate-900 border border-slate-700 focus:border-teal-500 rounded-xl p-3 text-slate-200 text-xs outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Verified Resolution Steps</label>
                <textarea
                  required
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Paste bash commands, system configs, or custom code mitigation blocks..."
                  className="w-full h-24 bg-slate-900 border border-slate-700 focus:border-teal-500 rounded-xl p-3 text-slate-200 text-xs outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Technology Tags (Comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="postgres, database, indexing, spring-boot"
                className="w-full bg-slate-900 border border-slate-700 focus:border-teal-500 rounded-xl p-3 text-slate-200 text-xs outline-none transition"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-500/10"
            >
              <Check className="w-4 h-4" /> Commit Node to Memory Repository
            </button>
          </form>
        </div>
      )}

      {/* Search form */}
      <form onSubmit={handleSearch} className="bg-slate-800/40 border border-slate-700/30 p-4 rounded-2xl flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search saved fixes by error signature, tags, description..."
            className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-teal-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 placeholder:text-slate-500 text-xs outline-none transition"
          />
        </div>
        <button
          type="submit"
          className="bg-slate-900 hover:bg-slate-950 text-teal-400 hover:text-teal-300 font-semibold px-5 rounded-xl border border-slate-700 text-xs cursor-pointer transition"
        >
          Search
        </button>
      </form>

      {/* Memory listing */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs">
          <span className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p>Querying Hindsight indices...</p>
        </div>
      ) : memories.length === 0 ? (
        <div className="bg-slate-800/10 border border-slate-700/20 rounded-2xl p-12 text-center text-slate-500 text-xs">
          No saved resolutions found matching the search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 shadow-sm hover:border-slate-600/60 transition duration-200 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <h4 className="text-slate-200 font-bold text-xs truncate">{mem.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Saved {new Date(mem.timestamp).toLocaleDateString()}</span>
                    </p>
                  </div>

                  <span className="bg-teal-950/30 text-teal-400 border border-teal-800/40 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                    {mem.confidence}% CONF
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{mem.description}</p>
                  
                  {mem.errorSignature && (
                    <div className="bg-slate-950/40 border border-slate-900 rounded-lg p-2 flex items-center gap-2">
                      <Code className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-amber-500 font-mono text-[10px] truncate">{mem.errorSignature}</span>
                    </div>
                  )}
                </div>

                {/* Sub contents */}
                <div className="pt-2 space-y-2 text-xs border-t border-slate-800/50">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Root Cause</span>
                    <p className="text-slate-300 line-clamp-2 font-sans">{mem.rootCause}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Verified Resolution</span>
                    <p className="text-slate-300 line-clamp-3 font-mono text-[11px] bg-slate-950/30 p-2 rounded border border-slate-900/60 whitespace-pre-wrap">{mem.resolution}</p>
                  </div>
                </div>
              </div>

              {/* Tags & Feedback indicator */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-800/50 gap-4 mt-4">
                <div className="flex flex-wrap gap-1">
                  {mem.tags.map((t) => (
                    <span
                      key={t}
                      className="bg-slate-900 text-slate-400 border border-slate-800 text-[9px] font-mono px-1.5 py-0.5 rounded"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {mem.engineerFeedback && (
                  <span
                    className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      mem.engineerFeedback === "correct"
                        ? "bg-emerald-950/40 text-emerald-400"
                        : "bg-indigo-950/40 text-indigo-400"
                    }`}
                  >
                    {mem.engineerFeedback === "correct" ? <ThumbsUp className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                    {mem.engineerFeedback}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
