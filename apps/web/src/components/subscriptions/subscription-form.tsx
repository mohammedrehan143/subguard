"use client";

import React, { useState, useEffect } from "react";
import {
  Subscription,
  SubscriptionCreateInput,
  SubscriptionUpdateInput,
  SubscriptionInterval,
  SubscriptionStatus,
} from "@/types/subscription";
import { minorToMajor, majorToMinor } from "@/lib/format-currency";
import { toInputDateValue } from "@/lib/date-utils";
import { X } from "lucide-react";

interface SubscriptionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubscriptionCreateInput | SubscriptionUpdateInput) => Promise<void>;
  initialData?: Subscription | null;
}

const CATEGORIES = [
  { value: "entertainment", label: "Entertainment" },
  { value: "productivity", label: "Productivity" },
  { value: "ai_tools", label: "AI Tools" },
  { value: "utilities", label: "Utilities" },
  { value: "cloud_services", label: "Cloud Services" },
  { value: "fitness", label: "Fitness & Health" },
  { value: "education", label: "Education" },
  { value: "finance", label: "Finance" },
  { value: "other", label: "Other" },
];

const INTERVALS: { value: SubscriptionInterval; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "weekly", label: "Weekly" },
  { value: "custom", label: "Custom Days" },
];

const STATUSES: { value: SubscriptionStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "trial", label: "Trial" },
  { value: "cancelled", label: "Cancelled" },
];

export function SubscriptionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: SubscriptionFormModalProps) {
  const isEditing = Boolean(initialData);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState("INR");
  const [category, setCategory] = useState("entertainment");
  const [billingInterval, setBillingInterval] = useState<SubscriptionInterval>("monthly");
  const [intervalDays, setIntervalDays] = useState<string>("");
  const [nextRenewal, setNextRenewal] = useState("");
  const [status, setStatus] = useState<SubscriptionStatus>("active");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAmount(minorToMajor(initialData.amount_minor).toString());
      setCurrency(initialData.currency);
      setCategory(initialData.category);
      setBillingInterval(initialData.billing_interval);
      setIntervalDays(initialData.interval_days ? initialData.interval_days.toString() : "");
      setNextRenewal(toInputDateValue(initialData.next_renewal_at));
      setStatus(initialData.status);
      setNotes(initialData.notes || "");
    } else {
      setName("");
      setAmount("");
      setCurrency("INR");
      setCategory("entertainment");
      setBillingInterval("monthly");
      setIntervalDays("");
      // Default to 30 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      setNextRenewal(defaultDate.toISOString().split("T")[0]);
      setStatus("active");
      setNotes("");
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Subscription name is required.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setError("Please enter a valid non-negative amount.");
      return;
    }

    const amountMinor = majorToMinor(parsedAmount);

    setSubmitting(true);
    try {
      const payload: any = {
        name: name.trim(),
        amount_minor: amountMinor,
        currency: currency.toUpperCase(),
        category,
        billing_interval: billingInterval,
        status,
        notes: notes.trim() || undefined,
      };

      if (billingInterval === "custom" && intervalDays) {
        payload.interval_days = parseInt(intervalDays, 10);
      }

      if (nextRenewal) {
        payload.next_renewal_at = new Date(nextRenewal).toISOString();
      }

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save subscription.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900">
            {isEditing ? `Edit ${initialData?.name}` : "Add New Subscription"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Service Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Netflix, Spotify, GitHub"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Billing Cycle
              </label>
              <select
                value={billingInterval}
                onChange={(e) => setBillingInterval(e.target.value as SubscriptionInterval)}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition"
              >
                {INTERVALS.map((intv) => (
                  <option key={intv.value} value={intv.value}>
                    {intv.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {billingInterval === "custom" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Interval Days
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={intervalDays}
                onChange={(e) => setIntervalDays(e.target.value)}
                placeholder="e.g. 14, 45"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Next Renewal Date
              </label>
              <input
                type="date"
                value={nextRenewal}
                onChange={(e) => setNextRenewal(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition"
              >
                {STATUSES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Shared with family, annual discount code applied"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Subscription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

