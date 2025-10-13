// src/crudes/RolCRUD.tsx
import React, { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import MasterPage from "../pages/MasterPage";
import "./shared.css";

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
    if (!window.confirm("¿Eliminar este rol?")) return;
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
      <h2>Gestión de Roles</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          placeholder="Nombre del Rol"
          required
        />
        <button type="submit">{editId ? "Actualizar" : "Crear"}</button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setForm({ nombre: "" });
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      <ul>
        {roles.map((r) => (
          <li key={r.id}>
            <span>{r.nombre}</span>
            <button onClick={() => startEdit(r)}>✎</button>
            <button onClick={() => handleDelete(r.id)}>🗑️</button>
          </li>
        ))}
      </ul>
    </MasterPage>
  );
};

export default RolCRUD;
