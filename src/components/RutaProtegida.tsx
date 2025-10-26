import React from "react";
import { Navigate } from "react-router-dom";
import { usePermisos } from "../context/PermisosContext";

interface RutaProtegidaProps {
  permiso: string;
  children: React.ReactNode;
}

const RutaProtegida = ({ permiso, children }: RutaProtegidaProps) => {
  const { cargando, tienePermiso } = usePermisos();

  if (cargando) return null; // o spinner
  if (!tienePermiso(permiso)) return <Navigate to="/perfil" replace />;

  return <>{children}</>;
};

export default RutaProtegida;
