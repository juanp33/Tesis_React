import React, { useEffect, useState } from "react";
import MasterPage from "../pages/MasterPage";
import "./AsignarPermisosPorRol.css"; // usamos el mismo CSS

interface Usuario {
  id: number;
  username: string;
  abogadoNombre?: string;
  abogadoApellido?: string;
}

interface Rol {
  id: number;
  nombre: string;
}

const USUARIOS_URL = "http://localhost:8080/usuarios";
const ROLES_URL = "http://localhost:8080/api/roles";

const AsignarRolesAUsuario: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [usuarioSel, setUsuarioSel] = useState<number | "">("");
  const [rolesSel, setRolesSel] = useState<number[]>([]);
  const [msg, setMsg] = useState<string>("");

  const token = localStorage.getItem("jwt");

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.status === 204 ? [] : await res.json();
  };

  // 🔹 Cargar usuarios y roles
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [usuariosData, rolesData] = await Promise.all([
          fetchWithAuth(USUARIOS_URL),
          fetchWithAuth(ROLES_URL),
        ]);
        setUsuarios(usuariosData);
        setRoles(rolesData);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setMsg("❌ Error al cargar usuarios o roles.");
      }
    };
    cargarDatos();
  }, []);

  // 🔹 Cargar roles del usuario seleccionado
  const onUsuarioChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idUsuario = e.target.value === "" ? "" : +e.target.value;
    setUsuarioSel(idUsuario);
    setRolesSel([]);

    if (idUsuario === "") return;

    try {
      const lista: Rol[] = await fetchWithAuth(`${USUARIOS_URL}/${idUsuario}/roles`);
      const rolesIds = lista.map((r) => r.id);
      setRolesSel(rolesIds);
      setMsg("✅ Roles cargados para el usuario seleccionado.");
    } catch (err) {
      console.error(err);
      setMsg("⚠️ No se pudieron cargar los roles del usuario.");
    }
  };

  // 🔹 Manejo de checkboxes
  const onRolChange = (rolId: number, checked: boolean) => {
    setRolesSel((prev) =>
      checked ? [...prev, rolId] : prev.filter((id) => id !== rolId)
    );
  };

  // 🔹 Guardar cambios
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");

    if (usuarioSel === "") {
      setMsg("⚠️ Debe seleccionar un usuario.");
      return;
    }

    try {
      await fetchWithAuth(`${USUARIOS_URL}/${usuarioSel}/roles`, {
        method: "PUT",
        body: JSON.stringify(rolesSel),
      });
      setMsg("✅ Roles actualizados correctamente.");
    } catch (err) {
      console.error(err);
      setMsg("❌ Error al actualizar roles del usuario.");
    }
  };

  return (
    <MasterPage>
      <div className="asignar-permisos-container">
        <h2>Asignar Roles a Usuario</h2>

        <form onSubmit={onSubmit} className="asignar-permisos-form">
          <label className="asignar-permisos-label">
            Usuario:
            <select value={usuarioSel} onChange={onUsuarioChange} required>
              <option value="">-- Seleccione un usuario --</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} ({u.abogadoNombre ?? ""} {u.abogadoApellido ?? ""})
                </option>
              ))}
            </select>
          </label>

          <div className="asignar-permisos-lista">
            <span className="asignar-permisos-label">Roles:</span>
            <div className="asignar-permisos-checkboxes">
              {roles.map((r) => (
                <label key={r.id} className="permiso-item">
                  <input
                    type="checkbox"
                    checked={rolesSel.includes(r.id)}
                    onChange={(e) => onRolChange(r.id, e.target.checked)}
                  />
                  <span>{r.nombre}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit">Guardar Cambios</button>
        </form>

        {msg && <p className="asignar-permisos-mensaje">{msg}</p>}
      </div>
    </MasterPage>
  );
};

export default AsignarRolesAUsuario;
