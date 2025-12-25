import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const res = await api.get("/tenants");
        setTenants(res.data.data);
      } catch {
        setError("Failed to load tenants");
      }
    };

    loadTenants();
  }, []);

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
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id}>
                <td className="border p-2">{t.name}</td>
                <td className="border p-2">{t.subdomain}</td>
                <td className="border p-2">{t.subscription_plan}</td>
                <td className="border p-2">{t.max_users}</td>
                <td className="border p-2">{t.max_projects}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
