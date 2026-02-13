import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const StatCard = ({ title, value, color }) => (
  <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200">
    <div className="px-4 py-5 sm:p-6">
      <dt className="text-sm font-medium text-slate-500 truncate">{title}</dt>
      <dd className={`mt-1 text-3xl font-bold ${color}`}>{value}</dd>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ totalProjects: 0, activeProjects: 0, completedProjects: 0 });
  const [myTasks, setMyTasks] = useState([]);
  const [tenants, setTenants] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // New State for Modal
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenantUsers, setTenantUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await api.get('/auth/me');
        const currentUser = meRes.data.data;
        setUser(currentUser);

        if (currentUser.role === 'super_admin') {
          const tenantRes = await api.get('/auth/tenants');
          setTenants(tenantRes.data.data || []);
        } else {
          // Regular user fetches...
          const projectsRes = await api.get('/projects');
          const projects = projectsRes.data.data.projects || [];
          setStats({
            totalProjects: projects.length,
            activeProjects: projects.filter(p => p.status === 'active').length,
            completedProjects: projects.filter(p => p.status === 'completed').length,
          });
          const tasksRes = await api.get('/tasks/my-tasks');
          setMyTasks(tasksRes.data.data || []);
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle viewing users for a tenant
  const handleViewUsers = async (tenant) => {
    setSelectedTenant(tenant);
    try {
      const res = await api.get(`/auth/tenants/${tenant.id}/users`);
      setTenantUsers(res.data.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch tenant users", error);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  // --- SUPER ADMIN VIEW ---
  if (user?.role === 'super_admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Administration</h1>
          <p className="mt-1 text-sm text-slate-500">Overview of all registered tenants.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
           <StatCard title="Total Tenants" value={tenants.length} color="text-indigo-600" />
           <StatCard title="Active Tenants" value={tenants.filter(t => t.status === 'active').length} color="text-green-600" />
           <StatCard title="Trial Tenants" value={tenants.filter(t => t.status === 'trial').length} color="text-yellow-600" />
        </div>

        {/* Tenant Table */}
        <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-700">Registered Organizations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Subdomain</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Users</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{tenant.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">{tenant.subdomain}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 uppercase">
                         {tenant.subscription_plan}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleViewUsers(tenant)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium hover:underline"
                      >
                        View Users
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* USER LIST MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-800">
                  Users at {selectedTenant?.name}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
              </div>
              
              <div className="p-6 max-h-96 overflow-y-auto">
                {tenantUsers.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No users found for this tenant.</p>
                ) : (
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr>
                        <th className="text-left text-xs font-medium text-slate-500 uppercase pb-2">Name</th>
                        <th className="text-left text-xs font-medium text-slate-500 uppercase pb-2">Email</th>
                        <th className="text-left text-xs font-medium text-slate-500 uppercase pb-2">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tenantUsers.map(u => (
                        <tr key={u.id}>
                          <td className="py-3 text-sm font-medium text-slate-900">{u.full_name}</td>
                          <td className="py-3 text-sm text-slate-500">{u.email}</td>
                          <td className="py-3 text-sm">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              u.role === 'tenant_admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                              {u.role.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              
              <div className="bg-slate-50 px-6 py-3 flex justify-end">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- REGULAR TENANT VIEW (Keep Existing) ---
  const tenant = user?.tenant || {};
  const subscriptionPlan = tenant.subscription_plan || 'free';
  const maxProjects = tenant.max_projects || 3;

  return (
    <div className="space-y-6 pb-10">
      {/* (Previous Dashboard Code for regular users remains here...) */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back, {user?.full_name}. 
          {tenant.name && <span> Organization: <strong className="text-indigo-600">{tenant.name}</strong></span>}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Projects" value={stats.totalProjects} color="text-indigo-600" />
        <StatCard title="Active Projects" value={stats.activeProjects} color="text-emerald-600" />
        <StatCard title="Completed" value={stats.completedProjects} color="text-blue-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-indigo-900 rounded-lg shadow-lg overflow-hidden p-6 flex flex-col justify-center text-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Plan: {subscriptionPlan.toUpperCase()}</h3>
            <span className="bg-indigo-800 px-3 py-1 rounded text-xs">Active</span>
          </div>
          <div className="mt-2 text-indigo-100 text-sm">Project Limit: {stats.totalProjects} / {maxProjects}</div>
          <div className="w-full bg-indigo-800 rounded-full h-3 mt-3">
             <div className="bg-indigo-400 h-3 rounded-full" style={{ width: `${Math.min((stats.totalProjects / maxProjects) * 100, 100)}%` }}></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden flex flex-col h-full">
          <div className="px-4 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800">My Active Tasks</h3>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-full">{myTasks.length} Pending</span>
          </div>
          <div className="overflow-y-auto max-h-80">
            {myTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No active tasks assigned to you.</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {myTasks.map(task => (
                  <li key={task.id} className="hover:bg-slate-50 transition-colors">
                    <Link to={`/projects/${task.project_id}`} className="block px-4 py-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-indigo-600 truncate w-2/3">{task.title}</p>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{task.priority}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;