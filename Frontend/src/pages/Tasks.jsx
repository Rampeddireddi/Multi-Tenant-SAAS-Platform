import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { getUser } from "../auth/auth";

export default function Tasks() {
  const { projectId } = useParams();
  const user = getUser();

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  // Load tasks for this project
  const loadTasks = async () => {
    try {
      const res = await api.get(`/tasks?projectId=${projectId}`);
      setTasks(res.data.data);
    } catch {
      setError("Failed to load tasks");
    }
  };

  // Create task (tenant admin only)
  const createTask = async () => {
    if (!title) {
      setError("Task title is required");
      return;
    }

    try {
      await api.post("/tasks", {
        projectId,
        title,
        description,
      });

      setTitle("");
      setDescription("");
      setError("");

      loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    }
  };

  // Update task status (tenant admin only)
  const updateStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      loadTasks();
    } catch {
      alert("Failed to update task");
    }
  };

  useEffect(() => {
    if (projectId) {
      loadTasks();
    }
  }, [projectId]);

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Project Details</h1>

        {error && <p className="text-red-600 mb-3">{error}</p>}

        {/* Create task (Tenant Admin only) */}
        {user.role === "tenant_admin" && (
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
              placeholder="Task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button
              onClick={createTask}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Create Task
            </button>
          </div>
        )}

        {/* Tasks list */}
        {tasks.length > 0 ? (
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Title</th>
                <th className="border p-2">Status</th>
                {user.role === "tenant_admin" && (
                  <th className="border p-2">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td className="border p-2">{t.title}</td>
                  <td className="border p-2">{t.status}</td>

                  {user.role === "tenant_admin" && (
                    <td className="border p-2">
                      {t.status !== "completed" && (
                        <button
                          onClick={() => updateStatus(t.id, "completed")}
                          className="text-blue-600"
                        >
                          Mark Complete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600">No tasks found for this project</p>
        )}
      </div>
    </>
  );
}
