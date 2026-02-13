import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext'; // <--- 1. Import Context

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // <--- 2. Get login function
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tenantSubdomain: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 3. Clean inputs (Trim spaces to avoid errors)
    const payload = {
      email: formData.email.trim(),
      password: formData.password,
      tenantSubdomain: formData.tenantSubdomain.trim()
    };

    try {
      const response = await api.post('/auth/login', payload);
      const { token, user } = response.data.data;
      
      // 4. USE CONTEXT LOGIN (Updates State + LocalStorage)
      login(token, user);
      
      // 5. Redirect based on role
      if (user.role === 'super_admin') {
        navigate('/admin/tenants');
      } else {
        navigate('/dashboard');
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visuals */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 to-purple-600/30 z-10" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        
        <div className="relative z-20 flex flex-col justify-center px-16 text-white">
          <h2 className="text-4xl font-bold mb-6 leading-tight">Manage your projects with enterprise-grade isolation.</h2>
          <p className="text-slate-400 text-lg">Secure, scalable, and designed for modern teams.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-slate-900">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-600">
              Sign in to your workspace
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="tenantSubdomain" className="block text-sm font-medium text-slate-700">Workspace Subdomain</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    id="tenantSubdomain"
                    name="tenantSubdomain"
                    type="text"
                    value={formData.tenantSubdomain}
                    onChange={handleChange}
                    className="flex-1 block w-full rounded-l-md border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                    placeholder="company (Leave blank for Super Admin)"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">
                    .saas-app.com
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
            
            <div className="text-center text-sm">
                <span className="text-slate-500">Don't have a workspace? </span>
                <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Register new tenant
                </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;