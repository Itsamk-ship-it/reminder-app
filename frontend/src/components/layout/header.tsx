"use client";

import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ReminderFormDialog } from "@/components/reminders/reminder-form-dialog";

export function Header() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg">
              <Bell className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Call Me Reminder</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Never forget with voice call reminders
              </p>
            </div>
          </div>

          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Reminder</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </header>

      <ReminderFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </>
  );
}
