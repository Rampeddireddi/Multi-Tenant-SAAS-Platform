import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const StatusBadge = ({ status }) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
    completed: 'bg-blue-100 text-blue-800',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status] || colors.active}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({ name: '', description: '', status: 'active' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/projects', formData);
      setShowModal(false);
      setFormData({ name: '', description: '', status: 'active' });
      fetchProjects(); 
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your organization's projects and track progress.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Project
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-lg">
        <label htmlFor="search" className="sr-only">Search</label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            name="search"
            id="search"
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
          <h3 className="mt-2 text-sm font-medium text-slate-900">No projects found</h3>
          <p className="mt-1 text-sm text-slate-500">Get started by creating a new project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const totalTasks = parseInt(project.task_count || 0);
            const completedTasks = parseInt(project.completed_task_count || 0);
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <div key={project.id} className="bg-white overflow-hidden shadow rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                <Link to={`/projects/${project.id}`} className="block h-full hover:bg-slate-50 transition-colors">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg leading-6 font-medium text-slate-900 truncate">
                        {project.name}
                      </h3>
                      <StatusBadge status={project.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-500 h-12 line-clamp-2">
                      {project.description || "No description provided."}
                    </p>
                    <div className="mt-4">
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block text-indigo-600">
                              Tasks Progress
                            </span>
                          </div>
                          <div className="text-right">
                            {/* UPDATED: Shows "3/5" alongside "60%" */}
                            <span className="text-xs font-semibold inline-block text-indigo-600">
                              {completedTasks}/{totalTasks} ({progress}%)
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                          <div 
                            style={{ width: `${progress}%` }} 
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      Created by {project.creator_name}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-slate-900">Create New Project</h3>
                {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                <form onSubmit={handleCreate} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Project Name</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      rows={3}
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:col-start-2 sm:text-sm disabled:opacity-50"
                    >
                      {submitting ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;