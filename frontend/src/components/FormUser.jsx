import React, { useEffect, useState } from 'react';

export default function FormUser({ user, onSubmit, onCancel }) {
  const [username, setUsername] = useState(user?.username ?? '');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(user?.role === 'admin');

  useEffect(() => {
    setUsername(user?.username ?? '');
    setPassword('');
    setIsAdmin(user?.role === 'admin');
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = {
      username,
      role: isAdmin ? 'admin' : 'user',
    };
    if (password) userData.password = password;
    await onSubmit(userData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 antialiased">
      {/* Input de Usuario */}
      <div className="group">
        <label htmlFor="username" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
          Nombre de Usuario
        </label>
        <div className="relative transition-all duration-200 ">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Ej. messi.lionel"
            className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Input de Contraseña */}
      <div className="group">
        <label htmlFor="password" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
          Contraseña
        </label>
        <div className="relative transition-all duration-200 ">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!user}
            placeholder={user ? "Dejar en blanco para no cambiar" : "••••••••"}
            className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Checkbox Estilizado */}
      <div className="flex items-center p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => setIsAdmin(!isAdmin)}>
        <div className="relative flex items-center justify-center">
          <input
            id="isAdmin"
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white checked:bg-blue-600 checked:border-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <span className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
        <label htmlFor="isAdmin" className="ml-3 block text-sm font-medium text-slate-600 cursor-pointer select-none">
          ¿Tiene privilegios de Administrador?
        </label>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-8 py-2.5 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40 transition-all active:scale-95"
        >
          {user ? 'Guardar Cambios' : 'Crear Usuario'}
        </button>
      </div>
    </form>
  );
}