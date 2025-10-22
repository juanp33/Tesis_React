import React, { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import MasterPage from "../pages/MasterPage";
import "./PermisosCrud.css";
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
    if (!window.confirm("¿Está seguro que desea eliminar este permiso?")) return;
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
      <div className="permiso-container">
        <h2 className="permiso-title">Gestión de Permisos</h2>

        <form className="permiso-form" onSubmit={handleSubmit}>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre del permiso"
            required
          />
          <input
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Descripción"
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
                setForm({ nombre: "", descripcion: "" });
              }}
            >
              Cancelar
            </button>
          )}
        </form>

        <div className="permiso-list">
          {permisos.length === 0 ? (
            <p className="no-data">No hay permisos registrados.</p>
          ) : (
            <table className="permiso-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {permisos.map((permiso) => (
                  <tr key={permiso.id}>
                    <td>{permiso.id}</td>
                    <td>{permiso.nombre}</td>
                    <td>{permiso.descripcion}</td>
                    <td className="actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(permiso)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(permiso.id)}
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

export default PermisoCRUD;
