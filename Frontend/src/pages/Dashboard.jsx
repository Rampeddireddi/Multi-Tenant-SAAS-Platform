import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { getUser } from "../auth/auth";

export default function Dashboard() {
  const user = getUser();

  const [stats, setStats] = useState({
    projects: 0,
    users: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Projects visible to both tenant_admin & user
        const projectsRes = await api.get("/projects");

        let usersCount = 0;
        if (user.role === "tenant_admin") {
          const usersRes = await api.get("/users");
          usersCount = usersRes.data.data.length;
        }

        setStats({
          projects: projectsRes.data.data.length,
          users: usersCount,
        });
      } catch {
        // silent fail
      }
    };

    loadStats();
  }, [user.role]);

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-2 gap-4">
          <div className="border p-4 rounded">
            <h2 className="font-semibold">Projects</h2>
            <p className="text-2xl">{stats.projects}</p>
          </div>

          {user.role === "tenant_admin" && (
            <div className="border p-4 rounded">
              <h2 className="font-semibold">Users</h2>
              <p className="text-2xl">{stats.users}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
