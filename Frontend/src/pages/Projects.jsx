import { useEffect, useState } from "react";
import api from "../api/api";
import { getUser } from "../auth/auth";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Projects() {
  const navigate = useNavigate();
  const currentUser = getUser();

  const [projects, setProjects] = useState([]);

  // create form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // edit state
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  /* ---------- LOAD PROJECTS ---------- */

  const loadProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.data);
    } catch {
      toast.error("Failed to load projects");
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  /* ---------- CREATE PROJECT ---------- */

  const createProject = async () => {
    if (!name) {
      toast.error("Project name is required");
      return;
    }

    try {
      await api.post("/projects", { name, description });
      setName("");
      setDescription("");
      toast.success("Project created");
      loadProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Create failed");
    }
  };

  /* ---------- EDIT PROJECT ---------- */

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      status: p.status,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({});
  };

  const saveEdit = async (projectId) => {
    try {
      await api.put(`/projects/${projectId}`, {
        name: form.name,
        description: form.description,
        status: form.status,
      });

      toast.success("Project updated successfully");
      setEditingId(null);
      loadProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  /* ---------- DELETE PROJECT ---------- */

  const deleteProject = async (projectId) => {
    if (!window.confirm("Delete this project? This will remove all tasks.")) {
      return;
    }

    try {
      await api.delete(`/projects/${projectId}`);
      toast.success("Project deleted");
      loadProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Projects</h1>

        {/* CREATE PROJECT */}
        {currentUser.role === "tenant_admin" && (
          <div className="border p-4 mb-6 rounded">
            <h2 className="font-semibold mb-2">Add Project</h2>

            <input
              className="border p-2 w-full mb-2"
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="border p-2 w-full mb-2"
              placeholder="Project description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button
              onClick={createProject}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Add Project
            </button>
          </div>
        )}

        {/* PROJECT LIST */}
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {projects.map((p) => {
              const canEdit =
                currentUser.role === "tenant_admin" ||
                currentUser.userId === p.created_by;

              return (
                <tr key={p.id}>
                  {/* NAME */}
                  <td className="border p-2">
                    {editingId === p.id ? (
                      <input
                        className="border p-1 w-full"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                      />
                    ) : (
                      <span
                        className="cursor-pointer text-blue-600"
                        onClick={() => navigate(`/projects/${p.id}`)}
                      >
                        {p.name}
                      </span>
                    )}
                  </td>

                  {/* DESCRIPTION */}
                  <td className="border p-2">
                    {editingId === p.id ? (
                      <input
                        className="border p-1 w-full"
                        value={form.description}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            description: e.target.value,
                          })
                        }
                      />
                    ) : (
                      p.description || "—"
                    )}
                  </td>

                  {/* STATUS */}
                  <td className="border p-2">
                    {editingId === p.id ? (
                      <select
                        value={form.status}
                        onChange={(e) =>
                          setForm({ ...form, status: e.target.value })
                        }
                      >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                      </select>
                    ) : (
                      p.status
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="border p-2">
                    {canEdit && editingId !== p.id && (
                      <>
                        <button
                          onClick={() => startEdit(p)}
                          className="text-blue-600 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProject(p.id)}
                          className="text-red-600"
                        >
                          Delete
                        </button>
                      </>
                    )}

                    {editingId === p.id && (
                      <>
                        <button
                          onClick={() => saveEdit(p.id)}
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
