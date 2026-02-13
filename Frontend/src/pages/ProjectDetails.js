import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import api from '../services/api';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook for redirection
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); // State for user role check
  
  // Task Modal State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    priority: 'medium', 
    status: 'todo',
    assignedTo: '' 
  });

  const fetchData = async () => {
    try {
      const [projRes, taskRes, usersRes] = await Promise.all([
        api.get('/projects'), 
        api.get(`/projects/${id}/tasks`),
        api.get('/auth/users')
      ]);

      const foundProject = projRes.data.data.projects.find(p => p.id === id);
      setProject(foundProject);
      setTasks(taskRes.data.data.tasks);
      setUsers(usersRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Get logged-in user to check if they are admin
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      setProject({ ...project, status: newStatus });
      await api.put(`/projects/${id}`, { status: newStatus });
    } catch (err) {
      alert('Failed to update project status');
      fetchData(); 
    }
  };

  // NEW: Handle Project Deletion
  const handleProjectDelete = async () => {
    if (window.confirm('DANGER: This will delete the project and ALL its tasks. Are you sure?')) {
      try {
        await api.delete(`/projects/${id}`);
        navigate('/projects'); // Redirect to projects list
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  // ... (Task Handlers remain the same as before) ...
  const handleSaveTask = async (e) => {
    e.preventDefault();
    const payload = { ...newTask, assignedTo: newTask.assignedTo || null };
    try {
      if (editingTask) {
        await api.put(`/projects/${id}/tasks/${editingTask.id}`, payload);
      } else {
        await api.post(`/projects/${id}/tasks`, payload);
      }
      setShowTaskModal(false);
      setEditingTask(null);
      setNewTask({ title: '', priority: 'medium', status: 'todo', assignedTo: '' });
      fetchData(); 
    } catch (err) {
      alert('Failed to save task');
    }
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setNewTask({ 
      title: task.title, 
      priority: task.priority, 
      status: task.status,
      assignedTo: task.assigned_to || '' 
    });
    setShowTaskModal(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/projects/${id}/tasks/${taskId}`);
        fetchData();
      } catch (err) { alert('Failed to delete task'); }
    }
  };

  const toggleComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      await api.put(`/projects/${id}/tasks/${task.id}`, { status: newStatus });
      fetchData();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 border-b border-slate-200 pb-6">
        <Link to="/projects" className="text-sm text-indigo-600 hover:text-indigo-900 mb-2 inline-block">&larr; Back to Projects</Link>
        <div className="sm:flex sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                project.status === 'active' ? 'bg-green-100 text-green-800' :
                project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {project.status.toUpperCase()}
              </span>
            </div>
            <p className="mt-2 text-slate-500">{project.description}</p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            {/* Status Dropdown */}
            <div>
              <label className="sr-only">Project Status</label>
              <select
                value={project.status}
                onChange={handleStatusChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* NEW: Delete Button (Only for Tenant Admin) */}
            {currentUser?.role === 'tenant_admin' && (
              <button
                onClick={handleProjectDelete}
                className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none transition-colors"
              >
                Delete Project
              </button>
            )}

            <button
              onClick={() => { 
                setEditingTask(null); 
                setNewTask({ title: '', priority: 'medium', status: 'todo', assignedTo: '' }); 
                setShowTaskModal(true); 
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              New Task
            </button>
          </div>
        </div>
      </div>

      {/* Task List Section (Unchanged) */}
      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
        <h2 className="text-lg font-medium text-slate-900 mb-4">Tasks</h2>
        {tasks.length === 0 ? (
          <div className="text-center text-slate-500 py-8">No tasks yet. Create one to get started.</div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className="bg-white p-4 rounded shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center flex-1">
                  <input 
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => toggleComplete(task)}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer mr-4"
                  />
                  <div>
                    <span className={`block text-sm font-medium ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {task.title}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-2">
                      {task.assignee_name ? (
                        <span className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          Assigned to: {task.assignee_name}
                        </span>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {task.priority.toUpperCase()}
                  </span>
                  <button onClick={() => handleEditClick(task)} className="text-slate-400 hover:text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="text-slate-400 hover:text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Modal (Same as before) */}
      {showTaskModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowTaskModal(false)}></div>
            <div className="bg-white rounded-lg p-6 relative z-20 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">{editingTask ? 'Edit Task' : 'Add Task'}</h3>
              <form onSubmit={handleSaveTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input required className="w-full border border-slate-300 rounded px-3 py-2 mt-1" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assign To</label>
                  <select className="w-full border border-slate-300 rounded px-3 py-2 mt-1" value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}>
                    <option value="">Unassigned</option>
                    {users.map(u => (<option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select className="w-full border border-slate-300 rounded px-3 py-2 mt-1" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                {editingTask && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select className="w-full border border-slate-300 rounded px-3 py-2 mt-1" value={newTask.status} onChange={e => setNewTask({...newTask, status: e.target.value})}>
                      <option value="todo">Todo</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                )}
                <div className="flex justify-end space-x-3 mt-6">
                   <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-slate-700 hover:bg-slate-50 border border-slate-300 rounded">Cancel</button>
                   <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">{editingTask ? 'Save Changes' : 'Create Task'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;