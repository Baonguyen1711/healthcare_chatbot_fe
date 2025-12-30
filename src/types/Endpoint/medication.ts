export const MEDICATION_ENDPOINTS = {
    CREATE: "/",
    GET: "/",
    DELETE: "/",
    UPDATE_TAKEN: (medId: string) => `/${medId}/taken`,
    GET_NUMBER_OF_TAKEN: `/taken`
}