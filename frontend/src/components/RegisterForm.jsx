import React, { useState, useRef, useEffect } from 'react';
// Axios aur React Router ke imports shamil kiye
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Mail, Sparkles, Trees, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        username: '', 
        password: '',
        confirmPassword: '',
    });
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [error, setError] = useState(null); 
    
    // Validation errors ke liye state
    const [validationErrors, setValidationErrors] = useState({});
    
    const formRef = useRef(null);
    const navigate = useNavigate();

    // =========================================================================
    // 1. Validation Logic (Login Form ke jaise strong checks)
    // =========================================================================

    const validateAll = () => {
        const errors = {};
        let isValid = true;

        // Regex for Email: user@domain.com format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Regex for Password: Min 8 chars AND at least one special character
        const passwordRegex = /^(?=.*[!@#$%^&*]).{8,}$/; 

        // 1. Full Name Validation
        if (!formData.fullName.trim()) {
            errors.fullName = 'Full Name is required.';
            isValid = false;
        } else if (formData.fullName.length < 3) {
            errors.fullName = 'Full Name must be at least 3 characters.';
            isValid = false;
        }

        // 2. Email Validation
        if (!formData.email.trim() || !emailRegex.test(formData.email)) {
            errors.email = 'Please enter a valid email address (e.g., user@domain.com).';
            isValid = false;
        }

        // 3. Password Validation
        if (!formData.password || !passwordRegex.test(formData.password)) {
            errors.password = 'Password must be at least 8 characters long and contain at least one special character (!@#$%^&*).';
            isValid = false;
        }

        // 4. Confirm Password Validation
        if (!formData.confirmPassword.trim()) {
            errors.confirmPassword = 'Confirm Password is required.';
            isValid = false;
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match.';
            isValid = false;
        }

        // 5. Terms Validation
        if (!agreeTerms) {
            errors.agreeTerms = 'You must agree to the Terms of Service and Privacy Policy.';
            isValid = false;
        }

        setValidationErrors(errors);
        return isValid;
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Har change par us field ka error clear kar dein
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        if (name === 'password') {
            calculatePasswordStrength(value);
        }
        
        // Confirm Password ko bhi check karein agar password ya confirm password change ho
        if (name === 'password' || name === 'confirmPassword') {
            const newFormData = { ...formData, [name]: value };
            if (newFormData.password !== newFormData.confirmPassword && newFormData.confirmPassword.length > 0) {
                 // Ye sirf indicator ke liye hai, final check handleSubmit mein hoga
            } else if (newFormData.password === newFormData.confirmPassword && newFormData.confirmPassword.length > 0) {
                // Agar match ho jaye, toh confirmPassword ka error clear kar dein
                if (validationErrors.confirmPassword) {
                    setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.confirmPassword;
                        return newErrors;
                    });
                }
            }
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[!@#$%^&*]/.test(password)) strength += 1; // Special character check bhi yahan daal diya
        setPasswordStrength(strength);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setShake(false);

        // 1. Client-Side Validation (Sare fields check karein)
        if (!validateAll()) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setError('Please correct the highlighted errors before submitting.');
            return;
        }

        setIsLoading(true);

        try {
            // 2. API Call: Axios use karke POST request bheja
            const response = await axios.post(
                '/api/users/signup', 
                {
                    name: formData.fullName, 
                    email: formData.email,
                    password: formData.password,
                },
                {
                    withCredentials: true 
                }
            );
            
            // 3. Navigation: Success hone par user ko login par bhej den
            navigate('/login'); 

        } catch (err) {
            // 4. Error Handling
            console.error("Registration Failed:", err.response?.data?.message || err.message);
            const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMessage); 
            
            setShake(true);
            setTimeout(() => setShake(false), 500);

        } finally {
            setIsLoading(false);
        }
    };

    // ... (useEffect for particles and helper functions remains same) ...
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

    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case 1: return 'bg-red-500';
            case 2: return 'bg-orange-500';
            case 3: return 'bg-yellow-500';
            case 4: return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getPasswordStrengthText = () => {
        switch (passwordStrength) {
            case 1: return 'Weak';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Strong';
            default: return '';
        }
    };
    // =========================================================================
    // 2. JSX Rendering (Validation Errors Display)
    // =========================================================================

    return (
        <div className="min-h-screen flex items-center justify-center bg-deep-purple-bg relative overflow-hidden">
            
            {/* ... (Background & Aesthetics code remains same) ... */}
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

            {/* MAIN REGISTER CARD */}
            <div 
                ref={formRef}
                className={`w-full max-w-md p-8 rounded-3xl shadow-2xl backdrop-blur-xl bg-white/10 border border-white/20 z-10 
                            transition-all duration-500 hover:shadow-[0_0_60px_rgba(167,139,250,0.3)]
                            ${shake ? 'animate-shake' : ''}`}
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                }}
            >
                {/* Header with Icon */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <User className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-2 tracking-tight bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                        Create Account
                    </h2>
                    <p className="text-white/70 text-lg">Join our community today</p>
                </div>

                {/* General Server/Submit Error Display */}
                {error && (
                    <div className="text-sm text-red-300 bg-red-900/40 p-3 rounded-lg mb-6 border border-red-500 flex items-center animate-fade-in transition-all">
                        <AlertTriangle className='w-4 h-4 mr-2' />
                        <span className='font-semibold'>Error:</span> {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* FULL NAME FIELD */}
                    <div className="group">
                        <label className="text-white/80 text-sm font-medium mb-2 block">Full Name</label>
                        <div className={`flex items-center bg-white/15 rounded-xl p-4 transition-all duration-300 group-hover:bg-white/20
                            ${validationErrors.fullName ? 'ring-2 ring-red-500' : 'focus-within:ring-2 focus-within:ring-purple-400 focus-within:bg-white/20'}`}>
                            <User className={`w-5 h-5 mr-3 transition-colors duration-300 ${validationErrors.fullName ? 'text-red-300' : 'text-white/70 group-focus-within:text-purple-300'}`} />
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                className="w-full bg-transparent text-white placeholder-white/60 focus:outline-none text-lg"
                            />
                        </div>
                        {validationErrors.fullName && (
                            <p className="mt-1 text-red-400 text-xs flex items-center"><XCircle className="w-3 h-3 mr-1"/>{validationErrors.fullName}</p>
                        )}
                    </div>

                    {/* EMAIL FIELD */}
                    <div className="group">
                        <label className="text-white/80 text-sm font-medium mb-2 block">Email Address</label>
                        <div className={`flex items-center bg-white/15 rounded-xl p-4 transition-all duration-300 group-hover:bg-white/20
                            ${validationErrors.email ? 'ring-2 ring-red-500' : 'focus-within:ring-2 focus-within:ring-purple-400 focus-within:bg-white/20'}`}>
                            <Mail className={`w-5 h-5 mr-3 transition-colors duration-300 ${validationErrors.email ? 'text-red-300' : 'text-white/70 group-focus-within:text-purple-300'}`} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-transparent text-white placeholder-white/60 focus:outline-none text-lg"
                            />
                        </div>
                        {validationErrors.email && (
                            <p className="mt-1 text-red-400 text-xs flex items-center"><XCircle className="w-3 h-3 mr-1"/>{validationErrors.email}</p>
                        )}
                    </div>

                    {/* PASSWORD FIELD */}
                    <div className="group">
                        <label className="text-white/80 text-sm font-medium mb-2 block">Password</label>
                        <div className={`flex items-center bg-white/15 rounded-xl p-4 transition-all duration-300 group-hover:bg-white/20
                            ${validationErrors.password ? 'ring-2 ring-red-500' : 'focus-within:ring-2 focus-within:ring-purple-400 focus-within:bg-white/20'}`}>
                            <Lock className={`w-5 h-5 mr-3 transition-colors duration-300 ${validationErrors.password ? 'text-red-300' : 'text-white/70 group-focus-within:text-purple-300'}`} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={handleChange}
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
                        {validationErrors.password && (
                            <p className="mt-1 text-red-400 text-xs flex items-center"><XCircle className="w-3 h-3 mr-1"/>{validationErrors.password}</p>
                        )}
                        {/* Password Strength Meter */}
                        {formData.password && (
                            <div className="mt-2">
                                <div className="flex justify-between text-xs text-white/70 mb-1">
                                    <span>Password Strength</span>
                                    <span className={`
                                        ${passwordStrength >= 4 ? 'text-green-400' : 
                                        passwordStrength >= 3 ? 'text-yellow-400' : 
                                        passwordStrength >= 2 ? 'text-orange-400' : 
                                        'text-red-400'}
                                    `}>
                                        {getPasswordStrengthText()}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-600 rounded-full h-1.5">
                                    <div 
                                        className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CONFIRM PASSWORD FIELD */}
                    <div className="group">
                        <label className="text-white/80 text-sm font-medium mb-2 block">Confirm Password</label>
                        <div className={`flex items-center bg-white/15 rounded-xl p-4 transition-all duration-300 group-hover:bg-white/20
                            ${validationErrors.confirmPassword ? 'ring-2 ring-red-500' : 'focus-within:ring-2 focus-within:ring-purple-400 focus-within:bg-white/20'}`}>
                            <Lock className={`w-5 h-5 mr-3 transition-colors duration-300 ${validationErrors.confirmPassword ? 'text-red-300' : 'text-white/70 group-focus-within:text-purple-300'}`} />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full bg-transparent text-white placeholder-white/60 focus:outline-none text-lg pr-12"
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="text-white/70 hover:text-white transition-colors duration-200 p-1"
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {validationErrors.confirmPassword && (
                            <p className="mt-1 text-red-400 text-xs flex items-center"><XCircle className="w-3 h-3 mr-1"/>{validationErrors.confirmPassword}</p>
                        )}
                        {/* Password Match Indicator */}
                        {formData.confirmPassword && (
                            <div className={`flex items-center mt-2 text-sm ${
                                formData.password === formData.confirmPassword ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {formData.password === formData.confirmPassword ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        <span>Passwords match</span>
                                    </>
                                ) : (
                                    <span>Passwords do not match</span>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* TERMS AND CONDITIONS */}
                    <div className="flex items-start space-x-3">
                        <label className="flex items-start text-white/90 cursor-pointer group">
                            <div className={`relative w-5 h-5 rounded border-2 transition-all duration-200 mt-1 ${
                                agreeTerms 
                                    ? 'bg-purple-500 border-purple-500' 
                                    : (validationErrors.agreeTerms ? 'border-red-500 ring-2 ring-red-500' : 'border-white/50 group-hover:border-white')
                            }`}>
                                <input
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) => {
                                        setAgreeTerms(e.target.checked);
                                        // Terms check hone par validation error clear kar dein
                                        if (e.target.checked) {
                                            setValidationErrors(prev => {
                                                const { agreeTerms, ...rest } = prev;
                                                return rest;
                                            });
                                        }
                                    }}
                                    className="absolute opacity-0"
                                />
                                {agreeTerms && (
                                    <CheckCircle className="absolute inset-0 w-5 h-5 text-white p-0.5"/>
                                )}
                            </div>
                            <span className="ml-3 text-sm text-white/80">
                                I agree to the{' '}
                                <a href="#" className="text-purple-300 hover:text-purple-200 underline">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-purple-300 hover:text-purple-200 underline">
                                    Privacy Policy
                                </a>
                            </span>
                        </label>
                        {validationErrors.agreeTerms && (
                            <p className="text-red-400 text-xs flex items-center ml-2 mt-1">
                                <AlertTriangle className="w-3 h-3 mr-1"/> Required
                            </p>
                        )}
                    </div>

                    {/* REGISTER BUTTON */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg rounded-xl shadow-lg 
                                     hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group
                                    ${isLoading ? 'cursor-wait' : ''}`}
                    >
                        <span className={`relative z-10 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                            Create Account
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
                
                {/* LOGIN LINK SECTION */}
                <div className="mt-8 text-center">
                    <div className="relative mb-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 text-white/50 bg-transparent">Already have an account?</span>
                        </div>
                    </div>
                    
                    <Link 
                        to="/login" 
                        className="inline-block px-6 py-2 border-2 border-white/30 text-white rounded-full font-medium 
                                     hover:bg-white/10 hover:border-white/50 transition-all duration-300 transform hover:scale-105"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;