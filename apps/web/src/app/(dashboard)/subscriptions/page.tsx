"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { SubscriptionCard } from "@/components/subscriptions/subscription-card";
import { SubscriptionTable } from "@/components/subscriptions/subscription-table";
import { SubscriptionFormModal } from "@/components/subscriptions/subscription-form";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { Subscription, SubscriptionCreateInput, SubscriptionUpdateInput } from "@/types/subscription";
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List as ListIcon,
  RefreshCw,
  AlertCircle,
  CreditCard,
} from "lucide-react";

export default function SubscriptionsPage() {
  const {
    subscriptions,
    total,
    loading,
    error,
    filters,
    refresh,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    setFilterValue,
  } = useSubscriptions();

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [deletingSub, setDeletingSub] = useState<Subscription | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenAdd = () => {
    setEditingSub(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (
    data: SubscriptionCreateInput | SubscriptionUpdateInput
  ) => {
    if (editingSub) {
      await updateSubscription(editingSub.id, data as SubscriptionUpdateInput);
    } else {
      await createSubscription(data as SubscriptionCreateInput);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSub) return;
    setIsDeleting(true);
    try {
      await deleteSubscription(deletingSub.id);
      setDeletingSub(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageContainer
      title="Subscriptions"
      description="Manage, track, and optimize your recurring subscriptions with automated renewal schedules."
      action={
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
        >
          <Plus className="h-4 w-4" />
          Add Subscription
        </button>
      }
    >
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search subscriptions or merchants..."
            value={filters.search || ""}
            onChange={(e) => setFilterValue("search", e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={filters.status || "all"}
              onChange={(e) => setFilterValue("status", e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 bg-white focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="trial">Trial</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Category Filter */}
          <select
            value={filters.category || "all"}
            onChange={(e) => setFilterValue("category", e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 bg-white focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition"
          >
            <option value="all">All Categories</option>
            <option value="entertainment">Entertainment</option>
            <option value="productivity">Productivity</option>
            <option value="ai_tools">AI Tools</option>
            <option value="utilities">Utilities</option>
            <option value="cloud_services">Cloud Services</option>
            <option value="fitness">Fitness</option>
            <option value="finance">Finance</option>
            <option value="other">Other</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Table view"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={() => refresh()}
            className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition"
            title="Reload subscriptions"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => refresh()}
            className="font-semibold underline hover:text-rose-900"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && subscriptions.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl border border-slate-200/80 bg-white p-5 animate-pulse space-y-4"
            >
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-8 bg-slate-100 rounded w-1/3" />
              <div className="h-10 bg-slate-50 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && subscriptions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">No subscriptions found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {filters.search || filters.status || filters.category
                ? "Try clearing your filters or search query to see your subscriptions."
                : "You don't have any tracked subscriptions yet. Add your first service to start tracking renewals."}
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Subscription
          </button>
        </div>
      )}

      {/* Populated State */}
      {subscriptions.length > 0 && (
        <>
          <div className="text-xs text-slate-500 font-medium">
            Showing {subscriptions.length} of {total} subscriptions
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptions.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  onEdit={handleOpenEdit}
                  onDelete={setDeletingSub}
                />
              ))}
            </div>
          ) : (
            <SubscriptionTable
              subscriptions={subscriptions}
              onEdit={handleOpenEdit}
              onDelete={setDeletingSub}
            />
          )}
        </>
      )}

      {/* Create / Edit Modal */}
      <SubscriptionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingSub}
      />

      {/* Delete Confirmation Modal */}
      {deletingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Delete Subscription
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to stop tracking{" "}
              <strong className="text-slate-900">{deletingSub.name}</strong>?
              This will remove local tracking. Note: This action does not
              cancel your external billing with the provider.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSub(null)}
                disabled={isDeleting}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition"
              >
                {isDeleting ? "Deleting..." : "Delete Tracking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

