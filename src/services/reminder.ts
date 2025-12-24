import { CreateReminderRequestProps } from '@/types/Request/Reminder';
import { createItem, deleteItem, getAll, updateItem } from './base';
import { REMINDER_ENDPOINTS } from '@/types/Endpoint/reminder';

export class ReminderService {
    private baseUrl: string;
    private accessToken: string;

    constructor() {
        this.baseUrl = import.meta.env.VITE_REMINDER_BASE_URL;
        this.accessToken = (localStorage.getItem("accessToken") ?? "").replace(/\s+/g, "");
    }

    createReminder = async (data: CreateReminderRequestProps) => {
        return createItem(this.baseUrl, REMINDER_ENDPOINTS.CREATE, data,
            {
                token: this.accessToken
            }
        );
    };

    getReminders = async () => {
        return getAll<any>(this.baseUrl, REMINDER_ENDPOINTS.CREATE,
            {
                token: this.accessToken
            }
        );
    };

    updateReminder = async (id: string, data: any) => {
        return updateItem(this.baseUrl, REMINDER_ENDPOINTS.CREATE, id, data,
            {
                token: this.accessToken
            }
        );
    };

    deleteReminder = async (id: string) => {
        return deleteItem(this.baseUrl, REMINDER_ENDPOINTS.CREATE, id,
            {
                token: this.accessToken
            }
        );
    };
}