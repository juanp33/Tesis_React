import React, { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import MasterPage from "../pages/MasterPage";
import "./RolCrud.css";

interface Rol {
  id?: number;
  nombre: string;
}

const BASE_URL = "http://localhost:8080/api/roles";

const RolCRUD: React.FC = () => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [form, setForm] = useState<Rol>({ nombre: "" });
  const [editId, setEditId] = useState<number | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("jwt");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  // Carga inicial
  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const res = await fetch(BASE_URL, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`GET roles ${res.status}`);
      const data: Rol[] = await res.json();
      setRoles(data);
    } catch (err) {
      console.error("Error cargando roles:", err);
      setRoles([]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ nombre: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `${BASE_URL}/${editId}` : BASE_URL;
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`${method} roles ${res.status}`);
      setEditId(null);
      setForm({ nombre: "" });
      await loadRoles();
    } catch (err) {
      console.error("Error al guardar rol:", err);
    }
  };

  const startEdit = (r: Rol) => {
    setForm({ nombre: r.nombre });
    setEditId(r.id ?? null);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!window.confirm("¿Está seguro que desea eliminar este rol?")) return;
    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`DELETE roles ${res.status}`);
      await loadRoles();
    } catch (err) {
      console.error("Error al eliminar rol:", err);
    }
  };

  return (
    <MasterPage>
      <div className="roles-container">
        <h2 className="roles-title">Gestión de Roles</h2>

        <form className="roles-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre del rol"
            required
          />
          <button type="submit" className="btn-primary">
            {editId ? "Actualizar" : "Crear"}
          </button>
          {editId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditId(null);
                setForm({ nombre: "" });
              }}
            >
              Cancelar
            </button>
          )}
        </form>

        <div className="roles-list">
          {roles.length === 0 ? (
            <p className="no-data">No hay roles registrados.</p>
          ) : (
            <table className="roles-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.nombre}</td>
                    <td className="actions">
                      <button
                        className="btn-edit"
                        onClick={() => startEdit(r)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(r.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MasterPage>
  );
};

export default RolCRUD;
