import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/user/';

// 1. SIGNUP: Create new user with password
export const signupUser = async (name: string, email: string, password: string, role: string, licenseId?: string, specialization?: string) => {
    const response = await axios.post(API_URL, { 
        name, 
        email, 
        password, 
        role,
        license_id: licenseId,
        specialization: specialization
    });
    return response.data;
};

// 2. LOGIN: Verify email and password
export const loginUser = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}login/`, { email, password });
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
    }
    throw new Error("Login failed");
};

// 3. GET CURRENT USER: Used by DashboardLayout to check permissions
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        localStorage.removeItem('user'); // Clear corrupted data
        return null;
    }
};

// 4. LOGOUT: Clears only the session — app data (appointments etc.) is preserved
export const logout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
};