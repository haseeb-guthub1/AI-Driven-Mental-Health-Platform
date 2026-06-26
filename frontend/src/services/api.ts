import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

export const apiService = {
    // USER & AUTH
    registerUser: (data: any) => api.post('/user/user/', data),
    
    // CLIENTS
    createClientProfile: (data: any) => api.post('/client/clients/', data),
    getClients: () => api.get('/client/clients/'),

    // COACHES
    getCoachClients: () => api.get('/coach_client/coach-clients/'),

    // AI & EMOTION
    getAIGuidance: () => api.get('/ai_guidance/ai-guidance/'),
    sendAIGuidance: (data: any) => api.post('/ai_guidance/ai-guidance/', data),

    // MANDATORY COACHING & RISK ASSESSMENT
    checkMandatoryLock: (clientId: number) => 
        api.get(`/api/ai-guidance/check-lock/?client_id=${clientId}`),
    
    assignCoachToClient: (clientId: number, coachId: number) => 
        api.post('/api/ai-guidance/assign-coach/', { client_id: clientId, coach_id: coachId }),
    
    getAvailableCoaches: () => 
        api.get('/api/ai-guidance/available-coaches/'),
    
    // APPOINTMENTS
    bookAppointment: (data: {
        coach_id: number;
        client_id: number;
        appointment_date: string;
        duration_minutes: number;
        status: string;
    }) => 
        api.post('/coach_client/appointments/', data),
};