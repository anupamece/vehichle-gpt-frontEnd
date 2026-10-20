import { useState } from "react";
import type { ChatMessage as ChatMessageType } from "../../types/vehicle";
import {
  AlertTriangle,
  Check,
  Copy,
  Cpu,
  Database,
  Sparkles,
  User,
} from "lucide-react";
import logoImg from "../../assets/logo.png";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback or ignore
    }
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isUser) {
    return (
      <div className="flex w-full justify-end gap-3 group animate-fadeIn">
        <div className="flex max-w-[85%] sm:max-w-[75%] flex-col items-end">
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-[11px] font-semibold text-zinc-500">
              {formattedTime}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              You
            </span>
          </div>
          <div className="rounded-2xl rounded-tr-sm border border-orange-500/30 bg-gradient-to-br from-orange-500/15 to-orange-950/30 px-4 py-3 text-sm font-medium leading-relaxed text-orange-50 shadow-md shadow-orange-950/20">
            {message.content}
          </div>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-orange-500/40 bg-orange-500/20 text-orange-400 shadow-sm shadow-orange-500/10">
          <User className="h-4 w-4" />
        </div>
      </div>
    );
  }

  // Assistant message rendering
  const dataEntries = message.data ? Object.entries(message.data) : [];

  return (
    <div className="flex w-full justify-start gap-3.5 group animate-fadeIn">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-orange-500/30 bg-[#161a23] p-1.5 shadow-md shadow-orange-500/10">
        <img
          src={logoImg}
          alt="VehicleGPT"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="flex max-w-[92%] sm:max-w-[85%] flex-col">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3 mb-1 px-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-orange-400" />
              VehicleGPT Core
            </span>
            {message.intent && (
              <span className="rounded border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400">
                {message.intent}
              </span>
            )}
            <span className="text-[11px] font-medium text-zinc-500">
              {formattedTime}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            title={copied ? "Copied to clipboard" : "Copy response"}
            className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-[11px] font-semibold text-zinc-400 opacity-70 transition hover:border-zinc-700 hover:text-zinc-200 group-hover:opacity-100"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Message body */}
        <div className="rounded-2xl rounded-tl-sm border border-zinc-800/90 bg-[#12151d]/90 px-5 py-4 text-sm font-medium leading-relaxed text-zinc-200 shadow-xl backdrop-blur-sm">
          {/* Main textual response */}
          <div className="whitespace-pre-wrap space-y-2">
            {message.content}
          </div>

          {/* Structured Telemetry Data Chips (if available) */}
          {dataEntries.length > 0 && (
            <div className="mt-3.5 pt-3.5 border-t border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                <Cpu className="h-3.5 w-3.5 text-orange-400" />
                <span>Associated Telemetry Records</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {dataEntries.map(([key, val]) => (
                  <div
                    key={key}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1 text-xs"
                  >
                    <span className="font-mono text-zinc-400">{key}:</span>
                    <span className="font-mono font-bold text-orange-300">
                      {typeof val === "object" && val !== null
                        ? JSON.stringify(val)
                        : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings Callout */}
          {message.warnings && message.warnings.length > 0 && (
            <div className="mt-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400 mb-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Data Quality & Scope Warnings
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-amber-200/90">
                {message.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Sources Footer */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-zinc-500">
              <Database className="h-3 w-3 text-zinc-400" />
              <span>Verified against:</span>
              <div className="flex gap-1.5">
                {message.sources.map((src, i) => (
                  <span
                    key={i}
                    className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300"
                  >
                    {src}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
