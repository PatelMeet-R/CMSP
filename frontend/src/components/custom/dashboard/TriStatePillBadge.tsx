import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you use standard shadcn utils

type PermissionState = "default" | "grant" | "revoke";

interface TriStatePillsProps {
  currentState: PermissionState;
  onChange: (newState: PermissionState) => void;
}

export function TriStatePills({ currentState, onChange }: TriStatePillsProps) {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-muted/30 border rounded-full">
      {/* Default / Inherit Pill */}
      <button
        onClick={() => onChange("default")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all",
          currentState === "default"
            ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-sm"
            : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800/50",
        )}
      >
        <MinusCircle className="w-3.5 h-3.5" />
        Inherit
      </button>

      {/* Grant Pill */}
      <button
        onClick={() => onChange("grant")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all",
          currentState === "grant"
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 shadow-sm"
            : "text-muted-foreground hover:bg-emerald-50 dark:hover:bg-emerald-500/10",
        )}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        Grant
      </button>

      {/* Revoke Pill */}
      <button
        onClick={() => onChange("revoke")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all",
          currentState === "revoke"
            ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 shadow-sm"
            : "text-muted-foreground hover:bg-rose-50 dark:hover:bg-rose-500/10",
        )}
      >
        <XCircle className="w-3.5 h-3.5" />
        Revoke
      </button>
    </div>
  );
}
