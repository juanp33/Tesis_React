import React from "react";
import { Navigate } from "react-router-dom";
import { usePermisos } from "../context/PermisosContext";

interface RequirePermisoProps {
  nombre: string;
  children: React.ReactNode;
}

export const RequirePermiso: React.FC<RequirePermisoProps> = ({ nombre, children }) => {
  const { cargando, tienePermiso } = usePermisos();

  if (cargando) return null; // o spinner global si querés
  if (!tienePermiso(nombre)) return <Navigate to="/403" replace />;

  return <>{children}</>;
};
