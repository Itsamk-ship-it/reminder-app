"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Phone, Calendar, MessageSquare, Globe, Type } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reminderApi } from "@/lib/api";
import { formatDateForInput } from "@/lib/utils";
import type { Reminder } from "@/types/reminder";

const reminderSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  message: z.string().min(1, "Message is required"),
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^[+\d][\d\s()-]{6,24}$/,
      "Enter a valid phone number"
    ),
  scheduled_at: z.string().min(1, "Date and time is required"),
  timezone: z.string().min(1, "Timezone is required"),
});

type ReminderFormData = z.infer<typeof reminderSchema>;

function getApiErrorMessage(error: Error): string {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0];
      if (typeof first?.msg === "string") return first.msg;
    }
  }
  return error.message;
}

interface ReminderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminder?: Reminder;
}

export function ReminderFormDialog({
  open,
  onOpenChange,
  reminder,
}: ReminderFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!reminder;

  // Fetch timezones
  const { data: timezones } = useQuery({
    queryKey: ["timezones"],
    queryFn: reminderApi.getTimezones,
    staleTime: Infinity,
  });

  // Detect user's timezone
  const detectedTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "UTC";
    }
  }, []);

  // Default values
  const defaultValues: ReminderFormData = useMemo(
    () => ({
      title: reminder?.title || "",
      message: reminder?.message || "",
      phone_number: reminder?.phone_number || "",
      scheduled_at: reminder?.scheduled_at
        ? formatDateForInput(new Date(reminder.scheduled_at))
        : "",
      timezone: reminder?.timezone || detectedTimezone,
    }),
    [reminder, detectedTimezone]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues,
  });

  // Reset form when dialog opens/closes or reminder changes
  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, reset, defaultValues]);

  const currentTimezone = watch("timezone");

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: ReminderFormData) => {
      const scheduledAt = new Date(data.scheduled_at).toISOString();
      return reminderApi.createReminder({
        ...data,
        scheduled_at: scheduledAt,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder created successfully!");
      onOpenChange(false);
      reset();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create reminder: ${getApiErrorMessage(error)}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: ReminderFormData) => {
      const scheduledAt = new Date(data.scheduled_at).toISOString();
      return reminderApi.updateReminder(reminder!.id, {
        ...data,
        scheduled_at: scheduledAt,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder updated successfully!");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update reminder: ${getApiErrorMessage(error)}`);
    },
  });

  const onSubmit = (data: ReminderFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Get minimum datetime (now + 1 minute)
  const minDateTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return formatDateForInput(now);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Edit Reminder" : "Create New Reminder"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of your reminder."
              : "Set up a voice call reminder. We'll call you at the scheduled time."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              Title
            </Label>
            <Input
              id="title"
              placeholder="e.g., Doctor's Appointment"
              {...register("title")}
              error={!!errors.title}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Message (what will be spoken)
            </Label>
            <Textarea
              id="message"
              placeholder="e.g., Remember to bring your insurance card and arrive 15 minutes early."
              {...register("message")}
              error={!!errors.message}
              disabled={isLoading}
              rows={3}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone_number" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Phone Number
            </Label>
            <Input
              id="phone_number"
              type="tel"
              placeholder="+14155552671"
              {...register("phone_number")}
              error={!!errors.phone_number}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Enter international format (e.g., +923001234567) or local format (e.g., 03001234567)
            </p>
            {errors.phone_number && (
              <p className="text-sm text-destructive">
                {errors.phone_number.message}
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div className="space-y-2">
            <Label htmlFor="scheduled_at" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Date & Time
            </Label>
            <Input
              id="scheduled_at"
              type="datetime-local"
              min={minDateTime}
              {...register("scheduled_at")}
              error={!!errors.scheduled_at}
              disabled={isLoading}
            />
            {errors.scheduled_at && (
              <p className="text-sm text-destructive">
                {errors.scheduled_at.message}
              </p>
            )}
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone" className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Timezone
            </Label>
            <Select
              value={currentTimezone}
              onValueChange={(value) => setValue("timezone", value)}
              disabled={isLoading}
            >
              <SelectTrigger error={!!errors.timezone}>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones?.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace(/_/g, " ")}
                    {tz === detectedTimezone && " (Detected)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.timezone && (
              <p className="text-sm text-destructive">
                {errors.timezone.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {isEditing ? "Save Changes" : "Create Reminder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
