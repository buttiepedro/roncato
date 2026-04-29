import { Routes, Route, useLocation } from "react-router-dom"
import ProtectedRoute from "./ProtectedRoutes.jsx"
import Error404 from "../pages/Error404.jsx"
import Login from "../pages/Login.jsx"
import KanbanBoard from "../pages/KanbanBoard.jsx"
import MainLayout from "../layouts/MainLayout.jsx"
import AdminUsuarios from "../pages/AdminUsuarios.jsx"
import ProductosOperador from "../pages/ProductosOperador.jsx"
import { useAuth } from "../context/AuthContext.jsx"
import FullScreenLoader from "../components/FullScreenLoader.jsx"

export default function AppRoutes() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const hasStoredToken = Boolean(localStorage.getItem('token') || sessionStorage.getItem('token'));
  const loaderRequested = sessionStorage.getItem('showAppLoader') === '1';
  const isAuthScreen = location.pathname === '/' || location.pathname === '/login';
  const showLoader = !isAuthScreen && (
    (loading && hasStoredToken) ||
    (!loading && loaderRequested && user)
  );

  const handleLoaderFinish = () => {
    sessionStorage.removeItem('showAppLoader');
  };

  return (
    <>
      <Routes>
        <Route path="*" element={<Error404 />} />
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route element={<MainLayout />}>
          <Route element={<ProtectedRoute />}>
            <Route path="/kanban" element={<KanbanBoard />} />
            <Route path="/productos" element={<ProductosOperador />} />
          </Route>
          <Route element={<ProtectedRoute requiredRole={"admin"} />}>
            <Route path="/admin" element={<AdminUsuarios />} />
          </Route>
        </Route>
      </Routes>
      {showLoader && <FullScreenLoader onFinish={handleLoaderFinish} />}
    </>
  )
}