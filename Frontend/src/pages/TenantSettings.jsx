import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { getUser } from "../auth/auth";

export default function TenantSettings() {
  const user = getUser();

  const [tenant, setTenant] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTenant = async () => {
    try {
      const res = await api.get("/auth/me");
      setTenant(res.data.data);
      setName(res.data.data.name);
    } catch {
      toast.error("Failed to load tenant details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenant();
  }, []);

  const updateName = async () => {
    if (!name.trim()) {
      toast.error("Company name cannot be empty");
      return;
    }

    try {
      await api.put(`/tenants/${tenant.id}`, { name });
      toast.success("Company name updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) return null;

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-xl">
        <h1 className="text-2xl font-bold mb-4">Organization Settings</h1>

        {/* Company Name (editable) */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Company Name</label>
          <input
            className="border p-2 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <button
          onClick={updateName}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
        >
          Save Changes
        </button>

        {/* Read-only info */}
        <div className="border-t pt-4">
          <p><strong>Plan:</strong> {tenant.subscription_plan}</p>
          <p><strong>Status:</strong> {tenant.status}</p>
          <p><strong>Max Users:</strong> {tenant.max_users}</p>
          <p><strong>Max Projects:</strong> {tenant.max_projects}</p>
        </div>
      </div>
    </>
  );
}
