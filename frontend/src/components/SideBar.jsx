import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function SideBar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Definimos los items para calcular el índice fácilmente
  const menuItems = [
    { path: "/kanban", label: "Tablero", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122" />
      </svg>
    )},
    { path: "/admin", label: "Administración", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    )},
  ];

  // 2. Encontramos el índice actual basado en la ruta
  const activeIndex = menuItems.findIndex(item => item.path === location.pathname);
  const ITEM_HEIGHT = 64; // Corresponde a h-16 (16 * 4px)

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className="flex flex-col items-center bg-white text-black-700 shadow-2xl h-full w-20">
      <div className="h-16 flex items-center w-full">
        <Link className="h-6 w-6 mx-auto" to="/">
          <img
            className="h-6 w-6 mx-auto"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5FdSsJISAvA0gTSe_cFoGHvppOa3bMgV_mQ&s"
            alt="logo"
          />
        </Link>
      </div>

      {/* Contenedor relativo para la lista */}
      <ul className="relative w-full">

        {/* 3. LA LÍNEA DESLIZANTE (Se mueve según activeIndex) */}
        {activeIndex !== -1 && (
          <div 
            className="absolute z-10 left-0 w-1 bg-blue-500 transition-transform duration-300 ease-in-out"
            style={{ 
              height: `${ITEM_HEIGHT}px`, 
              transform: `translateY(${activeIndex * ITEM_HEIGHT}px)` 
            }}
          />
        )}

        {menuItems.map((item) => (
          <li key={item.path} className="hover:bg-gray-100 relative group h-16">
            <Link 
              to={item.path} 
              className={`flex justify-center items-center w-full h-full transition-colors ${
                location.pathname === item.path ? 'text-blue-600' : 'text-black'
              }`}
            >
              {item.icon}
            </Link>
            <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-blue-500 rounded-2xl px-5 py-1 text-white shadow-xs opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              {item.label}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto h-16 flex items-center w-full relative group">
        <button 
          className="h-16 mx-auto flex justify-center items-center w-full hover:bg-red-200 text-red-700 cursor-pointer"
          onClick={handleLogout}
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
        <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-red-500 rounded-2xl px-5 py-1 text-white shadow-xs opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Cerrar Sesión</span>
      </div>
    </aside>
  );
}