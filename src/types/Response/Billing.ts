export interface BillingService {
    serviceId: string;
    serviceName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface HospitalBill {
    userId: string;
    visitId: string;
    visitDate: string;
    hospitalName: string;
    services: BillingService[];
    totalBasePrice: number;
    totalInsuranceCovered: number;
    totalPatientPay: number;
    insuranceType: string;
    note?: string;
}

export interface LatestBillResponse {
    userId: string;
    visitId: string;
    visitDate: string;
    hospitalName: string;
    services: BillingService[];
    totalBasePrice: number;
    totalInsuranceCovered: number;
    totalPatientPay: number;
    insuranceType: string;
    note?: string;
}
