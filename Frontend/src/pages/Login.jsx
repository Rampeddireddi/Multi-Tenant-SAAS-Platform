import { useState } from "react";
import api from "../api/api";
import { saveAuth } from "../auth/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantSubdomain, setTenantSubdomain] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        tenantSubdomain: tenantSubdomain || undefined,
      });

      saveAuth(res.data.data.token, res.data.data.user);
      const user = res.data.data.user;

if (user.role === "super_admin") {
  window.location.href = "/tenants";
} else {
  window.location.href = "/dashboard";
}
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-96"
      >
        <h2 className="text-xl font-bold mb-4">Login</h2>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <input
          className="border p-2 w-full mb-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 w-full mb-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-4"
          placeholder="Tenant subdomain (leave empty for super admin)"
          value={tenantSubdomain}
          onChange={(e) => setTenantSubdomain(e.target.value)}
        />

        <button className="bg-blue-600 text-white w-full p-2 rounded">
          Login
        </button>
        <p className="text-sm mt-4 text-center">
        New organization?{" "}
         <a href="/register" className="text-blue-600">
        Register here
         </a>
        </p>
      </form>
    </div>
  );
}
