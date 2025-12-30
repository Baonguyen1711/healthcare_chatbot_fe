export interface Medication {
    userId: string;
    medId: string;
    name: string;
    dosage: string;
    timeTaken: string; 
    isTakenWithFood: boolean;
    hasTakenToday?: boolean;
}

export interface CreateMedicationRequestProps {
    name: string;
    dosage: string;
    timeTaken: string; 
    isTakenWithFood: boolean;
}
