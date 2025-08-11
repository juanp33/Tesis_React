import React, { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import MasterPage from "../MasterPage";
import "./shared.css";
import { fetchWithAuth } from "../utils/FetchWithAuth";

interface Permiso {
  id?: number;
  nombre: string;
  descripcion: string;
}

const API_URL = "http://localhost:8080/permisos";

const PermisoCRUD: React.FC = () => {
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [form, setForm] = useState<Permiso>({ nombre: "", descripcion: "" });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    fetchPermisos();
  }, []);

  const fetchPermisos = async () => {
    try {
      const res = await fetchWithAuth(API_URL);
      if (!res.ok) throw new Error(`Error al cargar permisos: ${res.status}`);
      const lista: Permiso[] = await res.json();
      setPermisos(lista);
    } catch (err) {
      console.error(err);
      setPermisos([]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `${API_URL}/${editId}` : API_URL;
      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Error ${method}: ${res.status}`);
      // Limpiar formulario y modo edición
      setEditId(null);
      setForm({ nombre: "", descripcion: "" });
      await fetchPermisos();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (permiso: Permiso) => {
    setForm({ nombre: permiso.nombre, descripcion: permiso.descripcion });
    setEditId(permiso.id ?? null);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    try {
      const res = await fetchWithAuth(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Error DELETE: ${res.status}`);
      await fetchPermisos();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <MasterPage>
      <div>
        <h2>Gestión de Permisos</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre"
            required
          />
          <input
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Descripción"
            required
          />
          <button type="submit">{editId ? "Actualizar" : "Crear"}</button>
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setForm({ nombre: "", descripcion: "" });
              }}
              style={{ marginLeft: 8 }}
            >
              Cancelar
            </button>
          )}
        </form>

        <ul>
          {permisos.map((permiso) => (
            <li key={permiso.id}>
              <strong>{permiso.nombre}</strong> — {permiso.descripcion}
              <button onClick={() => handleEdit(permiso)} style={{ marginLeft: 12 }}>
                ✎
              </button>
              <button onClick={() => handleDelete(permiso.id)} style={{ marginLeft: 4 }}>
                🗑️
              </button>
            </li>
          ))}
        </ul>
      </div>
    </MasterPage>
  );
};

export default PermisoCRUD;
