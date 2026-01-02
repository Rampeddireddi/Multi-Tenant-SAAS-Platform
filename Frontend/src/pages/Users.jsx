import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { getUser } from "../auth/auth";

export default function Users() {
  const currentUser = getUser();

  const [users, setUsers] = useState([]);

  // create user form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // edit state
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  const loadUsers = async () => {
  try {
    const res = await api.get(
      `/tenants/${currentUser.tenantId}/users`
    );
    setUsers(res.data.data);
  } catch {
    toast.error("Failed to load users");
  }
};

  useEffect(() => {
    loadUsers();
  }, []);

  /* ---------- CREATE USER (tenant_admin only) ---------- */

  const createUser = async () => {
    if (!email || !password || !fullName) {
      toast.error("All fields are required");
      return;
    }

    try {
     await api.post(
  `/tenants/${currentUser.tenantId}/users`,
  {
    email,
    password,
    fullName,
    role: "user",
  }
);

      setEmail("");
      setPassword("");
      setFullName("");
      toast.success("User created successfully");
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
    }
  };

  /* ---------- EDIT USER ---------- */

  const startEdit = (u) => {
    setEditingId(u.id);
    setForm({
      fullName: u.full_name,
      role: u.role,
      isActive: u.is_active ? "true" : "false", // string for select
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({});
  };

  const saveEdit = async (userId) => {
    try {
      await api.put(`/users/${userId}`, {
        fullName: form.fullName,
        role:
          currentUser.role === "tenant_admin" ? form.role : undefined,
        isActive:
          currentUser.role === "tenant_admin" &&
          currentUser.userId !== userId
            ? form.isActive === "true"
            : undefined,
      });

      toast.success("User updated successfully");
      setEditingId(null);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed-note that tenant admins cannot deactivate themselves");
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Users</h1>

        {/* Create user */}
        {currentUser.role === "tenant_admin" && (
          <div className="border p-4 mb-6 rounded">
            <h2 className="font-semibold mb-2">Add User</h2>

            <div className="flex gap-2 mb-2">
              <input
                className="border p-2 flex-1"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <input
                className="border p-2 flex-1"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <input
              className="border p-2 w-full mb-2"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={createUser}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Create User
            </button>
          </div>
        )}

        {/* Users list */}
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => {
              const isSelf = currentUser.userId === u.id;
              const canEdit =
                currentUser.role === "tenant_admin" || isSelf;

              return (
                <tr key={u.id}>
                  {/* Name */}
                  <td className="border p-2">
                    {editingId === u.id ? (
                      <input
                        className="border p-1 w-full"
                        value={form.fullName}
                        onChange={(e) =>
                          setForm({ ...form, fullName: e.target.value })
                        }
                      />
                    ) : (
                      u.full_name
                    )}
                  </td>

                  <td className="border p-2">{u.email}</td>

                  {/* Role */}
                  <td className="border p-2">
                    {editingId === u.id &&
                    currentUser.role === "tenant_admin" ? (
                      <select
                        value={form.role}
                        onChange={(e) =>
                          setForm({ ...form, role: e.target.value })
                        }
                      >
                        <option value="user">User</option>
                        <option value="tenant_admin">Tenant Admin</option>
                      </select>
                    ) : (
                      u.role
                    )}
                  </td>

                  {/* Status */}
                  <td className="border p-2">
                    {editingId === u.id &&
                    currentUser.role === "tenant_admin" &&
                    !isSelf ? (
                      <select
                        value={form.isActive}
                        onChange={(e) =>
                          setForm({ ...form, isActive: e.target.value })
                        }
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    ) : u.is_active ? (
                      "Active"
                    ) : (
                      "Inactive"
                    )}
                  </td>

                  {/* Actions */}
                  <td className="border p-2">
                    {canEdit && editingId !== u.id && (
                      <button
                        onClick={() => startEdit(u)}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                    )}

                    {editingId === u.id && (
                      <>
                        <button
                          onClick={() => saveEdit(u.id)}
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
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
