import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertOctagon,
  Flame,
  Send,
  ShieldAlert,
  Terminal,
  Trash2,
  Zap,
} from "lucide-react";
import type { ChatMessage as ChatMessageType } from "../../types/vehicle";
import { sendChatMessage } from "../../api/vehicleApi";
import ChatMessage from "./ChatMessage";
import ErrorState from "../common/ErrorState";
import logoImg from "../../assets/logo.png";
import { useVehicle } from "../../context/VehicleContext";

const STARTER_PROMPTS = [
  {
    title: "ADAS Disengagements",
    desc: "Scan the 30-day timeline for autonomous disengagements and road factors.",
    prompt:
      "Analyze recent ADAS disengagements across the 30-day timeline and summarize common triggers.",
    icon: ShieldAlert,
    badge: "Safety",
  },
  {
    title: "Energy & Regeneration",
    desc: "Evaluate City vs Highway efficiency variance (kWh/100 km) and battery recovery.",
    prompt:
      "Compare City versus Highway energy consumption metrics in kWh/100 km and regeneration performance.",
    icon: Zap,
    badge: "Efficiency",
  },
  {
    title: "Battery Overheating",
    desc: "Inspect telemetry around thermal spikes, cooling pump status, and pre/post readings.",
    prompt:
      "Investigate the battery overheating incident and describe telemetry changes before and after the warning.",
    icon: Flame,
    badge: "Diagnostics",
  },
  {
    title: "Diagnostic Trouble Codes",
    desc: "Identify recorded ECU trouble codes, freeze frames, and severity levels.",
    prompt:
      "List all recorded Diagnostic Trouble Codes (DTCs) in the database and their severity levels.",
    icon: AlertOctagon,
    badge: "ECU Faults",
  },
];

export default function ChatPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedVehicleId, setSelectedVehicleId } = useVehicle();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const processedQueryRef = useRef<number | string | null>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSendQuery = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || sending) return;

    const userMsg: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    setError(null);

    try {
      // ChatGPT-style reasoning delay + backend API execution
      const [response] = await Promise.all([
        sendChatMessage(text),
        new Promise<void>((resolve) => setTimeout(resolve, 1200)),
      ]);
      const assistantMsg: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.reply,
        timestamp: new Date().toISOString(),
        intent: response.intent,
        data: response.data,
        sources: response.sources,
        warnings: response.warnings,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to get response from VehicleGPT.";
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  // Process incoming navigation state question exactly once
  useEffect(() => {
    const navState = location.state as {
      initialQuestion?: string;
      vehicleId?: string;
      timestamp?: number;
    } | null;

    if (navState?.vehicleId && navState.vehicleId !== selectedVehicleId) {
      setSelectedVehicleId(navState.vehicleId);
    }

    if (navState?.initialQuestion) {
      const queryKey = navState.timestamp || navState.initialQuestion;
      if (processedQueryRef.current !== queryKey) {
        processedQueryRef.current = queryKey;
        // Clean up navigation state in history so back/forward doesn't re-trigger
        navigate(location.pathname, { replace: true, state: {} });
        // Execute the transferred question
        void handleSendQuery(navState.initialQuestion);
      }
    }
  }, [location.state, location.pathname, navigate, selectedVehicleId, setSelectedVehicleId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendQuery(input);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#080a0f] text-zinc-100 overflow-hidden relative">
      {/* Background ambient mesh glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-orange-500/10 via-orange-600/5 to-transparent blur-3xl opacity-70" />

      {/* Top Status & Telemetry Toolbar */}
      <header className="z-10 flex shrink-0 items-center justify-between border-b border-zinc-800/80 bg-[#0e1015]/90 px-4 md:px-8 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-orange-500/40 bg-orange-500/15 p-1 text-orange-400">
            <img
              src={logoImg}
              alt="VehicleGPT"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                VehicleGPT Intelligence Core
              </span>
              <span className="rounded border border-orange-500/40 bg-orange-500/10 px-1.5 py-0.2 text-[9px] font-mono font-bold text-orange-400">
                v2.4
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Connected to SQLite Fleet Telemetry Engine</span>
              </span>
              <span className="rounded border border-zinc-800 bg-zinc-900/90 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-orange-400">
                Context: {selectedVehicleId} (Simulated)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear conversation"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs font-semibold text-zinc-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 active:scale-95"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset Session</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Messages & Command Center Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 relative z-10">
        <div className="max-w-5xl w-full mx-auto space-y-6">
          {/* Welcome Hero State when no messages */}
          {messages.length === 0 && !sending && (
            <div className="py-6 md:py-10 flex flex-col items-center text-center animate-fadeIn">
              {/* Center Hero Graphic with Brand Logo */}
              <div className="mb-6 flex items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-2.5 shadow-xl backdrop-blur-sm">
                  <img
                    src={logoImg}
                    alt="VehicleGPT Logo"
                    className="h-14 w-14 object-contain"
                  />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-orange-400 mb-3">
                <Terminal className="h-3.5 w-3.5" />
                Automotive Natural Language Intelligence
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-white mb-2">
                VehicleGPT <span className="text-orange-500">Telemetry Assistant</span>
              </h2>
              <p className="max-w-xl text-xs md:text-sm text-zinc-400 leading-relaxed mb-8">
                Query 30 days of real-world synthetic vehicle telemetry. Ask about ADAS disengagement conditions, battery thermal spikes, and city vs highway energy efficiency.
              </p>

              {/* 4 Interactive Starter Diagnostic Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
                {STARTER_PROMPTS.map((starter) => {
                  const Icon = starter.icon;
                  return (
                    <button
                      key={starter.title}
                      type="button"
                      onClick={() => void handleSendQuery(starter.prompt)}
                      className="group relative flex flex-col justify-between rounded-xl border border-zinc-800/90 bg-[#10131a]/80 p-4 transition-all duration-200 hover:border-orange-500/50 hover:bg-[#141822] hover:shadow-lg hover:shadow-orange-950/30 active:scale-[0.99]"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700/80 bg-zinc-800/80 text-orange-400 group-hover:border-orange-500/40 group-hover:bg-orange-500/15 transition">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-orange-300">
                            {starter.badge}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-zinc-100 group-hover:text-orange-400 transition">
                          {starter.title}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 leading-snug">
                          {starter.desc}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-orange-400/80 group-hover:text-orange-400">
                        <span>Execute query</span>
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Messages List */}
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}

          {/* ChatGPT-style Thinking & Pulsating Dots Indicator */}
          {sending && (
            <div className="flex items-start gap-3.5 animate-fadeIn">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-orange-500/30 bg-[#161a23] p-1.5 shadow-md shadow-orange-500/10">
                <img
                  src={logoImg}
                  alt="VehicleGPT"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex items-center gap-3 rounded-2xl rounded-tl-sm border border-zinc-800/90 bg-[#12151d]/90 px-5 py-3.5 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-1.5 py-0.5">
                  <span
                    className="h-2 w-2 rounded-full bg-orange-500 animate-pulse-dot shadow-[0_0_8px_rgba(245,124,32,0.8)]"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="h-2 w-2 rounded-full bg-orange-400 animate-pulse-dot shadow-[0_0_8px_rgba(245,124,32,0.8)]"
                    style={{ animationDelay: "180ms" }}
                  />
                  <span
                    className="h-2 w-2 rounded-full bg-amber-400 animate-pulse-dot shadow-[0_0_8px_rgba(232,149,26,0.8)]"
                    style={{ animationDelay: "360ms" }}
                  />
                  <span
                    className="h-2 w-2 rounded-full bg-orange-300 animate-pulse-dot shadow-[0_0_8px_rgba(245,124,32,0.8)]"
                    style={{ animationDelay: "540ms" }}
                  />
                </div>
                <span className="text-xs font-semibold text-zinc-400">
                  VehicleGPT is reasoning…
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="max-w-2xl mx-auto">
              <ErrorState
                message={error}
                onRetry={() => {
                  setError(null);
                  if (input.trim()) void handleSendQuery(input);
                }}
              />
            </div>
          )}

          <div ref={bottomRef} className="h-2" />
        </div>
      </div>

      {/* Docked Interactive Command Input Bar */}
      <footer className="z-20 shrink-0 border-t border-zinc-800/80 bg-[#0c0e14]/95 backdrop-blur-md px-4 md:px-8 py-3.5">
        <div className="max-w-5xl w-full mx-auto space-y-2">
          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendQuery(input);
            }}
            className="flex items-end gap-2 rounded-2xl border border-zinc-700/80 bg-zinc-900/90 p-2 shadow-xl focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask VehicleGPT about telemetry, faults, or efficiency… (e.g., 'Compare city vs highway energy')"
              className="flex-1 max-h-32 min-h-[38px] resize-none bg-transparent px-3 py-2 text-sm font-medium text-zinc-100 placeholder-zinc-500 outline-none"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              title="Send query"
              aria-label="Send query"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md shadow-orange-600/30 transition hover:from-orange-500 hover:to-orange-400 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          {/* Footer Shortcuts & Context Info */}
          <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
            <span>
              Autonomous Diagnostic Engine • SQLite Telemetry Store
            </span>
            <span className="hidden sm:inline">
              Press <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 font-mono text-[10px]">Enter ↵</kbd> to send, <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 font-mono text-[10px]">Shift + Enter</kbd> for new line
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
