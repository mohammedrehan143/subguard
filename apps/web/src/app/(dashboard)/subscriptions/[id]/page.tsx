"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { SubscriptionStatusBadge } from "@/components/subscriptions/subscription-status";
import { SubscriptionFormModal } from "@/components/subscriptions/subscription-form";
import { apiClient } from "@/lib/api-client";
import { Subscription } from "@/types/subscription";
import { formatMinorUnits } from "@/lib/format-currency";
import { formatDate, formatRelativeDays } from "@/lib/date-utils";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Tag,
  AlertTriangle,
  Clock,
  FileText,
  Edit2,
  Trash2,
} from "lucide-react";

export default function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Subscription>(`/subscriptions/${id}`);
      setSubscription(data);
    } catch (err: any) {
      setError(err?.message || "Subscription not found.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleUpdate = async (data: any) => {
    await apiClient.patch<Subscription>(`/subscriptions/${id}`, data);
    await fetchDetail();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/subscriptions/${id}`);
      router.push("/subscriptions");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="h-64 rounded-2xl border border-slate-200 bg-white p-8 animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4" />
          <div className="h-10 bg-slate-100 rounded w-1/2" />
          <div className="h-24 bg-slate-50 rounded" />
        </div>
      </PageContainer>
    );
  }

  if (error || !subscription) {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-4">
          <p className="text-sm text-slate-600">{error || "Subscription not found."}</p>
          <Link
            href="/subscriptions"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Subscriptions
          </Link>
        </div>
      </PageContainer>
    );
  }

  const hasPriceChange =
    subscription.last_amount_minor &&
    subscription.last_amount_minor !== subscription.amount_minor;

  const priceDiff = hasPriceChange
    ? subscription.amount_minor - (subscription.last_amount_minor || 0)
    : 0;

  return (
    <PageContainer>
      {/* Back button */}
      <div>
        <Link
          href="/subscriptions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Subscriptions
        </Link>
      </div>

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {subscription.name}
            </h1>
            <SubscriptionStatusBadge status={subscription.status} />
            {subscription.source === "demo" && (
              <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                Demo Record
              </span>
            )}
            {subscription.source === "paypal" && (
              <span className="rounded bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 border border-sky-200">
                PayPal Managed
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 capitalize flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            {subscription.category.replace("_", " ")} &bull; Merchant key:{" "}
            <code className="text-slate-700 font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
              {subscription.merchant_key}
            </code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cost Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Current Recurring Rate
          </span>
          <div className="text-3xl font-extrabold text-slate-900">
            {formatMinorUnits(subscription.amount_minor, subscription.currency)}
          </div>
          <p className="text-xs text-slate-500 capitalize">
            Billed {subscription.billing_interval}
          </p>

          {hasPriceChange && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>
                Historical change: Was{" "}
                {formatMinorUnits(subscription.last_amount_minor || 0, subscription.currency)} (
                {priceDiff > 0 ? "+" : ""}
                {formatMinorUnits(priceDiff, subscription.currency)})
              </span>
            </div>
          )}
        </div>

        {/* Renewal Schedule Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Next Renewal
          </span>
          <div className="text-3xl font-extrabold text-slate-900">
            {formatDate(subscription.next_renewal_at)}
          </div>
          <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatRelativeDays(subscription.next_renewal_at)}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Cadence interval: {subscription.billing_interval}
            {subscription.interval_days ? ` (${subscription.interval_days} days)` : ""}
          </div>
        </div>

        {/* Source & Integration Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Source & Details
          </span>
          <div className="flex items-center gap-2 text-base font-bold text-slate-900">
            <CreditCard className="h-4 w-4 text-slate-500" />
            <span className="capitalize">{subscription.source}</span>
          </div>
          {subscription.paypal_subscription_id ? (
            <p className="text-xs text-slate-500 font-mono">
              PayPal ID: {subscription.paypal_subscription_id}
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Manually tracked recurring expense
            </p>
          )}
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
            Created: {formatDate(subscription.created_at)}
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {subscription.notes && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-2">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-500" />
            Notes & Details
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {subscription.notes}
          </p>
        </div>
      )}

      {/* Edit Modal */}
      <SubscriptionFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdate}
        initialData={subscription}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Confirm Deletion
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete tracking for{" "}
              <strong>{subscription.name}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
