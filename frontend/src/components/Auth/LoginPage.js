'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GoogleIcon, MicrosoftIcon } from '@/components/icons/SocialIcons';

const LoginPage = () => {
  const [email, setEmail] = useState('');

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const handleMicrosoftLogin = () => {
    window.location.href = 'http://localhost:5000/auth/azure';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Email submitted:', email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">SpotTalk</h1>
        </div>

        {/* Form Header */}
        <h2 className="text-lg font-bold mb-4 text-center">Sign in</h2>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
             <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              password
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Continue
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-4 text-center text-sm text-gray-600">
          New to SpotTalk?{' '}
          <Link href="/auth/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-sm text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full border border-gray-300 py-2 rounded-md flex items-center justify-center hover:bg-gray-100"
          >
            <GoogleIcon className="w-5 h-5 mr-2" />
            Continue with Google
          </button>
          <button
            onClick={handleMicrosoftLogin}
            className="w-full border border-gray-300 py-2 rounded-md flex items-center justify-center hover:bg-gray-100"
          >
            <MicrosoftIcon className="w-5 h-5 mr-2" />
            Continue with Microsoft
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
