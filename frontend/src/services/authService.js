// File: src/services/authService.js

import { apiClient } from './apiClient'; // Relative path theek rakhen!

// ---------------------------------------------------------------------
// 1. Register User (POST /api/users/signup)
// ---------------------------------------------------------------------
const register = async (name, email, password) => {
    const response = await apiClient.post('/users/signup', { name, email, password });
    return response.data;
};

// ---------------------------------------------------------------------
// 2. Login User (POST /api/users/login)
// ---------------------------------------------------------------------
const login = async (email, password, rememberMe = false) => {
    const response = await apiClient.post('/users/login', { email, password, rememberMe });
    return response.data;
};

// ---------------------------------------------------------------------
// 3. Logout User (POST /api/users/logout)
// ---------------------------------------------------------------------
const logout = async () => {
    // Is call se server cookie clear kar dega
    const response = await apiClient.post('/users/logout', {});
    return response.data;
};

// ---------------------------------------------------------------------
// 4. Forgot Password (POST /api/users/forgotpassword)
// ---------------------------------------------------------------------
const forgotPassword = async (email) => {
    const response = await apiClient.post('/users/forgotpassword', { email });
    return response.data; 
};

// ---------------------------------------------------------------------
// 5. Reset Password (PUT /api/users/resetpassword/:token)
// ---------------------------------------------------------------------
const resetPassword = async (token, password, confirmPassword) => {
    const response = await apiClient.put(`/users/resetpassword/${token}`, { 
        password, 
        confirmPassword 
    });
    return response.data; 
};

// ---------------------------------------------------------------------
// 6. Get Profile (Protected Route Example - GET /api/users/profile)
// ---------------------------------------------------------------------
const getProfile = async () => {
    // Access Token automatically Interceptor se manage ho jayega agar login ho
    const response = await apiClient.get('/users/profile');
    return response.data;
};


export const authService = {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    getProfile,
};