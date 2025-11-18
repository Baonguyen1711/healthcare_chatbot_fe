import { CreateReminderRequestProps } from '@/types/Request/Reminder';
import { createItem, deleteItem, getById, updateItem } from './base';
import { REMINDER_ENDPOINTS } from '@/types/Endpoint/reminder';

export class ReminderService {
    private baseUrl: string;
    private accessToken: string;

    constructor() {
        this.baseUrl = import.meta.env.VITE_REMINDER_BASE_URL;
        this.accessToken = (localStorage.getItem("accessToken") ?? "").replace(/\s+/g, "");
        console.log("this.accessToken",this.accessToken)
    }

    createReminder = async (data: CreateReminderRequestProps) => {
        return createItem(this.baseUrl, REMINDER_ENDPOINTS.CREATE, data,
            {
                token: this.accessToken
            }
        );
    };

    // getReminder = async () => {
    //     return getById(this.baseUrl, '/reminders', "",
    //         {
    //             token: this.accessToken
    //         }
    //     );
    // };

    // updateReminder = async (id: string, data: CreateReminderRequestProps) => {
    //     return updateItem(this.baseUrl, '/reminders', id, data);
    // };

    // deleteReminder = async (id: string) => {
    //     return deleteItem(this.baseUrl, '/reminders', id);
    // };

}


