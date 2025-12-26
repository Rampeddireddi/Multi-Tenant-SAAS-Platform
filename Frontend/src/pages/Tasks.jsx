import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { getUser } from "../auth/auth";
import { toast } from "react-toastify";

export default function Tasks() {
  const { projectId } = useParams();
  const currentUser = getUser();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  /* ---------- CREATE FORM ---------- */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  /* ---------- EDIT STATE ---------- */
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  /* ---------- LOAD ---------- */

  const loadTasks = async () => {
    try {
      const res = await api.get(`/tasks?projectId=${projectId}`);
      console.log("tasks response", res.data.data); 
      setTasks(res.data.data);
    } catch {
      toast.error("Failed to load tasks");
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get("/users");
      // console.log("respoonse", res.data.data);
      setUsers(res.data.data.filter((u) => u.is_active));
    } catch {}
  };

  useEffect(() => {
    loadTasks();
    if (currentUser.role === "tenant_admin") {
      loadUsers();
    }
  }, [projectId]);

  /* ---------- CREATE TASK ---------- */

  const createTask = async () => {
    if (!title) {
      toast.error("Task title is required");
      return;
    }

    try {
      await api.post(`/projects/${projectId}/tasks`, {
        title,
        description,
        priority,
        assignedTo: assignedTo || null,
        dueDate: dueDate || null,
      });

      toast.success("Task created");
      setTitle("");
      setDescription("");
      setPriority("medium");
      setAssignedTo("");
      setDueDate("");
      loadTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create task");
    }
  };

  /* ---------- EDIT TASK ---------- */

  const startEdit = (t) => {
  setEditingId(t.id);
  setForm({
    status: t.status,
    priority: t.priority,
    assignedTo: t.assignedTo || "",
    dueDate: t.dueDate ? t.dueDate.split("T")[0] : "",
  });
};

  const cancelEdit = () => {
    setEditingId(null);
    setForm({});
  };

  const saveEdit = async (taskId) => {
    try {
      await api.put(`/tasks/${taskId}`, {
        status: form.status,
        priority: form.priority,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null,
      });

      toast.success("Task updated");
      setEditingId(null);
      loadTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Project Tasks</h1>

        {/* ---------- CREATE TASK ---------- */}
        {currentUser.role === "tenant_admin" && (
          <div className="border p-4 mb-6 rounded">
            <h2 className="font-semibold mb-2">Add Task</h2>

            <input
              className="border p-2 w-full mb-2"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="border p-2 w-full mb-2"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <select
              className="border p-2 w-full mb-2"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <select
              className="border p-2 w-full mb-2"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="border p-2 w-full mb-2"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            <button
              onClick={createTask}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Create Task
            </button>
          </div>
        )}

        {/* ---------- TASK TABLE ---------- */}
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Title</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Priority</th>
              <th className="border p-2">Assigned To</th>
              <th className="border p-2">Due Date</th>
              {currentUser.role === "tenant_admin" && (
                <th className="border p-2">Action</th>
              )}
            </tr>
          </thead>

          <tbody>
            {/* {consolwe.log(tasks)} */}
            {tasks.map((t) => (
              <tr key={t.id}>
                <td className="border p-2">{t.title}</td>
          
                {/* STATUS */}
                <td className="border p-2">
                  {editingId === t.id ? (
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                    >
                      <option value="todo">Todo</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  ) : (
                    t.status
                  )}
                </td>

                {/* PRIORITY */}
                <td className="border p-2">
                  {editingId === t.id ? (
                    <select
                      value={form.priority}
                      onChange={(e) =>
                        setForm({ ...form, priority: e.target.value })
                      }
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  ) : (
                    t.priority
                  )}
                </td>

                {/* ASSIGNED TO */}
                <td className="border p-2">
                  {editingId === t.id ? (
                    <select
                      value={form.assignedTo}
                      onChange={(e) =>
                        setForm({ ...form, assignedTo: e.target.value })
                      }
                    >
                      <option value="">Unassigned</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    t.assignedToName || "—"
                  )}
                </td>

                {/* DUE DATE */}
                <td className="border p-2">
                  {editingId === t.id ? (
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) =>
                        setForm({ ...form, dueDate: e.target.value })
                      }
                    />
                  ) : t.dueDate ? (
                    new Date(t.dueDate).toLocaleDateString()
                  ) : (
                    "—"
                  )}
                 
                </td>

                {/* ACTION */}
                {currentUser.role === "tenant_admin" && (
                  <td className="border p-2">
                    {editingId !== t.id ? (
                      <button
                        onClick={() => startEdit(t)}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                    ) : (
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
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
