import { CreateReminderRequestProps } from '@/types/Request/Reminder';
import { createItem, deleteItem, getAll, updateItem } from './base';
import { MEDICATION_ENDPOINTS } from '@/types/Endpoint/medication';
import { CreateMedicationRequestProps, Medication } from '@/types/Request/Medication';

const baseUrl = "https://294vcay8t8.execute-api.us-east-1.amazonaws.com/medications"

export class MedicationsService {
    private baseUrl: string;
    private accessToken: string;

    constructor() {
        this.baseUrl = baseUrl
        this.accessToken = (localStorage.getItem("accessToken") ?? "").replace(/\s+/g, "");
    }

    createMedication = async (data: CreateMedicationRequestProps) => {
        return createItem(this.baseUrl, MEDICATION_ENDPOINTS.CREATE, data,
            {
                token: this.accessToken
            }
        );
    };

    getMedication = async () => {
        return getAll<Medication[]>(this.baseUrl, MEDICATION_ENDPOINTS.GET,
            {
                token: this.accessToken
            }
        );
    };

    updateMedicationTaken = async (medId: string) => {
        return updateItem(this.baseUrl, MEDICATION_ENDPOINTS.UPDATE_TAKEN(medId), "",
            {
                token: this.accessToken
            }
        );
    };

    getNumberOfTaken = async () => {
        return getAll<any>(this.baseUrl, MEDICATION_ENDPOINTS.GET_NUMBER_OF_TAKEN,
            {
                token: this.accessToken
            }
        );
    }

    deleteMedication = async (id: string) => {
        return deleteItem(this.baseUrl, MEDICATION_ENDPOINTS.DELETE, id,
            {
                token: this.accessToken
            }
        );
    };

}