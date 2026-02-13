import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import Context Hook

const NavItem = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-600'
      }`}
    >
      <div className="mr-3 flex-shrink-0 h-6 w-6 text-indigo-300">
        {icon}
      </div>
      {label}
    </Link>
  );
};

const Layout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // USE CONTEXT instead of local state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout(); // Call context logout
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* 1. MOBILE HEADER */}
      <div className="md:hidden fixed w-full bg-indigo-700 text-white z-20 flex justify-between items-center p-4 shadow-md">
        <span className="font-bold text-lg">SaaS App</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* 2. SIDEBAR NAVIGATION */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-indigo-700 transition-transform duration-300 ease-in-out transform
        md:relative md:translate-x-0 md:flex md:flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full bg-indigo-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-4 mb-6 justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="text-white font-bold text-lg tracking-wide">SaaS App</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-indigo-200 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {/* Navigation Links */}
            <nav className="mt-5 flex-1 px-2 space-y-1 flex flex-col h-full">
              <div>
                  <NavItem 
                    to="/dashboard" 
                    label="Dashboard" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} 
                  />
                  
                  {/* Regular User / Tenant Admin Links */}
                  {user.role !== 'super_admin' && (
                    <>
                      <NavItem 
                        to="/projects" 
                        label="Projects" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>} 
                      />
                      <NavItem 
                        to="/users" 
                        label="Team Members" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} 
                      />
                    </>
                  )}

                  {/* Super Admin Links - Only Header remains if needed, but redundant link is gone */}
                  {user.role === 'super_admin' && (
                    <div className="mt-8 mb-2 px-3 text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                       System Admin
                    </div>
                  )}
              </div>
              
              {/* Settings Link */}
              <div className="pt-4 mt-auto border-t border-indigo-800">
                <NavItem 
                    to="/profile" 
                    label="Settings" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} 
                />
              </div>

            </nav>
          </div>
          
          {/* User Profile / Logout Section */}
          <div className="flex-shrink-0 flex bg-indigo-800 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <span className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div className="ml-3 w-full">
                <p className="text-sm font-medium text-white">
                  {user.full_name}
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-xs font-medium text-indigo-200 truncate" style={{maxWidth: '120px'}}>
                    {user.email}
                  </p>
                  <button 
                    onClick={handleLogout}
                    className="text-xs text-indigo-300 hover:text-white"
                    title="Sign Out"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* 4. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden pt-16 md:pt-0">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;