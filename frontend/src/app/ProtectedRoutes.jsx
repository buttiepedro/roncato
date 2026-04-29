import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ requiredRole }) => {
  const { user, loading } = useContext(AuthContext);

  // estoy previene que el componente se renderice antes de tiempo y te expulse al login
  if (loading) return null;

  if (!user) return <Navigate to="/login" />;

  // Lógica de jerarquía: Admin entra a todo
  if (user?.role === "admin") return <Outlet />;

  // Si se requiere ser Admin y no lo es
  if (requiredRole === "admin" && user.role !== "admin") {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;