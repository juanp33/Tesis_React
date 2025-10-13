// src/crudes/AsignarPermisosARol.tsx
import React, { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import MasterPage from "../pages/MasterPage";
import "./shared.css";

interface Rol {
  id: number;
  nombre: string;
}

interface Permiso {
  id: number;
  nombre: string;
}

const ROLES_URL     = "http://localhost:8080/api/roles";
const PERMISOS_URL = "http://localhost:8080/api/permisos";
const ROLPER_URL   = "http://localhost:8080/api/rolPermisos";

const AsignarPermisosARol: React.FC = () => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [rolSel, setRolSel] = useState<number | "">("");
  const [permSel, setPermSel] = useState<number[]>([]);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    fetch(ROLES_URL)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setRoles)
      .catch(err => console.error("GET roles:", err));

    fetch(PERMISOS_URL)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setPermisos)
      .catch(err => console.error("GET permisos:", err));
  }, []);

  const onRolChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRolSel(e.target.value === "" ? "" : +e.target.value);
  };

  const onPermChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const vals = Array.from(e.target.selectedOptions, o => +o.value);
    setPermSel(vals);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (rolSel === "" || permSel.length === 0) {
      setMsg("Debes elegir un rol y al menos un permiso.");
      return;
    }

    try {
      await Promise.all(
        permSel.map(id =>
          fetch(ROLPER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              rol:    { id: rolSel },
              permiso:{ id }
            }),
          }).then(res => {
            if (!res.ok) throw new Error(res.status.toString());
          })
        )
      );
      setMsg("Permisos asignados con éxito.");
      setPermSel([]);
    } catch (err) {
      console.error(err);
      setMsg("Error al asignar permisos.");
    }
  };

  return (
    <MasterPage>
      <div className="asignar-permisos-container">
        <h2>Asignar permisos a un rol</h2>
        <form onSubmit={onSubmit} className="asignar-permisos-form">
          <label>
            Rol:
            <select value={rolSel} onChange={onRolChange} required>
              <option value="">-- Seleccione un rol --</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
          </label>

          <label>
            Permisos:
            <select
              multiple
              value={permSel.map(String)}
              onChange={onPermChange}
              required
            >
              {permisos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </label>

          <button type="submit">Asignar permisos</button>
        </form>

        {msg && <p className="asignar-permisos-mensaje">{msg}</p>}
      </div>
    </MasterPage>
  );
};

export default AsignarPermisosARol;
