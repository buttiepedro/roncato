import React, { useEffect, useState } from 'react';
import FormUser from '../components/FormUser.jsx';
import { fetchUsers, createUser, updateUser, deleteUser } from '../services/api.js';

export default function AdminUsuarios() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 5;

  const getUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Funciones de CRUD (Lógica básica)
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await deleteUser(id);
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } catch (err) {
        console.error("Error al eliminar usuario:", err);
      }
    }
  };

  const handleCreateUser = async (user) => {
    try {
      const newUser = await createUser(user);
      setUsers((prev) => {
        const next = [...prev, newUser];
        setCurrentPage(Math.ceil(next.length / USERS_PER_PAGE));
        return next;
      });
    } catch (err) {
      console.error("Error al crear usuario:", err);
    }
  };

  const handleUpdateUser = async (id, user) => {
    try {
      const updatedUser = await updateUser(id, user);
      setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
    }
  };

  const openModal = (user = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (userData) => {
    if (editingUser) {
      await handleUpdateUser(editingUser.id, userData);
    } else {
      await handleCreateUser(userData);
    }
    setIsModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans motion-safe:animate-[pageEnter_560ms_cubic-bezier(0.22,1,0.36,1)]">
      {/* Header del Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 border-l-4 border-blue-600 pl-3">
            Gestión de Usuarios
          </h1>
          <p className="text-slate-500 text-sm ml-4 mt-1">Administra los accesos al sistema</p>
        </div>
        
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 text-sm"
        >
          <span className="text-lg">+</span> Nuevo Usuario
        </button>
      </div>

      {/* Contenedor de la Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-slate-500">Usuario</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-slate-500">Rol</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-slate-500 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!loading && users.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-slate-500">
                    No hay usuarios registrados.
                  </td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-slate-500">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : (
              users.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE).map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {(user.username || '?').charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md capitalize">
                      {user.role === 'user' ? 'Operario' : user.role === 'admin' ? 'Admin' : user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openModal(user)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginacion */}
      {users.length > USERS_PER_PAGE && (
        <div className="flex items-center justify-between mt-4 px-1">
          <span className="text-sm text-slate-500">
            Página {currentPage} de {Math.ceil(users.length / USERS_PER_PAGE)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>
            {Array.from({ length: Math.ceil(users.length / USERS_PER_PAGE) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, Math.ceil(users.length / USERS_PER_PAGE)))}
              disabled={currentPage === Math.ceil(users.length / USERS_PER_PAGE)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Modal Simple (Esqueleto) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform-gpu transition-all duration-300">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h2>
            <FormUser
              user={editingUser}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsModalOpen(false);
                setEditingUser(null);
              }}
            />
            
          </div>
        </div>
      )}
    </div>
  );
}