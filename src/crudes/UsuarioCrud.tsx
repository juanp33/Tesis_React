import React, { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import MasterPage from "../pages/MasterPage";
import "./UsuarioCRUD.css";
import { fetchWithAuth } from "../utils/FetchWithAuth";

interface Usuario {
  id?: number;
  username: string;
  password?: string; 
  email: string;
  abogadoId?: number;
}

const API_URL = "http://localhost:8080/usuarios";

const UsuarioCRUD: React.FC = () => {
  const [items, setItems] = useState<Usuario[]>([]);
  const [form, setForm] = useState<Usuario>({
    username: "",
    password: "",
    email: "",
    abogadoId: undefined,
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const res = await fetchWithAuth(API_URL);
      if (!res.ok) throw new Error(`Error GET usuarios: ${res.status}`);
      setItems(await res.json());
    } catch (e) {
      console.error(e);
      setItems([]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "abogadoId" ? Number(value) : value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `${API_URL}/${editId}` : API_URL;

      const payload = { ...form };
      if (editId && !payload.password) delete payload.password;

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Error ${method} usuario: ${res.status}`);
      setEditId(null);
      setForm({ username: "", password: "", email: "", abogadoId: undefined });
      await fetchAll();
    } catch (e) {
      console.error(e);
    }
  };

  const startEdit = (u: Usuario) => {
    setForm({
      username: u.username,
      password: "",
      email: u.email,
      abogadoId: u.abogadoId,
    });
    setEditId(u.id ?? null);
  };

  const confirmDelete = (u: Usuario) => {
    setUsuarioToDelete(u);
    setShowModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!usuarioToDelete?.id) return;
    try {
      const res = await fetchWithAuth(`${API_URL}/${usuarioToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Error DELETE usuario: ${res.status}`);
      setShowModal(false);
      setUsuarioToDelete(null);
      await fetchAll();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <MasterPage>
      <div className="usuario-container">
        <h2 className="usuario-title">Gestión de Usuarios</h2>

        <form className="usuario-form" onSubmit={handleSubmit}>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Nombre de usuario"
            required
          />

          <input
            name="password"
            type="password"
            value={form.password || ""}
            onChange={handleChange}
            placeholder="Contraseña"
            required={!editId}
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Correo electrónico"
            required
          />

          <input
            name="abogadoId"
            value={form.abogadoId ?? ""}
            onChange={handleChange}
            placeholder="ID del abogado (opcional)"
          />

          <div className="usuario-buttons">
            <button type="submit" className="btn-primary">
              {editId ? "Actualizar" : "Crear"}
            </button>
            {editId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditId(null);
                  setForm({
                    username: "",
                    password: "",
                    email: "",
                    abogadoId: undefined,
                  });
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="usuario-list">
          <h3>Listado de Usuarios</h3>
          {items.length === 0 ? (
            <p>No hay usuarios registrados.</p>
          ) : (
            <table className="usuario-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>ID Abogado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.abogadoId ?? "N/A"}</td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => startEdit(u)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => confirmDelete(u)}
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

        {showModal && usuarioToDelete && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Confirmar eliminación</h3>
              <p>¿Está seguro que desea eliminar este usuario?</p>
              <div className="modal-info">
                <p><strong>Usuario:</strong> {usuarioToDelete.username}</p>
                <p><strong>Email:</strong> {usuarioToDelete.email}</p>
                <p><strong>ID Abogado:</strong> {usuarioToDelete.abogadoId ?? "N/A"}</p>
              </div>
              <div className="modal-buttons">
                <button className="btn-danger" onClick={handleDeleteConfirmed}>
                  Eliminar
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MasterPage>
  );
};

export default UsuarioCRUD;
