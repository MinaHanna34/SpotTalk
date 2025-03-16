'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleIcon, MicrosoftIcon, EyeIcon, EyeOffIcon } from '@/components/icons/SocialIcons';
import { Mail, Lock, User } from 'lucide-react';

const SignUpPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();

    const checkPasswordStrength = (password) => {
        if (!password || password.length === 0) {
            return {
                score: 0,
                label: 'Enter password'
            };
        }

        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
        return {
            score,
            label: strengthLabels[score - 1] || 'Weak'
        };
    };

    const validateForm = () => {
        let tempErrors = {};

        // Username validation
        if (formData.username.length < 2 || formData.username.length > 32) {
            tempErrors.username = "Username must be between 2 and 32 characters";
        }
        if (!/^[a-z0-9._]+$/.test(formData.username)) {
            tempErrors.username = "Username can only contain lowercase letters, numbers, periods, and underscores";
        }
        if (/^[._]|[._]$/.test(formData.username)) {
            tempErrors.username = "Username cannot start or end with a period or underscore";
        }

        // Email validation
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors.email = "Email is invalid";
        }

        // Password validation
        const strength = checkPasswordStrength(formData.password);
        if (strength.score < 2) {
            tempErrors.password = "Password must contain uppercase, lowercase, numbers, and special characters";
        }

        if (formData.password !== formData.confirmPassword) {
            tempErrors.confirmPassword = "Passwords do not match";
        }

        return tempErrors;
    };

    const handleSocialLogin = (provider) => {
        if (provider === 'google') {
            window.location.href = 'http://localhost:5000/auth/google';
        } else if (provider === 'microsoft') {
            window.location.href = 'http://localhost:5000/auth/azure';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validateForm();

        if (Object.keys(formErrors).length === 0) {
            try {
                const response = await fetch('http://localhost:5000/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('user', JSON.stringify({
                        username: data.user.username,
                        id: data.user.id
                    }));
                    router.push('/map');
                } else {
                    setErrors({ ...formErrors, server: data.error });
                }
            } catch (error) {
                console.error('Signup error:', error);
                setErrors({ ...formErrors, server: 'An unexpected error occurred' });
            }
        } else {
            setErrors(formErrors);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md px-4">
                <div className="bg-white p-8 rounded-lg shadow-lg w-full">
                    <h2 className="text-4xl font-bold mb-1 text-center text-gray-800">Canbyr</h2>
                    <p className="text-gray-600 mb-6 text-center text-sm">Create your account</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            {errors.username && <p className="text-sm text-red-600 mt-1">{errors.username}</p>}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOffIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={toggleConfirmPasswordVisibility}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOffIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>}
                        </div>

                        {errors.server && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                                {errors.server}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                        >
                            Sign Up
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleSocialLogin('google')}
                                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <GoogleIcon className="h-5 w-5 mr-2" />
                                Google
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSocialLogin('microsoft')}
                                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <MicrosoftIcon className="h-5 w-5 mr-2" />
                                Microsoft
                            </button>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
