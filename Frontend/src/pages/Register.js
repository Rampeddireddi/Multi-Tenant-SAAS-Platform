import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tenantName: '',
    subdomain: '',
    adminFullName: '',
    adminEmail: '',
    adminPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    // Auto-convert subdomain to lowercase/alphanumeric
    if (e.target.name === 'subdomain') {
      const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setFormData({ ...formData, subdomain: val });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/auth/register-tenant', formData);
      alert('Registration successful! Please login with your new account.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Register your Organization
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Start your 14-day free trial
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Organization Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Organization Name</label>
              <input
                name="tenantName"
                type="text"
                required
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.tenantName}
                onChange={handleChange}
              />
            </div>

            {/* Subdomain */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Workspace Subdomain</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  name="subdomain"
                  type="text"
                  required
                  className="flex-1 block w-full rounded-l-md border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                  placeholder="mycompany"
                  value={formData.subdomain}
                  onChange={handleChange}
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">
                  .saas-app.com
                </span>
              </div>
            </div>

            {/* Admin Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Admin Full Name</label>
              <input
                name="adminFullName"
                type="text"
                required
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.adminFullName}
                onChange={handleChange}
              />
            </div>

            {/* Admin Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Admin Email</label>
              <input
                name="adminEmail"
                type="email"
                required
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.adminEmail}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                name="adminPassword"
                type="password"
                required
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.adminPassword}
                onChange={handleChange}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Creating workspace...' : 'Register'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;