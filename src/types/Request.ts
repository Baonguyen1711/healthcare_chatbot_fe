export interface CreateReminderRequestProps {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    userId: string;
    notifyAt: string; // ISO string
}