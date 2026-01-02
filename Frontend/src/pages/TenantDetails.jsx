import { useEffect, useState } from "react";
import api from "../api/api";
import { getUser } from "../auth/auth";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";

export default function TenantDetails() {
  const user = getUser();
  const tenantId = user.tenantId;

  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    const loadTenant = async () => {
      try {
        const res = await api.get(`/tenants/${tenantId}`);
        setTenant(res.data.data);
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to load tenant"
        );
      }
    };

    loadTenant();
  }, []);

  if (!tenant) return null;

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          {tenant.name}
        </h1>

        <p className="mb-2">
          <b>Plan:</b> {tenant.subscriptionPlan}
        </p>
        <p className="mb-2">
          <b>Status:</b> {tenant.status}
        </p>

        <div className="mt-4 border p-4 rounded">
          <h2 className="font-semibold mb-2">Statistics</h2>
          <p>Total Users: {tenant.stats.totalUsers}</p>
          <p>Total Projects: {tenant.stats.totalProjects}</p>
          <p>Total Tasks: {tenant.stats.totalTasks}</p>
        </div>
      </div>
    </>
  );
}
