"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { reminderApi } from "@/lib/api";
import { ReminderCard } from "@/components/reminders/reminder-card";
import { EmptyState } from "@/components/reminders/empty-state";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ReminderStatus, ReminderFilter } from "@/types/reminder";

export function Dashboard() {
  const [filters, setFilters] = useState<ReminderFilter>({
    sort_by: "scheduled_at",
    sort_order: "asc",
    page: 1,
    page_size: 50,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchQuery || undefined }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update status filter based on tab
  useEffect(() => {
    if (activeTab === "all") {
      setFilters((prev) => ({ ...prev, status: undefined }));
    } else {
      setFilters((prev) => ({ ...prev, status: activeTab as ReminderStatus }));
    }
  }, [activeTab]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["reminders", filters],
    queryFn: () => reminderApi.getReminders(filters),
    refetchInterval: 10000, // Refetch every 10 seconds to update countdown
  });

  const reminders = data?.items || [];
  const total = data?.total || 0;

  // Count reminders by status
  const scheduledCount = reminders.filter((r) => r.status === "scheduled").length;
  const completedCount = reminders.filter((r) => r.status === "completed").length;
  const failedCount = reminders.filter((r) => r.status === "failed").length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="h-11 bg-muted rounded-lg animate-pulse" />
          </div>
          <div className="h-11 w-full sm:w-auto bg-muted rounded-lg animate-pulse" />
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center space-y-4">
          <div className="text-6xl">😵</div>
          <h2 className="text-2xl font-bold text-destructive">Something went wrong</h2>
          <p className="text-muted-foreground max-w-md">
            {error instanceof Error ? error.message : "Failed to load reminders. Please try again."}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reminders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>{total} reminder{total !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="all" className="gap-2">
            All
            <span className="hidden sm:inline text-xs bg-muted-foreground/20 px-1.5 py-0.5 rounded-full">
              {total}
            </span>
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2">
            Scheduled
            <span className="hidden sm:inline text-xs bg-blue-500/20 text-blue-600 px-1.5 py-0.5 rounded-full">
              {scheduledCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            Completed
            <span className="hidden sm:inline text-xs bg-green-500/20 text-green-600 px-1.5 py-0.5 rounded-full">
              {completedCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="failed" className="gap-2">
            Failed
            <span className="hidden sm:inline text-xs bg-red-500/20 text-red-600 px-1.5 py-0.5 rounded-full">
              {failedCount}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {reminders.length === 0 ? (
            <EmptyState
              status={activeTab === "all" ? undefined : (activeTab as ReminderStatus)}
              hasSearch={!!searchQuery}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
