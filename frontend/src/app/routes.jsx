import { Routes, Route } from "react-router-dom"
import ProtectedRoute from "./ProtectedRoutes.jsx"
import Error404 from "../pages/Error404.jsx"
import Login from "../pages/Login.jsx"
import KanbanBoard from "../pages/KanbanBoard.jsx"
import MainLayout from "../layouts/MainLayout.jsx"
import AdminUsuarios from "../pages/AdminUsuarios.jsx"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="*" element={<Error404 />} />
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route element={<MainLayout />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/kanban" element={<KanbanBoard />} />
        </Route>
        <Route element={<ProtectedRoute requiredRole={"admin"} />}>
          <Route path="/admin" element={<AdminUsuarios />} />
        </Route>
      </Route>
    </Routes>
  )
}