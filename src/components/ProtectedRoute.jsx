import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !user.isAdmin && user.username !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
