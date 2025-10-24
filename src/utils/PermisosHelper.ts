// src/utils/PermisosHelper.ts
export const getPermisos = (): string[] => {
  try {
    const permisos = localStorage.getItem("permisos");
    return permisos ? JSON.parse(permisos) : [];
  } catch (e) {
    console.error("Error al leer permisos del localStorage:", e);
    return [];
  }
};

export const tienePermiso = (nombre: string): boolean => {
  const permisos = getPermisos();
  return permisos.some(
    (p) => p.trim().toLowerCase() === nombre.trim().toLowerCase()
  );
};
