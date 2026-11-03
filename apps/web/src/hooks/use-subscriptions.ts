"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Subscription,
  SubscriptionCreateInput,
  SubscriptionUpdateInput,
  SubscriptionListResponse,
} from "@/types/subscription";
import { apiClient, ApiError } from "@/lib/api-client";

export interface SubscriptionFilters {
  status?: string;
  category?: string;
  search?: string;
}

export function useSubscriptions(initialFilters: SubscriptionFilters = {}) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SubscriptionFilters>(initialFilters);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<SubscriptionListResponse>(
        "/subscriptions",
        {
          status: filters.status,
          category: filters.category,
          search: filters.search,
        }
      );
      setSubscriptions(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err?.message || "Failed to load subscriptions.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const createSubscription = async (
    input: SubscriptionCreateInput
  ): Promise<Subscription> => {
    try {
      const created = await apiClient.post<Subscription>("/subscriptions", input);
      await fetchSubscriptions();
      return created;
    } catch (err: any) {
      throw new Error(err?.message || "Failed to create subscription.");
    }
  };

  const updateSubscription = async (
    id: string,
    input: SubscriptionUpdateInput
  ): Promise<Subscription> => {
    try {
      const updated = await apiClient.patch<Subscription>(
        `/subscriptions/${id}`,
        input
      );
      await fetchSubscriptions();
      return updated;
    } catch (err: any) {
      throw new Error(err?.message || "Failed to update subscription.");
    }
  };

  const deleteSubscription = async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/subscriptions/${id}`);
      await fetchSubscriptions();
    } catch (err: any) {
      throw new Error(err?.message || "Failed to delete subscription.");
    }
  };

  const setFilterValue = (key: keyof SubscriptionFilters, value?: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" || !value ? undefined : value,
    }));
  };

  return {
    subscriptions,
    total,
    loading,
    error,
    filters,
    refresh: fetchSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    setFilterValue,
  };
}

