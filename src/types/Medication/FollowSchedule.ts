export interface ReminderSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface MedicationScheduleItem {
  id: string;
  name: string;
  dosage: string;
  time: string; 
  isActive: boolean;
  lastTakenDate: string | null;
  subscription?: ReminderSubscription;
}

export interface CreateReminderRequest {
  subscription: ReminderSubscription;
  notifyAt: string; 
  medicationId: string;
}