export type ReminderStatus = "scheduled" | "completed" | "failed" | "cancelled";

export interface Reminder {
  id: number;
  title: string;
  message: string;
  phone_number: string;
  scheduled_at: string;
  timezone: string;
  status: ReminderStatus;
  call_id: string | null;
  call_started_at: string | null;
  call_ended_at: string | null;
  call_duration: number | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReminderCreate {
  title: string;
  message: string;
  phone_number: string;
  scheduled_at: string;
  timezone: string;
}

export interface ReminderUpdate {
  title?: string;
  message?: string;
  phone_number?: string;
  scheduled_at?: string;
  timezone?: string;
}

export interface ReminderListResponse {
  items: Reminder[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ReminderFilter {
  status?: ReminderStatus;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  page?: number;
  page_size?: number;
}
