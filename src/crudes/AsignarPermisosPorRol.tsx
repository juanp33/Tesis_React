import React, { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import MasterPage from "../pages/MasterPage";
import "./AsignarPermisosPorRol.css";

interface Rol {
  id: number;
  nombre: string;
}

interface Permiso {
  id: number;
  nombre: string;
}

interface RolPermiso {
  id: number;
  permiso: Permiso;
}

const ROLES_URL = "http://localhost:8080/api/roles";
const PERMISOS_URL = "http://localhost:8080/permisos";
const ROLPER_URL = "http://localhost:8080/api/rolPermisos";

const AsignarPermisosARol: React.FC = () => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [rolSel, setRolSel] = useState<number | "">("");
  const [permSel, setPermSel] = useState<number[]>([]);
  const [msg, setMsg] = useState<string>("");
  const [cargandoPermisos, setCargandoPermisos] = useState(false); // ⬅️ nuevo estado

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

  // 🔹 Cargar roles y permisos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [rolesData, permisosData] = await Promise.all([
          fetchWithAuth(ROLES_URL),
          fetchWithAuth(PERMISOS_URL),
        ]);
        setRoles(rolesData);
        setPermisos(permisosData);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };
    cargarDatos();
  }, []);

  // 🔹 Cargar permisos del rol seleccionado
  const onRolChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const idRol = e.target.value === "" ? "" : +e.target.value;
    setRolSel(idRol);
    setPermSel([]);
    setMsg("");

    if (idRol === "") return;

    setCargandoPermisos(true); // ⬅️ activa loading
    try {
      const lista: RolPermiso[] = await fetchWithAuth(`${ROLPER_URL}/porRol/${idRol}`);
      const permisosIds = lista.map((rp) => rp.permiso.id);
      setPermSel(permisosIds);
      setMsg(`✅ Permisos cargados para el rol seleccionado.`);
    } catch (err) {
      console.error(err);
      setMsg("⚠️ No se pudieron cargar los permisos del rol.");
    } finally {
      setCargandoPermisos(false); // ⬅️ desactiva loading
    }
  };

  // 🔹 Manejo de checkboxes
  const onPermChange = (permisoId: number, checked: boolean) => {
    setPermSel((prev) =>
      checked ? [...prev, permisoId] : prev.filter((id) => id !== permisoId)
    );
  };

  // 🔹 Guardar cambios
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg("");

    if (rolSel === "") {
      setMsg("⚠️ Debe seleccionar un rol antes de guardar.");
      return;
    }

    if (permSel.length === 0) {
      setMsg("⚠️ No se puede dejar el rol sin permisos. Marque al menos uno.");
      return;
    }

    try {
      // 🔹 1. Eliminar los permisos anteriores
      await fetchWithAuth(`${ROLPER_URL}/porRol/${rolSel}`, { method: "DELETE" });

      // 🔹 2. Crear los nuevos
      await Promise.all(
        permSel.map((id) =>
          fetchWithAuth(ROLPER_URL, {
            method: "POST",
            body: JSON.stringify({
              rol: { id: rolSel },
              permiso: { id },
            }),
          })
        )
      );

      setMsg("✅ Permisos actualizados correctamente.");
    } catch (err) {
      console.error(err);
      setMsg("❌ Error al actualizar permisos.");
    }
  };

  return (
    <MasterPage>
      <div className="asignar-permisos-container">
        <h2>Asignar Permisos a un Rol</h2>

        <form onSubmit={onSubmit} className="asignar-permisos-form">
          {/* Rol */}
          <label className="asignar-permisos-label">
            Rol:
            <select value={rolSel} onChange={onRolChange} required>
              <option value="">-- Seleccione un rol --</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </label>

          {/* Permisos */}
          <div className="asignar-permisos-lista">
            <span className="asignar-permisos-label">Permisos:</span>
            <div className="asignar-permisos-checkboxes">
              {permisos.map((p) => (
                <label key={p.id} className="permiso-item">
                  <input
                    type="checkbox"
                    checked={permSel.includes(p.id)}
                    onChange={(e) => onPermChange(p.id, e.target.checked)}
                    disabled={cargandoPermisos} // ⬅️ bloquea mientras carga
                  />
                  <span>{p.nombre}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Botón de guardar */}
          <button type="submit" disabled={cargandoPermisos}>
            {cargandoPermisos ? "Cargando permisos..." : "Guardar Cambios"}
          </button>
        </form>

        {msg && <p className="asignar-permisos-mensaje">{msg}</p>}
      </div>
    </MasterPage>
  );
};

export default AsignarPermisosARol;
