import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

// Exportar useAuth para solucionar el error de Login.jsx
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Función para procesar el token y setear el usuario
    const saveUserFromToken = (token) => {
      try {
        const decoded = jwtDecode(token);
        setUser({
          id: decoded.id,
          username: decoded.username,
          role: decoded.role,
        });
      } catch (error) {
        console.error("Error decodificando token", error);
        logout();
      }
    };

    // PERSISTENCIA: Ejecutar al cargar la web
    useEffect(() => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (token) {
        try {
          const decoded = jwtDecode(token);
          const notExpired = !decoded.exp || decoded.exp * 1000 > Date.now();
          if (notExpired) {
            saveUserFromToken(token);
            sessionStorage.setItem("showAppLoader", "1");
          } else {
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
          }
        } catch {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
        }
      }

      setLoading(false);
    }, []);

    const login = (token, rememberMe) => {
      if (rememberMe)
        localStorage.setItem("token", token);
      else
        sessionStorage.setItem("token", token);
      sessionStorage.setItem("showAppLoader", "1");
      saveUserFromToken(token);
    };

    const logout = () => {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
      sessionStorage.removeItem("showAppLoader");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};