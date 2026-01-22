import axios from "axios";
import type {
  Reminder,
  ReminderCreate,
  ReminderUpdate,
  ReminderListResponse,
  ReminderFilter,
} from "@/types/reminder";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const reminderApi = {
  // Get all reminders with filtering
  getReminders: async (filters?: ReminderFilter): Promise<ReminderListResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.sort_by) {
      params.append("sort_by", filters.sort_by);
    }
    if (filters?.sort_order) {
      params.append("sort_order", filters.sort_order);
    }
    if (filters?.page) {
      params.append("page", filters.page.toString());
    }
    if (filters?.page_size) {
      params.append("page_size", filters.page_size.toString());
    }

    const response = await api.get<ReminderListResponse>(
      `/reminders?${params.toString()}`
    );
    return response.data;
  },

  // Get a single reminder
  getReminder: async (id: number): Promise<Reminder> => {
    const response = await api.get<Reminder>(`/reminders/${id}`);
    return response.data;
  },

  // Create a new reminder
  createReminder: async (data: ReminderCreate): Promise<Reminder> => {
    const response = await api.post<Reminder>("/reminders", data);
    return response.data;
  },

  // Update a reminder
  updateReminder: async (id: number, data: ReminderUpdate): Promise<Reminder> => {
    const response = await api.put<Reminder>(`/reminders/${id}`, data);
    return response.data;
  },

  // Delete a reminder
  deleteReminder: async (id: number): Promise<void> => {
    await api.delete(`/reminders/${id}`);
  },

  // Get available timezones
  getTimezones: async (): Promise<string[]> => {
    const response = await api.get<{ timezones: string[] }>("/reminders/timezones");
    return response.data.timezones;
  },
};
