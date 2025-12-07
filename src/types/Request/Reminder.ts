export interface CreateReminderRequestProps {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    notifyAt: string; // ISO string
}