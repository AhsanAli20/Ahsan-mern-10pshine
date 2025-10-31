import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios'; 
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Sparkles, Trees, Mail, AlertTriangle } from 'lucide-react';

// 💡 CRITICAL FIX 1: useAuth hook ko import karen
import { useAuth } from '../context/AuthContext'; // Path ko adjust kar len agar zaroori ho

const LoginForm = () => {
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const [error, setError] = useState(null); 
    const [validationErrors, setValidationErrors] = useState({}); 

    const formRef = useRef(null);
    const buttonRef = useRef(null);
    const navigate = useNavigate(); 
    
    // 💡 CRITICAL FIX 2: useAuth hook se login function nikalen
    const { login } = useAuth(); 

    // --- VALIDATION LOGIC FUNCTION ---
    const validateForm = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            errors.email = 'Please enter a valid email address (e.g., user@domain.com).';
        }

        const passwordRegex = /^(?=.*[!@#$%^&*]).{8,}$/;
        if (!password || !passwordRegex.test(password)) {
            errors.password = 'Password must be at least 8 characters long and contain at least one special character.';
        } else if (password.length < 8) {
             errors.password = 'Password must be at least 8 characters long.';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return; 
        }

        setIsLoading(true);
        setError(null); 

        try {
            const response = await axios.post(
                '/api/users/login', // Endpoint check kar len
                { email, password, rememberMe }, 
                { withCredentials: true }
            );

            const userData = response.data; // Yeh woh object hai jo aapke console mein aa raha tha
            
            console.log('Login Successful:', userData);
            
            // 🚀 CRITICAL FIX 3: AuthContext ko update karen
            // Yeh function user data ko save karega aur isAuthenticated ko TRUE set karega.
            await login(userData); 
            
            // 4. Navigation: AuthContext update hone ke baad user ko dashboard par bhej den
            navigate('/dashboard', { replace: true }); 

        } catch (err) {
            console.error("Login Failed:", err.response?.data?.message || err.message);
            const errorMessage = err.response?.data?.message || 'Login failed due to a network error.';
            setError(errorMessage); 
            
            setShake(true);
            setTimeout(() => setShake(false), 500);

        } finally {
            setIsLoading(false);
        }
    };

    // ... (Particle Effect useEffect remains the same) ...
    useEffect(() => {
        const container = document.querySelector('.particles-container'); 
        if (container) { 
            container.innerHTML = ''; 
            const createParticle = () => {
                const particle = document.createElement('div');
                particle.className = 'absolute rounded-full bg-white/30';
                particle.style.width = `${Math.random() * 3 + 1}px`;
                particle.style.height = particle.style.width;
                particle.style.left = `${Math.random() * 100}vw`;
                particle.style.top = `${Math.random() * 100}vh`;
                particle.style.animation = `float ${Math.random() * 20 + 10}s linear infinite`;
                container.appendChild(particle);
            };
            for (let i = 0; i < 50; i++) {
                createParticle();
            }
        }
    }, []);

    return (
        // ... (Return JSX is unchanged, it was only the logic above that needed fixing) ...
        <div className="min-h-screen flex items-center justify-center bg-deep-purple-bg relative overflow-hidden">
            {/* ... (Background elements) ... */}
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

            {/* MAIN LOGIN CARD */}
            <div 
                ref={formRef}
                className={`w-full max-w-md p-8 rounded-3xl shadow-2xl backdrop-blur-xl bg-white/10 border border-white/20 z-10 
                            transition-all duration-500 hover:shadow-[0_0_60px_rgba(167,139,250,0.3)]
                            ${shake ? 'animate-shake' : ''}`}
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                }}
            >
                {/* ... (Header) ... */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <User className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-2 tracking-tight bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                        Welcome Back
                    </h2>
                    <p className="text-white/70 text-lg">Sign in to your account</p>
                </div>
                
                {/* Error Display: Server error */}
                {error && (
                    <div className="text-sm text-red-300 bg-red-900/40 p-3 rounded-lg mb-6 border border-red-500 flex items-center animate-fade-in transition-all">
                        <AlertTriangle className='w-4 h-4 mr-2' />
                        <span className='font-semibold'>Login Error:</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* EMAIL FIELD WITH VALIDATION ERROR */}
                    <div className="group">
                        <label className="text-white/80 text-sm font-medium mb-2 block">Email Address</label>
                        <div className={`flex items-center bg-white/15 rounded-xl p-4 transition-all duration-300 group-hover:bg-white/20
                            ${validationErrors.email ? 'ring-2 ring-red-500' : 'focus-within:ring-2 focus-within:ring-purple-400 focus-within:bg-white/20'}`}>
                            <Mail className={`w-5 h-5 mr-3 transition-colors duration-300 ${validationErrors.email ? 'text-red-300' : 'text-white/70 group-focus-within:text-purple-300'}`} />
                            <input
                                type="email" 
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setValidationErrors(prev => ({...prev, email: null})) }}
                                required
                                className="w-full bg-transparent text-white placeholder-white/60 focus:outline-none text-lg"
                            />
                        </div>
                        {/* Error message */}
                        {validationErrors.email && (
                            <p className="mt-2 text-sm text-red-400 flex items-center">
                                <AlertTriangle className='w-3 h-3 mr-1' /> {validationErrors.email}
                            </p>
                        )}
                    </div>

                    {/* PASSWORD FIELD WITH VALIDATION ERROR */}
                    <div className="group">
                        <label className="text-white/80 text-sm font-medium mb-2 block">Password</label>
                        <div className={`flex items-center bg-white/15 rounded-xl p-4 transition-all duration-300 group-hover:bg-white/20
                            ${validationErrors.password ? 'ring-2 ring-red-500' : 'focus-within:ring-2 focus-within:ring-purple-400 focus-within:bg-white/20'}`}>
                            <Lock className={`w-5 h-5 mr-3 transition-colors duration-300 ${validationErrors.password ? 'text-red-300' : 'text-white/70 group-focus-within:text-purple-300'}`} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setValidationErrors(prev => ({...prev, password: null})) }}
                                required
                                className="w-full bg-transparent text-white placeholder-white/60 focus:outline-none text-lg pr-12"
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-white/70 hover:text-white transition-colors duration-200 p-1"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {/* Error message */}
                        {validationErrors.password && (
                            <p className="mt-2 text-sm text-red-400 flex items-center">
                                <AlertTriangle className='w-3 h-3 mr-1' /> {validationErrors.password}
                            </p>
                        )}
                    </div>
                    
                    {/* Remember Me and Forgot Password */}
                    <div className="flex justify-between items-center">
                        <label className="flex items-center text-white/90 cursor-pointer group">
                            <div className={`relative w-5 h-5 rounded border-2 transition-all duration-200 ${
                                rememberMe 
                                    ? 'bg-purple-500 border-purple-500' 
                                    : 'border-white/50 group-hover:border-white'
                            }`}>
                                {rememberMe && (
                                    <div className="absolute inset-0.5 bg-white rounded-sm animate-ping-once"></div>
                                )}
                            </div>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="absolute opacity-0"
                            />
                            <span className="ml-3 text-sm">Remember me</span>
                        </label>

                        {/* FORGOT PASSWORD FUNCTIONALITY (using Link) */}
                        <Link 
                            to="/forgot-password" 
                            className="text-white/70 hover:text-purple-300 transition-colors duration-200 text-sm font-medium"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {/* ANIMATED LOGIN BUTTON */}
                    <button
                        ref={buttonRef}
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg rounded-xl shadow-lg 
                                        hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                                        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group
                                        ${isLoading ? 'cursor-wait' : ''}`}
                    >
                        <span className={`relative z-10 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                            Login
                        </span>
                        
                        {/* Loading Animation */}
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        
                        {/* Button Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    </button>
                </form>
                
                {/* REGISTER SECTION */}
                <div className="mt-8 text-center">
                    <div className="relative mb-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 text-white/50 bg-transparent">New here?</span>
                        </div>
                    </div>
                    
                    <Link 
                        to="/register" 
                        className="inline-block px-6 py-2 border-2 border-white/30 text-white rounded-full font-medium 
                                        hover:bg-white/10 hover:border-white/50 transition-all duration-300 transform hover:scale-105"
                    >
                        Create Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;