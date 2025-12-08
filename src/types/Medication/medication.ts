export interface MedicationTask {
  id: string;
  name: string;
  dosage: string;
  scheduledTime: string;
  status: 'pending' | 'taken' | 'skipped';
}