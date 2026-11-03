import React from "react";
import Link from "next/link";
import { Subscription } from "@/types/subscription";
import { formatMinorUnits } from "@/lib/format-currency";
import { formatDate, formatRelativeDays } from "@/lib/date-utils";
import { SubscriptionStatusBadge } from "./subscription-status";
import { Calendar, Tag, AlertTriangle, ArrowUpRight, Edit2, Trash2 } from "lucide-react";

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
}

export function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
}: SubscriptionCardProps) {
  const hasPriceChange =
    subscription.last_amount_minor &&
    subscription.last_amount_minor !== subscription.amount_minor;

  const priceDiff = hasPriceChange
    ? subscription.amount_minor - (subscription.last_amount_minor || 0)
    : 0;

  return (
    <div className="group relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition">
              <Link href={`/subscriptions/${subscription.id}`} className="hover:underline flex items-center gap-1">
                {subscription.name}
                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </h3>
            {subscription.source === "demo" && (
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                DEMO
              </span>
            )}
            {subscription.source === "paypal" && (
              <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 border border-sky-200">
                PAYPAL
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 capitalize flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {subscription.category.replace("_", " ")}
          </p>
        </div>

        <SubscriptionStatusBadge status={subscription.status} />
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {formatMinorUnits(subscription.amount_minor, subscription.currency)}
          </span>
          <span className="text-xs text-slate-500 ml-1">
            /{subscription.billing_interval}
          </span>
        </div>

        {hasPriceChange && (
          <div className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <AlertTriangle className="h-3 w-3" />
            <span>
              {priceDiff > 0 ? "+" : ""}
              {formatMinorUnits(priceDiff, subscription.currency)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 bg-slate-50/70 px-3 py-2 rounded-lg">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          {formatDate(subscription.next_renewal_at)}
        </span>
        <span className="font-medium text-slate-700">
          {formatRelativeDays(subscription.next_renewal_at)}
        </span>
      </div>

      {subscription.notes && (
        <p className="mt-3 text-xs text-slate-500 line-clamp-1 italic">
          &ldquo;{subscription.notes}&rdquo;
        </p>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
        <button
          onClick={() => onEdit(subscription)}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition"
        >
          <Edit2 className="h-3 w-3" />
          Edit
        </button>
        <button
          onClick={() => onDelete(subscription)}
          className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-800 px-2.5 py-1.5 rounded-md hover:bg-rose-50 transition"
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </button>
      </div>
    </div>
  );
}

