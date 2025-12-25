import { useState } from "react";
import api from "../api/api";

export default function Register() {
  const [tenantName, setTenantName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register-tenant", {
        tenantName,
        subdomain,
        adminFullName: adminName,
        adminEmail: email,
        adminPassword: password,
      });

      setMessage("Tenant registered successfully. Please login.");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded shadow w-96"
      >
        <h2 className="text-xl font-bold mb-4">Register Organization</h2>

        {message && <p className="text-green-600 mb-2">{message}</p>}
        {error && <p className="text-red-600 mb-2">{error}</p>}

        <input
          className="border p-2 w-full mb-2"
          placeholder="Company Name"
          value={tenantName}
          onChange={(e) => setTenantName(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-2"
          placeholder="Subdomain (unique)"
          value={subdomain}
          onChange={(e) => setSubdomain(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-2"
          placeholder="Admin Full Name"
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-2"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 w-full mb-4"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-blue-600 text-white w-full p-2 rounded">
          Register
        </button>

        <p className="text-sm mt-4 text-center">
          Already registered?{" "}
          <a href="/" className="text-blue-600">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
