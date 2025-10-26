import React from "react";
import { usePermisos } from "../context/PermisosContext";

type Props = {
  nombre: string;
  children: React.ReactNode;
};

const IfPermiso: React.FC<Props> = ({ nombre, children }) => {
  const { cargando, tienePermiso } = usePermisos();

  if (cargando) return null; // o spinner
  if (!tienePermiso(nombre)) return null;

  return <>{children}</>;
};

export default IfPermiso;
