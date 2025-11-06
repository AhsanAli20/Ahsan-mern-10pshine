import React, { useState, useRef, useEffect } from 'react';
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

    const [validationErrors, setValidationErrors] = useState({});

    const formRef = useRef(null);
    const navigate = useNavigate();

    const validateAll = () => {
        const errors = {};
        let isValid = true;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[!@#$%^&*]).{8,}$/;

        if (!formData.fullName.trim()) {
            errors.fullName = 'Full Name is required.';
            isValid = false;
        } else if (formData.fullName.length < 3) {
            errors.fullName = 'Full Name must be at least 3 characters.';
            isValid = false;
        }

        if (!formData.email.trim() || !emailRegex.test(formData.email)) {
            errors.email = 'Please enter a valid email address.';
            isValid = false;
        }

        if (!formData.password || !passwordRegex.test(formData.password)) {
            errors.password = 'Password must be at least 8 characters with one special character.';
            isValid = false;
        }

        if (!formData.confirmPassword.trim()) {
            errors.confirmPassword = 'Confirm Password is required.';
            isValid = false;
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match.';
            isValid = false;
        }

        if (!agreeTerms) {
            errors.agreeTerms = 'You must agree to the Terms and Privacy Policy.';
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

        if (name === 'password' || name === 'confirmPassword') {
            const newFormData = { ...formData, [name]: value };
            if (newFormData.password === newFormData.confirmPassword && newFormData.confirmPassword.length > 0) {
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
        if (/[!@#$%^&*]/.test(password)) strength += 1;
        setPasswordStrength(strength);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setShake(false);

        if (!validateAll()) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setError('Please correct the errors before submitting.');
            return;
        }

        setIsLoading(true);

        try {
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

            navigate('/login');

        } catch (err) {
            console.error("Registration Failed:", err.response?.data?.message || err.message);
            const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMessage);

            setShake(true);
            setTimeout(() => setShake(false), 500);

        } finally {
            setIsLoading(false);
        }
    };

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

    return (
        // ULTRA COMPACT CONTAINER
        <div className="h-screen flex items-center justify-center bg-deep-purple-bg relative overflow-hidden p-3">

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

            {/* ULTRA COMPACT REGISTER CARD */}
            <div
                ref={formRef}
                className={`w-full max-w-xs p-4 rounded-2xl shadow-2xl backdrop-blur-xl bg-white/10 border border-white/20 z-10 
                            transition-all duration-500 hover:shadow-[0_0_60px_rgba(167,139,250,0.3)]
                            ${shake ? 'animate-shake' : ''}`}
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                }}
            >
                {/* Ultra Compact Header */}
                <div className="text-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                        <User className="text-white w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                        Create Account
                    </h2>
                    <p className="text-white/70 text-xs">Join our community</p>
                </div>

                {error && (
                    <div className="text-xs text-red-300 bg-red-900/40 p-2 rounded mb-3 border border-red-500 flex items-center">
                        <AlertTriangle className='w-3 h-3 mr-1' />
                        <span className='font-semibold'>Error:</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">

                    {/* FULL NAME - ULTRA COMPACT */}
                    <div className="group">
                        <label className="text-white/80 text-xs font-medium mb-1 block">Full Name</label>
                        <div className={`flex items-center bg-white/15 rounded-lg p-2 transition-all duration-300
                            ${validationErrors.fullName ? 'ring-1 ring-red-500' : 'focus-within:ring-1 focus-within:ring-purple-400'}`}>
                            <User className={`w-3 h-3 mr-2 ${validationErrors.fullName ? 'text-red-300' : 'text-white/70'}`} />
                            <input
                                id="fullName"
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                className="w-full bg-transparent text-white placeholder-white/60 focus:outline-none text-xs"
                            />
                        </div>
                        {validationErrors.fullName && (
                            <p className="mt-1 text-red-400 text-xs flex items-center"><XCircle className="w-2 h-2 mr-1" />{validationErrors.fullName}</p>
                        )}
                    </div>

                    {/* EMAIL - ULTRA COMPACT */}
                    <div className="group">
                        <label className="text-white/80 text-xs font-medium mb-1 block">Email</label>
                        <div className={`flex items-center bg-white/15 rounded-lg p-2 transition-all duration-300
                            ${validationErrors.email ? 'ring-1 ring-red-500' : 'focus-within:ring-1 focus-within:ring-purple-400'}`}>
                            <Mail className={`w-3 h-3 mr-2 ${validationErrors.email ? 'text-red-300' : 'text-white/70'}`} />
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-transparent text-white placeholder-white/60 focus:outline-none text-xs"
                            />
                        </div>
                        {validationErrors.email && (
                            <p className="mt-1 text-red-400 text-xs flex items-center"><XCircle className="w-2 h-2 mr-1" />{validationErrors.email}</p>
                        )}
                    </div>

                    {/* PASSWORD - ULTRA COMPACT */}
                    <div className="group">
                        <label className="text-white/80 text-xs font-medium mb-1 block">Password</label>
                        <div className={`flex items-center bg-white/15 rounded-lg p-2 transition-all duration-300
                            ${validationErrors.password ? 'ring-1 ring-red-500' : 'focus-within:ring-1 focus-within:ring-purple-400'}`}>
                            <Lock className={`w-3 h-3 mr-2 ${validationErrors.password ? 'text-red-300' : 'text-white/70'}`} />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full bg-transparent text-white placeholder-white/60 focus:outline-none text-xs pr-6"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-white/70 hover:text-white transition-colors duration-200"
                            >
                                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                        </div>
                        {validationErrors.password && (
                            <p className="mt-1 text-red-400 text-xs flex items-center"><XCircle className="w-2 h-2 mr-1" />{validationErrors.password}</p>
                        )}
                        {/* Mini Password Strength */}
                        {formData.password && (
                            <div className="mt-1">
                                <div className="flex justify-between text-xs text-white/70 mb-0.5">
                                    <span>Strength</span>
                                    <span className={`
                                        ${passwordStrength >= 4 ? 'text-green-400' :
                                            passwordStrength >= 3 ? 'text-yellow-400' :
                                                passwordStrength >= 2 ? 'text-orange-400' :
                                                    'text-red-400'}
                                    `}>
                                        {getPasswordStrengthText()}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-600 rounded-full h-1">
                                    <div
                                        className={`h-1 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CONFIRM PASSWORD - ULTRA COMPACT */}
                    <div className="group">
                        <label className="text-white/80 text-xs font-medium mb-1 block">Confirm Password</label>
                        <div className={`flex items-center bg-white/15 rounded-lg p-2 transition-all duration-300
                            ${validationErrors.confirmPassword ? 'ring-1 ring-red-500' : 'focus-within:ring-1 focus-within:ring-purple-400'}`}>
                            <Lock className={`w-3 h-3 mr-2 ${validationErrors.confirmPassword ? 'text-red-300' : 'text-white/70'}`} />
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full bg-transparent text-white placeholder-white/60 focus:outline-none text-xs pr-6"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="text-white/70 hover:text-white transition-colors duration-200"
                            >
                                {showConfirmPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                        </div>
                        {validationErrors.confirmPassword && (
                            <p className="mt-1 text-red-400 text-xs flex items-center"><XCircle className="w-2 h-2 mr-1" />{validationErrors.confirmPassword}</p>
                        )}
                        {/* Mini Password Match */}
                        {formData.confirmPassword && (
                            <div className={`flex items-center mt-1 text-xs ${formData.password === formData.confirmPassword ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {formData.password === formData.confirmPassword ? (
                                    <>
                                        <CheckCircle className="w-2 h-2 mr-1" />
                                        <span>Match</span>
                                    </>
                                ) : (
                                    <span>No match</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* TERMS - ULTRA COMPACT */}
                    <div className="flex items-start space-x-1">
                        <label className="flex items-start text-white/90 cursor-pointer group text-xs">
                            <div className={`relative w-3 h-3 rounded border transition-all duration-200 mt-0.5 ${agreeTerms
                                    ? 'bg-purple-500 border-purple-500'
                                    : (validationErrors.agreeTerms ? 'border-red-500' : 'border-white/50')
                                }`}>
                                <input
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) => {
                                        setAgreeTerms(e.target.checked);
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
                                    <CheckCircle className="absolute inset-0 w-3 h-3 text-white p-0.5" />
                                )}
                            </div>
                            <span className="ml-1 text-white/80">
                                I agree to <a href="#" className="text-purple-300 underline">Terms</a> & <a href="#" className="text-purple-300 underline">Privacy</a>
                            </span>
                        </label>
                    </div>
                    {validationErrors.agreeTerms && (
                        <p className="text-red-400 text-xs flex items-center">
                            <AlertTriangle className="w-2 h-2 mr-1" /> Required
                        </p>
                    )}

                    {/* ULTRA COMPACT REGISTER BUTTON */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-xs rounded-lg shadow-lg 
                                     hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                                     disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group
                                    ${isLoading ? 'cursor-wait' : ''}`}
                    >
                        <span className={`relative z-10 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                            Create Account
                        </span>

                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </button>
                </form>

                {/* ULTRA COMPACT LOGIN LINK */}
                <div className="mt-4 text-center">
                    <div className="relative mb-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 text-white/50 bg-transparent">Have account?</span>
                        </div>
                    </div>

                    <Link
                        to="/login"
                        className="inline-block px-3 py-1 border border-white/30 text-white rounded-full text-xs font-medium 
                                     hover:bg-white/10 transition-all duration-300"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;