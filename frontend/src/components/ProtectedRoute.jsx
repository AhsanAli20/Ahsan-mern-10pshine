import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 👈 useAuth hook import karen

const ProtectedRoute = () => {
    // useAuth se isAuthenticated state nikalen
    const { isAuthenticated, loading } = useAuth(); 

    // Jab tak AuthContext initial check kar raha hai, tab tak kuch na karein ya loading dikhayein
    if (loading) {
        // Optional: Yahan ek chhota sa loading spinner dikha sakte hain
        return <div>Checking authentication...</div>; 
    }

    // Agar user authenticated hai (login hai)
    if (isAuthenticated) {
        return <Outlet />;
    } else {
        // Agar authenticated nahi hai, to Login page par redirect karo
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;