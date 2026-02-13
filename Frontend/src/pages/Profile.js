import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, full_name: user.full_name }));
    }
  }, [user]);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    // Frontend Validation
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      return setError("New passwords do not match");
    }
    if (formData.newPassword && !formData.currentPassword) {
      return setError("Please enter your current password to set a new one.");
    }

    try {
      const payload = { full_name: formData.full_name };
      // Only send password fields if user is trying to change it
      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await api.put('/auth/profile', payload);
      
      // 1. Update Global Context (This fixes the Sidebar immediately)
      updateUser(res.data.data);
      
      setMessage('Profile updated successfully!');
      // Clear password fields
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Account Settings</h1>

      <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
        {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">{message}</div>}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={onChange}
              required
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>

          <hr className="border-slate-200" />

          {/* Password Section */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Change Password</h3>
            <p className="text-sm text-slate-500 mb-4">Leave these blank if you only want to update your name.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={onChange}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  placeholder="Required only if changing password"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={onChange}
                    minLength="6"
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={onChange}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;