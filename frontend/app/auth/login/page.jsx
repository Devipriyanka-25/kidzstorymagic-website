'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/utils/store';
import { validateEmail } from '@/utils/helpers';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  
  // Form state with role selection
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer', // Default role
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form data including role
  const validate = () => {
    const newErrors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission with role-based redirect
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      // Login with email, password, and role
      await login({ 
        email: formData.email, 
        password: formData.password,
        role: formData.role,
      });
      
      // Redirect based on role
      const redirectPath = formData.role === 'admin' ? '/admin-dashboard' : '/dashboard';
      router.push(redirectPath);
    } catch (error) {
      setGeneralError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Branding Section */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl p-12 flex flex-col items-center justify-center min-h-96">
            <div className="flex flex-col items-center space-y-8">
              {/* Logo */}
              <div className="relative w-32 h-32 bg-white rounded-xl p-3 shadow-lg">
                <Image
                  src="/logo.png"
                  alt="Story Magic Logo"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Title and Subtitle */}
              <div className="text-center">
                <h2 className="text-3xl font-black text-white mb-2">Story Magic</h2>
                <p className="text-blue-100 text-sm">AI-Powered Stories for Kids</p>
              </div>
              
              {/* QR Code */}
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <Image
                  src="/qrcode.png"
                  alt="QR Code"
                  width={150}
                  height={150}
                  className="w-36 h-36 object-contain"
                />
              </div>
            </div>
          </div>

          {/* Right: Login Form with Role Selection */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Sign In
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Welcome back! Sign in to your account
            </p>

            {/* General Error Alert */}
            {generalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{generalError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="you@example.com"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Role Selection Section - NEW FEATURE */}
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  👥 Select Your Role
                </label>
                
                {/* Role Options - Radio Buttons */}
                <div className="space-y-2">
                  {/* Customer Role Option */}
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                    style={{
                      borderColor: formData.role === 'customer' ? '#3B82F6' : '#D1D5DB',
                      backgroundColor: formData.role === 'customer' ? '#EFF6FF' : 'transparent',
                    }}>
                    <input
                      type="radio"
                      name="role"
                      value="customer"
                      checked={formData.role === 'customer'}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                    />
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">👶 Customer</p>
                      <p className="text-xs text-gray-500">Create and manage stories for kids</p>
                    </div>
                  </label>

                  {/* Admin Role Option */}
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors"
                    style={{
                      borderColor: formData.role === 'admin' ? '#A855F7' : '#D1D5DB',
                      backgroundColor: formData.role === 'admin' ? '#FAF5FF' : 'transparent',
                    }}>
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={formData.role === 'admin'}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-4 h-4 text-purple-600 cursor-pointer"
                    />
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">⚙️ Admin</p>
                      <p className="text-xs text-gray-500">Manage platform and analytics</p>
                    </div>
                  </label>
                </div>

                {errors.role && (
                  <p className="text-red-600 text-xs mt-2">{errors.role}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <span className="ml-2">Remember me</span>
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-blue-600 font-semibold hover:underline">
                Sign up here
              </Link>
            </p>

            {/* Demo Credentials */}
            <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-900 font-semibold mb-2">
                Demo Credentials:
              </p>
              <p className="text-xs text-blue-800">
                Email: demo@example.com
                <br />
                Password: Demo@123456
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
