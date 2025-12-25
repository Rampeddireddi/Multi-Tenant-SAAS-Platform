import { useEffect, useState } from "react";
import api from "../api/api";
import { getUser } from "../auth/auth";
const user = getUser();
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const loadProjects = async () => {
    const res = await api.get("/projects");
    setProjects(res.data.data);
  };

  const createProject = async () => {
    if (!name) return;
    await api.post("/projects", { name, description });
    setName("");
    setDescription("");
    loadProjects();
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Projects</h1>
        
        <div className="flex gap-2 mb-4">
        {user.role === "tenant_admin" && (
          <>
          <input
            className="border p-2"
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border p-2"
            placeholder="Project Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          
          <button
            onClick={createProject}
            className="bg-green-600 text-white px-4 py-2 rounded mb-4"
          >
            Add Project
          </button>
          </>
        )}

        </div>

        <ul>
         {projects.map((p) => (
  <div
    key={p.id}
    className="border p-3 mb-2 cursor-pointer hover:bg-gray-100"
    onClick={() => navigate(`/projects/${p.id}`)}
  >
    <h3 className="font-semibold">{p.name}</h3>
    <p className="text-sm text-gray-600">{p.description}</p>
  </div>
))}
        </ul>
      </div>
    </>
  );
}
        