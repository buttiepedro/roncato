import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx";
import { use, useEffect, useState } from "react";



export default function SideBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className="flex flex-col items-center bg-white text-black-700 shadow-2xl h-full">
      {/* <!-- Side Nav Bar--> */}
      <div className="h-16 flex items-center w-full">
        {/* <!-- Logo Section --> */}
        <a className="h-6 w-6 mx-auto" href="">
          <img
            className="h-6 w-6 mx-auto"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5FdSsJISAvA0gTSe_cFoGHvppOa3bMgV_mQ&s"
            alt="svelte logo"
          />
        </a>
      </div>

      <ul>
        {/* <!-- Items Section --> */}
        {/* Link a Tablero Kanban */}
        <li className="hover:bg-gray-100 relative group">
          <Link to="/kanban" className="h-16 px-6 flex justify-center items-center w-full focus:text-orange-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="black" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122" />
            </svg>
          </Link>
          <span className={`absolute left-15 top-5 bg-blue-500 rounded-2xl px-5 text-white shadow-gray-500 shadow-xs opacity-0 transition-opacity duration-500 group-hover:opacity-100`}>Tablero</span>
          <span className={`absolute left-0 top-0 h-full w-1 bg-blue-500 transition-opacity ${location.pathname === '/kanban' ? 'opacity-100' : 'opacity-0'}`}></span>
        </li>
        {/* Link a Administracion de usuario*/}
        <li className="hover:bg-gray-100 relative group">
          <Link to="/admin" className="h-16 px-6 flex justify-center items-center w-full focus:text-orange-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="black" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            <span className={`absolute left-15 top-5 bg-blue-500 rounded-2xl px-5 text-white shadow-gray-500 shadow-xs opacity-0 transition-opacity duration-500 group-hover:opacity-100`}>Administración</span>
            <span className={`absolute left-0 top-0 h-full w-1 bg-blue-500 transition-opacity ${location.pathname === '/admin' ? 'opacity-100' : 'opacity-0'}`}></span>
          </Link>
        </li>
      </ul>

      <div className="mt-auto h-16 flex items-center w-full">
        {/* <!-- Action Section --> */}
        <button className="h-16 mx-auto flex justify-center items-center w-full focus:text-orange-500 hover:bg-red-200 focus:outline-none cursor-pointer"
        onClick={handleLogout}
        >
          <svg
            className="h-5 w-5 text-red-700"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </aside>
  )
}