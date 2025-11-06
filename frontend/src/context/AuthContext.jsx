// File: src/context/AuthContext.jsx (UPDATED)
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios'; // 💡 Import axios

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // 💡 logout function ko async banaya gaya hai aur API call add ki gayi hai.
    const logout = async () => {
        // Client side cleanup hamesha karna hai
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        
        try {
            // Server API call: Token ya session ko invalidate karen
            // Agar aapka backend cookies use karta hai, to withCredentials zaroori hai.
            await axios.post('/api/users/logout', {}, { withCredentials: true }); 
            console.log("Backend logged out successfully.");
        } catch (error) {
            console.error("Backend logout API failed (client state cleared):", error);
            // Agar API fail ho jaye, tab bhi client side data clear ho chuka hai, koi masla nahi.
        }
    };

    const login = (userData) => {
        // ... (Login logic unchanged)
        localStorage.setItem('accessToken', userData.accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            } catch (e) {
                // Agar parse fail ho toh, data clear kar den
                logout(); 
            }
        }
        setLoading(false); 
    }, []);

    if (loading) {
        return <div>Loading initial session...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};