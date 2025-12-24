import { MedicationScheduleItem } from "@/types/Medication/FollowSchedule";

export class FollowScheduleService {
  private readonly STORAGE_KEY = "mock_medication_db";

  async getSchedules(): Promise<MedicationScheduleItem[]> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  async addSchedule(item: Omit<MedicationScheduleItem, "id" | "isActive" | "lastTakenDate">): Promise<MedicationScheduleItem> {
    const currentList = await this.getSchedules();
    const newItem: MedicationScheduleItem = {
      ...item,
      id: crypto.randomUUID(),
      isActive: true,
      lastTakenDate: null,
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...currentList, newItem]));
    return newItem;
  }

  async markAsTaken(id: string): Promise<void> {
    const currentList = await this.getSchedules();
    const updatedList = currentList.map(item => 
      item.id === id ? { ...item, lastTakenDate: new Date().toDateString() } : item
    );
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedList));
  }

  async deleteSchedule(id: string): Promise<void> {
    const currentList = await this.getSchedules();
    const updatedList = currentList.filter(item => item.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedList));
  }

  async registerPushSubscription() {
    if (!('serviceWorker' in navigator)) return null;
    
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!publicKey) return null; 

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicKey)
      });
    }
    
    return subscription;
  }

  private urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}