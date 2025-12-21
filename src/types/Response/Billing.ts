export interface BillingService {
    serviceId: string;
    serviceName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface HospitalBill {
    // Primary Keys
    userId: string;
    visitId: string;

    // Visit Information
    visitDate: string;
    hospitalId: string;
    hospitalName: string;
    hospitalAddress?: string;
    doctorName?: string;
    department?: string;
    diagnosis?: string;

    // Services
    services: BillingService[];

    // Billing Summary
    totalBasePrice: number;
    totalInsuranceCovered: number;
    totalPatientPay: number;
    insuranceType: string;
    insuranceNumber?: string;

    // Payment Information
    paymentStatus?: string;
    paymentMethod?: string;
    paymentDate?: string;

    // Additional Info
    note?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface LatestBillResponse {
    // Primary Keys
    userId: string;
    visitId: string;

    // Visit Information
    visitDate: string;
    hospitalId?: string;
    hospitalName: string;
    hospitalAddress?: string;
    doctorName?: string;
    department?: string;
    diagnosis?: string;

    // Services
    services: BillingService[];

    // Billing Summary
    totalBasePrice: number;
    totalInsuranceCovered: number;
    totalPatientPay: number;
    insuranceType: string;
    insuranceNumber?: string;

    // Payment Information
    paymentStatus?: string;
    paymentMethod?: string;
    paymentDate?: string;

    // Additional Info
    note?: string;
    message?: string; // For test endpoint
}
