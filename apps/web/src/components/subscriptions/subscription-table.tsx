import React from "react";
import Link from "next/link";
import { Subscription } from "@/types/subscription";
import { formatMinorUnits } from "@/lib/format-currency";
import { formatDate, formatRelativeDays } from "@/lib/date-utils";
import { SubscriptionStatusBadge } from "./subscription-status";
import { Edit2, Trash2, ArrowUpRight, AlertTriangle } from "lucide-react";

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
}

export function SubscriptionTable({
  subscriptions,
  onEdit,
  onDelete,
}: SubscriptionTableProps) {
  if (subscriptions.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/70 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-6 py-3.5 font-semibold">
                Service
              </th>
              <th scope="col" className="px-6 py-3.5 font-semibold">
                Amount
              </th>
              <th scope="col" className="px-6 py-3.5 font-semibold">
                Billing Cycle
              </th>
              <th scope="col" className="px-6 py-3.5 font-semibold">
                Next Renewal
              </th>
              <th scope="col" className="px-6 py-3.5 font-semibold">
                Status
              </th>
              <th scope="col" className="px-6 py-3.5 font-semibold text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subscriptions.map((sub) => {
              const hasPriceChange =
                sub.last_amount_minor && sub.last_amount_minor !== sub.amount_minor;

              return (
                <tr
                  key={sub.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/subscriptions/${sub.id}`}
                        className="font-semibold text-slate-900 hover:text-emerald-700 flex items-center gap-1 group"
                      >
                        {sub.name}
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      {sub.source === "demo" && (
                        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                          DEMO
                        </span>
                      )}
                      {sub.source === "paypal" && (
                        <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 border border-sky-200">
                          PAYPAL
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 capitalize">
                      {sub.category.replace("_", " ")}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">
                      {formatMinorUnits(sub.amount_minor, sub.currency)}
                    </div>
                    {hasPriceChange && (
                      <div className="flex items-center gap-1 text-[11px] text-amber-700">
                        <AlertTriangle className="h-3 w-3" />
                        Was {formatMinorUnits(sub.last_amount_minor || 0, sub.currency)}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 capitalize text-slate-600">
                    {sub.billing_interval}
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-slate-900 font-medium">
                      {formatDate(sub.next_renewal_at)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatRelativeDays(sub.next_renewal_at)}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <SubscriptionStatusBadge status={sub.status} />
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(sub)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
                        title="Edit subscription"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(sub)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition"
                        title="Delete subscription"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

