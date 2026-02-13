import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Team = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  
  // NEW: State to store the current logged-in user info
  const [currentUser, setCurrentUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    
    // NEW: Get current user from local storage to check role
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/users', formData);
      setShowModal(false);
      setFormData({ fullName: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user');
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Members</h1>
          <p className="mt-1 text-sm text-slate-500">Manage access to your workspace.</p>
        </div>

        {/* UPDATED: Only show button if user is Admin or Super Admin */}
        {(currentUser?.role === 'tenant_admin' || currentUser?.role === 'super_admin') && (
            <button
            onClick={() => setShowModal(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
            Add Member
            </button>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-slate-200">
        <ul className="divide-y divide-slate-200">
          {users.map((user) => (
            <li key={user.id} className="px-4 py-4 sm:px-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-900">{user.full_name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>
                <div>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'tenant_admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                    {user.role === 'tenant_admin' ? 'Admin' : 'Member'}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)}></div>
            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full p-6 relative z-20">
              <h3 className="text-lg font-medium text-slate-900 mb-4">Add New Team Member</h3>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <form onSubmit={handleAddMember} className="space-y-4">
                <input
                  placeholder="Full Name"
                  required
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
                <input
                  placeholder="Email"
                  type="email"
                  required
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <input
                  placeholder="Temporary Password"
                  type="password"
                  required
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <select
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="user">Member</option>
                  <option value="tenant_admin">Admin</option>
                </select>
                <div className="mt-5 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">
                    Add
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;