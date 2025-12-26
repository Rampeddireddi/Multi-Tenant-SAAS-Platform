import { getUser, logout } from "../auth/auth";

export default function Navbar() {
  const user = getUser();
console.log(user.role);
  return (
    <div className="bg-gray-800 text-white p-4 flex gap-4">
      {user?.role === "super_admin" && (
        <a href="/tenants">Tenants</a>
      )}
      

        {user?.role === "tenant_admin" && (
        <>
          <a href="/dashboard">Dashboard</a>
          <a href="/projects">Projects</a>
          <a href="/users">Users</a>
        </>
      )}

      {user?.role === "user" && (
        <>
          <a href="/dashboard">Dashboard</a>
          <a href="/projects">Projects</a>
          
        </>
      )}
      {user.role === "tenant_admin" && (
  <a href="/settings">Organization</a>
)}


      <button onClick={logout} className="ml-auto">
        Logout
      </button>
    </div>
  );
}
