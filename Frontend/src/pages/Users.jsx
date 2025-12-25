import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.data);
    } catch (err) {
      setError("Failed to load users");
    }
  };

  const createUser = async () => {
    if (!email || !password || !fullName) {
      setError("All fields are required");
      return;
    }

    try {
      await api.post("/users", {
        email,
        password,
        fullName,
        role: "user",
      });

      // reset form
      setEmail("");
      setPassword("");
      setFullName("");
      setError("");

      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    }
  };

  const deactivateUser = async (id) => {
    if (!window.confirm("Deactivate this user?")) return;

    try {
      await api.delete(`/users/${id}`);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Users</h1>

        {error && <p className="text-red-600 mb-3">{error}</p>}

        {/* Create user */}
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
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border p-2">{u.full_name}</td>
                <td className="border p-2">{u.email}</td>
                <td className="border p-2">{u.role}</td>
                <td className="border p-2">
                  {u.is_active ? "Active" : "Inactive"}
                </td>
                <td className="border p-2">
                  {u.is_active && (
                    <button
                      onClick={() => deactivateUser(u.id)}
                      className="text-red-600"
                    >
                      Deactivate
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
