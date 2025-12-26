import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import Users from "./pages/Users";
import Tasks from "./pages/Tasks";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tenants from "./pages/Tenants";
import ProtectedRoute from "./components/ProtectedRoute";
import TenantSettings from "./pages/TenantSettings";

import Navbar from "./components/Navbar";

export default function App() {
  return (
<div>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
  path="/projects"
  element={
    <ProtectedRoute roles={["tenant_admin", "user"]}>
      <Projects />
    </ProtectedRoute>
  }
/>
        <Route
  path="/tenants"
  element={
    <ProtectedRoute roles={["super_admin"]}>
      <Tenants />
    </ProtectedRoute>
  }
/>
         <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute roles={["tenant_admin", "user"]}>
              <Tasks />
            </ProtectedRoute>
          }
        />
       <Route
          path="/users"
          element={
            <ProtectedRoute roles={["tenant_admin"]}>
              <Users />
            </ProtectedRoute>
          }
        />
          <Route
  path="/settings"
  element={
    <ProtectedRoute roles={["tenant_admin"]}>
      <TenantSettings />
    </ProtectedRoute>
  }
/>
        {/* <Route path="/users" element={<Users />} />
        <Route path="/tasks" element={<Tasks />} /> */}
      </Routes>
    
    </BrowserRouter>
    </div>
  );
}
