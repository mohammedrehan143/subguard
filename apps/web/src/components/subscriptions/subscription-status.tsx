import React from "react";
import { SubscriptionStatus } from "@/types/subscription";

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus | string;
}

export function SubscriptionStatusBadge({ status }: SubscriptionStatusBadgeProps) {
  const normalized = status.toLowerCase();

  switch (normalized) {
    case "active":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      );
    case "paused":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Paused
        </span>
      );
    case "trial":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Trial
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 border border-slate-200">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 border border-slate-200">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          {status}
        </span>
      );
  }
}

