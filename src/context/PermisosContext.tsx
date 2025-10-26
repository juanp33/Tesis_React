import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  id?: number;
  sub?: string;
}

interface PermisosContextType {
  permisos: string[];
  cargando: boolean;
  tienePermiso: (nombre: string) => boolean;
  refrescarPermisos: () => Promise<void>;
}

const PermisosContext = createContext<PermisosContextType>({
  permisos: [],
  cargando: true,
  tienePermiso: () => false,
  refrescarPermisos: async () => {},
});

const API_BASE = "http://localhost:8080";

export const PermisosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permisos, setPermisos] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);

  const fetchPermisos = async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        setCargando(false);
        return;
      }

      const decoded = jwtDecode<JwtPayload>(token);
      const userIdent = decoded.id ?? decoded.sub;
      if (!userIdent) {
        setCargando(false);
        return;
      }

      const resp = await fetch(
        `${API_BASE}/usuarios/${encodeURIComponent(String(userIdent))}/permisos`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!resp.ok) throw new Error("Error al obtener permisos");
      const data = await resp.json();

      setPermisos(data || []);
    } catch (e) {
      console.error("Error cargando permisos:", e);
      setPermisos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchPermisos();
  }, []);

  const tienePermiso = (nombre: string): boolean =>
    permisos.some(
      (p) => p.trim().toLowerCase() === nombre.trim().toLowerCase()
    );

  return (
    <PermisosContext.Provider
      value={{ permisos, cargando, tienePermiso, refrescarPermisos: fetchPermisos }}
    >
      {children}
    </PermisosContext.Provider>
  );
};

export const usePermisos = () => useContext(PermisosContext);
