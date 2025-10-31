// File: src/services/apiClient.js

import axios from 'axios';

// ⚠️ Apni backend URL se replace karen!
const API_BASE_URL = 'http://localhost:5001/api/users'; 

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Cookies/Refresh Token ke liye zaroori
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor jo 401 (Unauthorized) error par token refresh karta hai
export const setupAuthInterceptor = (logoutFunction) => {
    const interceptorId = apiClient.interceptors.response.use(
        (response) => response, 
        async (error) => {
            const originalRequest = error.config;

            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                
                try {
                    console.log("Token expired. Attempting to refresh token...");
                    
                    // Naya access token lene ke liye call
                    const response = await axios.post(
                        `${API_BASE_URL}/users/refresh`, 
                        {},
                        { withCredentials: true } 
                    );

                    const newAccessToken = response.data.accessToken;

                    // Header update karen naye token ke saath
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    
                    // Original request ko dobara bhejen
                    return apiClient(originalRequest);

                } catch (refreshError) {
                    console.error("Refresh token failed. Logging out.");
                    logoutFunction(); // Fail hone par force logout
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );
    // Interceptor ID return karen taaki isse eject kiya ja sake (Agar zaroori ho)
    return interceptorId; 
};