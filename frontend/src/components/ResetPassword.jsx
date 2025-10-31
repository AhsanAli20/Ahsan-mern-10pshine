// File: src/components/ResetPassword.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // Agar aap React Router use kar rahe hain

const ResetPassword = () => {
    // 1. URL se token extract karna
    // Assuming React Router: path="/reset-password/:token"
    const { token } = useParams(); 
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            // 2. Token ko URL mein aur passwords ko body mein bhejna
            const { data } = await axios.put(
            `http://localhost:5001/api/users/resetpassword/${token}`, // Ensure this matches your route
                { password, confirmPassword }
            );

            setMessage(data.message || 'Password successfully reset!');
            setError('');

            // Optional: User ko login page par redirect karna
            setTimeout(() => {
                navigate('/login'); 
            }, 3000);

        } catch (err) {
            // Error handling (Invalid token, expired token, password mismatch, etc.)
            const errMsg = err.response?.data?.message || 'Failed to reset password. Token may be invalid or expired.';
            setError(errMsg);
            setMessage('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2>Reset Password</h2>

            {message && <div style={{ color: 'green', marginBottom: '15px' }}>{message}</div>}
            {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

            <form onSubmit={submitHandler}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>New Password</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px' }}>Confirm New Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading || !token}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: loading || !token ? 'not-allowed' : 'pointer' }}
                >
                    {loading ? 'Updating...' : 'Reset Password'}
                </button>
            </form>
            
            {!token && <div style={{ color: 'red', marginTop: '15px' }}>Missing reset token in URL.</div>}
        </div>
    );
};

export default ResetPassword;