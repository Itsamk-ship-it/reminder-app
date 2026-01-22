"use client";

import { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Phone,
  Calendar,
  Clock,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle2,
  Timer,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReminderFormDialog } from "@/components/reminders/reminder-form-dialog";
import { reminderApi } from "@/lib/api";
import { formatPhoneNumber, getTimeRemaining, cn } from "@/lib/utils";
import type { Reminder, ReminderStatus } from "@/types/reminder";

interface ReminderCardProps {
  reminder: Reminder;
}

const statusConfig: Record<
  ReminderStatus,
  { label: string; variant: "scheduled" | "completed" | "failed"; icon: typeof Clock }
> = {
  scheduled: { label: "Scheduled", variant: "scheduled", icon: Clock },
  completed: { label: "Completed", variant: "completed", icon: CheckCircle2 },
  failed: { label: "Failed", variant: "failed", icon: AlertCircle },
  cancelled: { label: "Cancelled", variant: "failed", icon: AlertCircle },
};

export function ReminderCard({ reminder }: ReminderCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(reminder.scheduled_at));
  const queryClient = useQueryClient();

  // Update countdown every minute
  useEffect(() => {
    if (reminder.status !== "scheduled") return;

    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(reminder.scheduled_at));
    }, 60000);

    return () => clearInterval(interval);
  }, [reminder.scheduled_at, reminder.status]);

  const deleteMutation = useMutation({
    mutationFn: () => reminderApi.deleteReminder(reminder.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder deleted successfully");
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const statusInfo = statusConfig[reminder.status];
  const StatusIcon = statusInfo.icon;

  const formattedDate = useMemo(() => {
    try {
      // Ensure the date is treated as UTC by appending 'Z' if not present
      const dateStr = reminder.scheduled_at.endsWith('Z') 
        ? reminder.scheduled_at 
        : reminder.scheduled_at + 'Z';
      const utcDate = new Date(dateStr);
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: reminder.timezone || 'UTC',
      };
      return utcDate.toLocaleDateString('en-US', options);
    } catch {
      return "Invalid date";
    }
  }, [reminder.scheduled_at, reminder.timezone]);

  const formattedTime = useMemo(() => {
    try {
      // Ensure the date is treated as UTC by appending 'Z' if not present
      const dateStr = reminder.scheduled_at.endsWith('Z') 
        ? reminder.scheduled_at 
        : reminder.scheduled_at + 'Z';
      const utcDate = new Date(dateStr);
      const options: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: reminder.timezone || 'UTC',
      };
      return utcDate.toLocaleTimeString('en-US', options);
    } catch {
      return "Invalid time";
    }
  }, [reminder.scheduled_at, reminder.timezone]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={cn(
          "group relative overflow-hidden transition-all duration-300",
          reminder.status === "scheduled" && "hover:border-primary/50",
          reminder.status === "completed" && "opacity-80",
          reminder.status === "failed" && "border-destructive/30"
        )}>
          {/* Status indicator line */}
          <div
            className={cn(
              "absolute left-0 top-0 h-full w-1 transition-all duration-300",
              reminder.status === "scheduled" && "bg-blue-500",
              reminder.status === "completed" && "bg-green-500",
              reminder.status === "failed" && "bg-red-500"
            )}
          />

          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate pr-2">{reminder.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formattedDate}</span>
                  <span>•</span>
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formattedTime}</span>
                </div>
              </div>
              <Badge variant={statusInfo.variant} className="flex items-center gap-1.5 shrink-0">
                <StatusIcon className="h-3 w-3" />
                {statusInfo.label}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Message */}
            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
              {reminder.message}
            </p>

            {/* Phone and countdown */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span className="font-mono">{formatPhoneNumber(reminder.phone_number)}</span>
              </div>

              {reminder.status === "scheduled" && (
                <div className="flex items-center gap-1.5 text-primary font-medium">
                  <Timer className="h-4 w-4" />
                  <span className="text-xs">{timeRemaining}</span>
                </div>
              )}
            </div>

            {/* Error message */}
            {reminder.error_message && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-destructive/10 text-destructive text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{reminder.error_message}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              {reminder.status === "scheduled" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Reminder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{reminder.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              isLoading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <ReminderFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        reminder={reminder}
      />
    </>
  );
}
