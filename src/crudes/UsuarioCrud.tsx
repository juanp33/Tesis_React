import React, { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import MasterPage from "../MasterPage";
import "./shared.css";
import { fetchWithAuth } from "../utils/FetchWithAuth";

interface Usuario {
  id?: number;
  username: string;
  password: string;
  email: string;
  abogadoId?: number;
}

const API_URL = "http://localhost:8080/usuarios";

const UsuarioCRUD: React.FC = () => {
  const [items, setItems] = useState<Usuario[]>([]);
  const [form, setForm] = useState<Usuario>({ username: "", password: "", email: "", abogadoId: undefined });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const res = await fetchWithAuth(API_URL);
      if (!res.ok) throw new Error(`Error GET usr: ${res.status}`);
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
      const res = await fetchWithAuth(url, { method, body: JSON.stringify(form) });
      if (!res.ok) throw new Error(`Error ${method} usr: ${res.status}`);
      setEditId(null);
      setForm({ username:"", password:"", email:"", abogadoId: undefined });
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
      abogadoId: u.abogadoId 
    });
    setEditId(u.id ?? null);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    try {
      const res = await fetchWithAuth(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Error DELETE usr: ${res.status}`);
      await fetchAll();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <MasterPage>
      <h2>Usuarios</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" value={form.username} onChange={handleChange} placeholder="Usuario" required />
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Contraseña" required={!editId} />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
        <input name="abogadoId" value={form.abogadoId ?? ""} onChange={handleChange} placeholder="ID Abogado" />
        <button type="submit">{editId ? "Actualizar" : "Crear"}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ username:"",password:"",email:"",abogadoId:undefined }); }}>Cancelar</button>}
      </form>

      <ul>
        {items.map(u => (
          <li key={u.id}>
            {u.username} — {u.email} — abogado:{u.abogadoId ?? "n/a"}
            <button onClick={() => startEdit(u)}>✎</button>
            <button onClick={() => handleDelete(u.id)}>🗑️</button>
          </li>
        ))}
      </ul>
    </MasterPage>
  );
};

export default UsuarioCRUD;