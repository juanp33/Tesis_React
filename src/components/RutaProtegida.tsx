import React from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { tienePermiso } from "../utils/PermisosHelper";

interface RutaProtegidaProps {
  permiso: string;
  children: ReactNode;
}

const RutaProtegida = ({ permiso, children }: RutaProtegidaProps) => {
  if (tienePermiso(permiso)) {
    return <>{children}</>;
  }

  return <Navigate to="/perfil" replace />;
};

export default RutaProtegida;
