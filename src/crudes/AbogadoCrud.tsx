import React, { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import MasterPage from "../pages/MasterPage";
import "./shared.css";
import { fetchWithAuth } from "../utils/fetchWithAuth";

interface Abogado {
  id?: number;
  nombre: string;
  apellido: string;
  ci: string;
  email: string;
}

const API_URL = "http://localhost:8080/abogados";

const AbogadoCRUD: React.FC = () => {
  const [items, setItems] = useState<Abogado[]>([]);
  const [form, setForm] = useState<Abogado>({ nombre: "", apellido: "", ci: "", email: "" });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const res = await fetchWithAuth(API_URL);
      if (!res.ok) throw new Error(`GET abog: ${res.status}`);
      setItems(await res.json());
    } catch (e) {
      console.error(e);
      setItems([]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${API_URL}/${editId}` : API_URL;
    try {
      const res = await fetchWithAuth(url, { method, body: JSON.stringify(form) });
      if (!res.ok) throw new Error(`${method} abog: ${res.status}`);
      setEditId(null);
      setForm({ nombre: "", apellido: "", ci: "", email: "" });
      await fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (a: Abogado) => {
    setForm({ nombre: a.nombre, apellido: a.apellido, ci: a.ci, email: a.email });
    setEditId(a.id ?? null);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    try {
      const res = await fetchWithAuth(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`DELETE abog: ${res.status}`);
      await fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <MasterPage>
      <h2>Abogados</h2>
      <form onSubmit={handleSubmit}>
        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required />
        <input name="apellido" value={form.apellido} onChange={handleChange} placeholder="Apellido" required />
        <input name="ci" value={form.ci} onChange={handleChange} placeholder="CI" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
        <button type="submit">{editId ? "Actualizar" : "Crear"}</button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setForm({ nombre:"",apellido:"",ci:"",email:"" }); }}>
            Cancelar
          </button>
        )}
      </form>

      <ul>
        {items.map(a => (
          <li key={a.id}>
            {a.nombre} {a.apellido} — {a.ci} — {a.email}
            <button onClick={() => startEdit(a)}>✎</button>
            <button onClick={() => handleDelete(a.id)}>🗑️</button>
          </li>
        ))}
      </ul>
    </MasterPage>
  );
};

export default AbogadoCRUD;
