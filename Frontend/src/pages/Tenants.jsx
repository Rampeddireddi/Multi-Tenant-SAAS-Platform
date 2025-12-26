import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [editingTenantId, setEditingTenantId] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  const loadTenants = async () => {
    try {
      const res = await api.get("/tenants");
      setTenants(res.data.data);
    } catch {
      setError("Failed to load tenants");
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const startEdit = (tenant) => {
    setEditingTenantId(tenant.id);
    setForm({
      name: tenant.name,
      status: tenant.status,
      subscriptionPlan: tenant.subscription_plan,
      maxUsers: tenant.max_users,
      maxProjects: tenant.max_projects,
    });
  };

  const cancelEdit = () => {
    setEditingTenantId(null);
    setForm({});
  };

  const saveEdit = async (tenantId) => {
    try {
      await api.put(`/tenants/${tenantId}`, form);
      toast.success("Tenant updated successfully");
      setEditingTenantId(null);
      loadTenants();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update tenant");
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Tenants</h1>

        {error && <p className="text-red-600 mb-3">{error}</p>}

        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Company</th>
              <th className="border p-2">Subdomain</th>
              <th className="border p-2">Plan</th>
              <th className="border p-2">Max Users</th>
              <th className="border p-2">Max Projects</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {tenants.map((t) => (
              <tr key={t.id}>
                {/* Company Name */}
                <td className="border p-2">
                  {editingTenantId === t.id ? (
                    <input
                      className="border p-1 w-full"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  ) : (
                    t.name
                  )}
                </td>

                {/* Subdomain (read-only) */}
                <td className="border p-2">{t.subdomain}</td>

                {/* Plan */}
                <td className="border p-2">
                  {editingTenantId === t.id ? (
                    <select
                      className="border p-1"
                      value={form.subscriptionPlan}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          subscriptionPlan: e.target.value,
                        })
                      }
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  ) : (
                    t.subscription_plan
                  )}
                </td>

                {/* Max Users */}
                <td className="border p-2">
                  {editingTenantId === t.id ? (
                    <input
                      type="number"
                      className="border p-1 w-20"
                      value={form.maxUsers}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          maxUsers: Number(e.target.value),
                        })
                      }
                    />
                  ) : (
                    t.max_users
                  )}
                </td>

                {/* Max Projects */}
                <td className="border p-2">
                  {editingTenantId === t.id ? (
                    <input
                      type="number"
                      className="border p-1 w-20"
                      value={form.maxProjects}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          maxProjects: Number(e.target.value),
                        })
                      }
                    />
                  ) : (
                    t.max_projects
                  )}
                </td>

                {/* Status */}
                <td className="border p-2">
                  {editingTenantId === t.id ? (
                    <select
                      className="border p-1"
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                    >
                      <option value="active">Active</option>
                      <option value="trial">Trial</option>
                      <option value="suspended">Suspended</option>

                    </select>
                  ) : (
                    t.status
                  )}
                </td>

                {/* Actions */}
                <td className="border p-2">
                  {editingTenantId === t.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(t.id)}
                        className="text-green-600 mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-600"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEdit(t)}
                      className="text-blue-600"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
