"use client";

import { Calendar, CheckCircle2, XCircle, Bell, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ReminderFormDialog } from "@/components/reminders/reminder-form-dialog";
import type { ReminderStatus } from "@/types/reminder";

interface EmptyStateProps {
  status?: ReminderStatus;
  hasSearch?: boolean;
}

const emptyStateConfig: Record<
  string,
  { icon: typeof Bell; title: string; description: string; color: string }
> = {
  default: {
    icon: Bell,
    title: "No reminders yet",
    description: "Create your first reminder and never forget anything again!",
    color: "text-primary",
  },
  scheduled: {
    icon: Calendar,
    title: "No scheduled reminders",
    description: "All your reminders have been processed. Create a new one!",
    color: "text-blue-500",
  },
  completed: {
    icon: CheckCircle2,
    title: "No completed reminders",
    description: "Your completed reminders will appear here.",
    color: "text-green-500",
  },
  failed: {
    icon: XCircle,
    title: "No failed reminders",
    description: "That's great! All your reminders are working perfectly.",
    color: "text-red-500",
  },
  search: {
    icon: Bell,
    title: "No results found",
    description: "Try adjusting your search terms or filters.",
    color: "text-muted-foreground",
  },
};

export function EmptyState({ status, hasSearch }: EmptyStateProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const configKey = hasSearch ? "search" : status || "default";
  const config = emptyStateConfig[configKey];
  const Icon = config.icon;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center py-16 px-4"
      >
        <div
          className={`relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted ${config.color}`}
        >
          <Icon className="h-12 w-12" />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-current opacity-20"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        <h3 className="text-xl font-semibold mb-2">{config.title}</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {config.description}
        </p>

        {!hasSearch && (
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Reminder
          </Button>
        )}
      </motion.div>

      <ReminderFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </>
  );
}
