// File: src/components/ForgotPassword.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Sparkles, Trees, AlertTriangle, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            // Backend endpoint jo reset link email karega
            const { data } = await axios.post(
                '/api/users/forgotpassword', // Ensure this matches your route
                { email }
            );

            // Backend hamesha success message bhejega, chahe user mile ya na mile (security ke liye)
            setMessage(data.message || 'Password reset link sent to your email.');

        } catch (err) {
            // Error handling (agar server side error ho, jaise email service down)
            const errMsg = err.response?.data?.message || 'An error occurred. Please try again.';
            setError(errMsg);
            
            setShake(true);
            setTimeout(() => setShake(false), 500);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-deep-purple-bg relative overflow-hidden p-4">
            {/* Background Elements - Same as Login/Register */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-deep-purple-bg to-indigo-900 animate-gradient-x"></div>
            <div className="particles-container absolute inset-0 overflow-hidden"></div>
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/40 to-transparent">
                <div className="absolute bottom-0 w-full h-20 bg-mountain-pattern opacity-20 animate-float-slow"></div>
            </div>
            <div className="absolute top-20 left-20 opacity-10 animate-bounce-slow">
                <Sparkles size={40} className="text-white" />
            </div>
            <div className="absolute bottom-40 right-20 opacity-10 animate-pulse">
                <Trees size={35} className="text-white" />
            </div>

            {/* Main Card - Same Style as Login/Register */}
            <div 
                className={`w-full max-w-sm p-6 rounded-3xl shadow-2xl backdrop-blur-xl bg-white/10 border border-white/20 z-10 
                            transition-all duration-500 hover:shadow-[0_0_60px_rgba(167,139,250,0.3)]
                            ${shake ? 'animate-shake' : ''}`}
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                }}
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <Mail className="text-white w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1 tracking-tight bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                        Forgot Password
                    </h2>
                    <p className="text-white/70 text-sm">We'll send you a reset link</p>
                </div>

                {/* Success Message */}
                {message && (
                    <div className="text-sm text-green-300 bg-green-900/40 p-3 rounded-lg mb-4 border border-green-500 flex items-center animate-fade-in transition-all">
                        <CheckCircle className='w-4 h-4 mr-2' />
                        <span className='font-semibold'>Success:</span> {message}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="text-sm text-red-300 bg-red-900/40 p-3 rounded-lg mb-4 border border-red-500 flex items-center animate-fade-in transition-all">
                        <AlertTriangle className='w-4 h-4 mr-2' />
                        <span className='font-semibold'>Error:</span> {error}
                    </div>
                )}

                <form onSubmit={submitHandler} className="space-y-4">
                    {/* Email Field */}
                    <div className="group">
                        <label className="text-white/80 text-xs font-medium mb-1 block">Email Address</label>
                        <div className="flex items-center bg-white/15 rounded-lg p-3 transition-all duration-300 group-hover:bg-white/20 focus-within:ring-2 focus-within:ring-purple-400 focus-within:bg-white/20">
                            <Mail className="w-4 h-4 mr-2 text-white/70 group-focus-within:text-purple-300 transition-colors duration-300" />
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-transparent text-white placeholder-white/60 focus:outline-none text-sm"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit" 
                        disabled={loading}
                        className={`w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm rounded-lg shadow-lg 
                                    hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group
                                    ${loading ? 'cursor-wait' : ''}`}
                    >
                        <span className={`relative z-10 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                            Send Reset Link
                        </span>
                        
                        {/* Loading Animation */}
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        
                        {/* Button Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    </button>
                </form>
                
                {/* Back to Login Link */}
                <div className="mt-6 text-center">
                    <div className="relative mb-3">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 text-white/50 bg-transparent">Remember your password?</span>
                        </div>
                    </div>
                    
                    <Link 
                        to="/login" 
                        className="inline-flex items-center px-4 py-1.5 border border-white/30 text-white rounded-full font-medium 
                                    hover:bg-white/10 hover:border-white/50 transition-all duration-300 transform hover:scale-105 text-sm"
                    >
                        <ArrowLeft className="w-3 h-3 mr-2" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;