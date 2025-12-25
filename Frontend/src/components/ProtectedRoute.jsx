import { Navigate } from "react-router-dom";
import { getUser, isAuthenticated } from "../auth/auth";

export default function ProtectedRoute({ children, roles }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const user = getUser();

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
