import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = "Loading…",
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-zinc-400">
      <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
