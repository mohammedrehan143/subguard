"use client";

import React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { formatMinorUnits } from "@/lib/format-currency";
import { formatDate, formatRelativeDays } from "@/lib/date-utils";
import { SubscriptionStatusBadge } from "@/components/subscriptions/subscription-status";
import {
  CreditCard,
  TrendingUp,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Plus,
} from "lucide-react";

export default function DashboardPage() {
  const { subscriptions, loading } = useSubscriptions();

  // Compute live metrics from subscription data
  const activeSubs = subscriptions.filter((s) => s.status === "active");

  const monthlySpendMinor = activeSubs.reduce((acc, sub) => {
    if (sub.billing_interval === "monthly") {
      return acc + sub.amount_minor;
    } else if (sub.billing_interval === "yearly") {
      return acc + Math.round(sub.amount_minor / 12);
    } else if (sub.billing_interval === "quarterly") {
      return acc + Math.round(sub.amount_minor / 3);
    } else if (sub.billing_interval === "weekly") {
      return acc + Math.round(sub.amount_minor * 4.33);
    }
    return acc + sub.amount_minor;
  }, 0);

  // Find nearest renewal
  const upcomingSorted = [...activeSubs]
    .filter((s) => s.next_renewal_at)
    .sort((a, b) => {
      const da = new Date(a.next_renewal_at!).getTime();
      const db = new Date(b.next_renewal_at!).getTime();
      return da - db;
    });

  const nextRenewalSub = upcomingSorted[0];

  // Price change alerts count
  const priceAlerts = subscriptions.filter(
    (s) => s.last_amount_minor && s.last_amount_minor !== s.amount_minor
  );

  return (
    <PageContainer
      title="Dashboard"
      description="Subscription intelligence and financial recurring spend breakdown."
      action={
        <Link
          href="/subscriptions"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
        >
          <CreditCard className="h-4 w-4" />
          Manage All Subscriptions
        </Link>
      }
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Monthly Recurring Spend */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Monthly Spend
            </span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {loading ? "..." : formatMinorUnits(monthlySpendMinor, "INR")}
          </div>
          <p className="text-[11px] text-slate-500">
            Normalized across {activeSubs.length} active subscriptions
          </p>
        </div>

        {/* Active Subscriptions */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Services
            </span>
            <CreditCard className="h-4 w-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {loading ? "..." : activeSubs.length}
          </div>
          <p className="text-[11px] text-slate-500">
            {subscriptions.length - activeSubs.length} paused or cancelled
          </p>
        </div>

        {/* Next Renewal */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Next Renewal
            </span>
            <Calendar className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 truncate">
            {nextRenewalSub ? nextRenewalSub.name : "None"}
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold truncate">
            {nextRenewalSub
              ? `${formatRelativeDays(nextRenewalSub.next_renewal_at)} (${formatDate(nextRenewalSub.next_renewal_at)})`
              : "No upcoming renewals"}
          </p>
        </div>

        {/* Price Alerts */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Price Changes
            </span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {loading ? "..." : priceAlerts.length}
          </div>
          <p className="text-[11px] text-slate-500">
            {priceAlerts.length > 0
              ? `${priceAlerts[0].name} changed recently`
              : "All subscriptions stable"}
          </p>
        </div>
      </div>

      {/* Upcoming Renewals Schedule Preview */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Upcoming Renewals
            </h2>
            <p className="text-xs text-slate-500">
              Renewals approaching in the next 30 days
            </p>
          </div>
          <Link
            href="/subscriptions"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {upcomingSorted.slice(0, 5).map((sub) => (
            <div
              key={sub.id}
              className="py-3.5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                  {sub.name.charAt(0)}
                </div>
                <div>
                  <Link
                    href={`/subscriptions/${sub.id}`}
                    className="font-semibold text-sm text-slate-900 hover:text-emerald-700 transition"
                  >
                    {sub.name}
                  </Link>
                  <p className="text-xs text-slate-400 capitalize">
                    {sub.category.replace("_", " ")} &bull; {sub.billing_interval}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-sm text-slate-900">
                  {formatMinorUnits(sub.amount_minor, sub.currency)}
                </div>
                <div className="text-xs font-medium text-emerald-700">
                  {formatRelativeDays(sub.next_renewal_at)}
                </div>
              </div>
            </div>
          ))}

          {upcomingSorted.length === 0 && !loading && (
            <div className="py-8 text-center text-xs text-slate-500">
              No active upcoming renewals found.
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

