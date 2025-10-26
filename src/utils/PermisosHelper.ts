import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  id?: number;
  sub?: string;
}

const API_BASE = "http://localhost:8080";

// Devuelve todos los permisos del backend (sin guardarlos)
export const fetchPermisosBack = async (): Promise<string[]> => {
  const token = localStorage.getItem("jwt");
  if (!token) return [];

  const decoded = jwtDecode<JwtPayload>(token);
  const userIdent = decoded.id ?? decoded.sub;
  if (!userIdent) return [];

  try {
    const resp = await fetch(
      `${API_BASE}/usuarios/${encodeURIComponent(String(userIdent))}/permisos`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!resp.ok) return [];
    return await resp.json();
  } catch {
    return [];
  }
};
