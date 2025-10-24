import React, { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import MasterPage from "../pages/MasterPage";
import "./UsuarioCRUD.css";
import { fetchWithAuth } from "../utils/FetchWithAuth";

interface Usuario {
  id?: number;
  username: string;
  password?: string;
  email: string;
}

const API_URL = "http://localhost:8080/usuarios";

const UsuarioCRUD: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Usuario[]>([]);
  const [form, setForm] = useState<Usuario>({
    username: "",
    password: "",
    email: "",
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);
  const [error, setError] = useState<string>(""); // 🔹 Para mostrar errores visualmente

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
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); // Limpia errores previos

    // 🔹 Validaciones antes de enviar
    if (!form.username || form.username.length < 6) {
      setError("⚠️ El nombre de usuario debe tener al menos 6 caracteres.");
      return;
    }

    if (form.password && form.password.length < 6) {
      setError("⚠️ La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (!form.email.includes("@")) {
      setError("⚠️ El correo electrónico debe contener '@'.");
      return;
    }

    // Si no hay usuario en edición, redirige al registro
    if (!editId) {
      navigate("/registro");
      return;
    }

    try {
      const method = "PUT";
      const url = `${API_URL}/${editId}`;
      const payload = { ...form };
      if (!payload.password) delete payload.password;

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Error ${method} usuario: ${res.status}`);
      setEditId(null);
      setForm({ username: "", password: "", email: "" });
      await fetchAll();
      setError(""); // Limpia mensaje si todo sale bien
    } catch (e) {
      console.error(e);
      setError("❌ Error al actualizar el usuario.");
    }
  };

  const startEdit = (u: Usuario) => {
    setForm({
      username: u.username,
      password: "",
      email: u.email,
    });
    setEditId(u.id ?? null);
    setError("");
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

        {/* Si NO se está editando, solo muestra el botón Crear */}
        {!editId && (
          <div className="usuario-buttons">
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate("/registro")}
            >
              Crear
            </button>
          </div>
        )}

        {/* Si se está editando, muestra los cuadros para editar */}
        {editId && (
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
              placeholder="Nueva contraseña (opcional)"
            />

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Correo electrónico"
              required
            />

            {error && (
              <p style={{ color: "red", marginTop: "0.8rem" }}>{error}</p>
            )}

            <div className="usuario-buttons">
              <button type="submit" className="btn-primary">
                Actualizar
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditId(null);
                  setForm({ username: "", password: "", email: "" });
                  setError("");
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
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

        {/* Modal de confirmación */}
        {showModal && usuarioToDelete && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Confirmar eliminación</h3>
              <p>¿Está seguro que desea eliminar este usuario?</p>
              <div className="modal-info">
                <p><strong>Usuario:</strong> {usuarioToDelete.username}</p>
                <p><strong>Email:</strong> {usuarioToDelete.email}</p>
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
