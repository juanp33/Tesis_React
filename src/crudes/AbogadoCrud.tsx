import React, { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import MasterPage from "../pages/MasterPage";
import "./AbogadoCRUD.css";
import { fetchWithAuth } from "../utils/FetchWithAuth";

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
  const [form, setForm] = useState<Abogado>({
    nombre: "",
    apellido: "",
    ci: "",
    email: "",
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [errorCI, setErrorCI] = useState<string>("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const res = await fetchWithAuth(API_URL);
      if (!res.ok) throw new Error(`Error GET abogados: ${res.status}`);
      setItems(await res.json());
    } catch (err) {
      console.error(err);
      setItems([]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "ci") {
      const clean = value.replace(/\D/g, "");
      if (!clean) {
        setErrorCI("");
        return;
      }
      if (validateUruguayanCI(clean)) {
        setErrorCI("");
      } else {
        setErrorCI("Cédula uruguaya inválida");
      }
    }
  };

  const validateUruguayanCI = (ci: string): boolean => {
    let digits = ci.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 8) return false;
    if (digits.length === 7) digits = "0" + digits;

    const nums = digits.split("").map(Number);
    const checkDigit = nums[7];
    const multipliers = [2, 9, 8, 7, 6, 3, 4];
    const sum = multipliers.reduce((acc, m, i) => acc + m * nums[i], 0);
    const mod = sum % 10;
    const expected = mod === 0 ? 0 : 10 - mod;
    return checkDigit === expected;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateUruguayanCI(form.ci)) {
      setErrorCI("Debe ingresar una cédula uruguaya válida");
      return;
    }

    const method = editId ? "PUT" : "POST";
    const url = editId ? `${API_URL}/${editId}` : API_URL;

    try {
      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`${method} abogados: ${res.status}`);

      setEditId(null);
      setForm({ nombre: "", apellido: "", ci: "", email: "" });
      setErrorCI("");
      await fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (a: Abogado) => {
    setForm({
      nombre: a.nombre,
      apellido: a.apellido,
      ci: a.ci,
      email: a.email,
    });
    setEditId(a.id ?? null);
    setErrorCI("");
  };

  return (
    <MasterPage>
      <div className="abogado-container">
        <h2 className="abogado-title">Gestión de Abogados</h2>

        <form className="abogado-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre"
              required
            />
            <input
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              placeholder="Apellido"
              required
            />
          </div>

          <div className="input-group">
            <div className="input-with-error">
              <input
                name="ci"
                value={form.ci}
                onChange={handleChange}
                placeholder="Cédula uruguaya"
                required
                className={errorCI ? "input-error" : ""}
              />
              {errorCI && <p className="error-text">{errorCI}</p>}
            </div>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Correo electrónico"
              required
            />
          </div>

          <div className="abogado-buttons">
            <button type="submit" className="btn-primary">
              {editId ? "Actualizar" : "Crear"}
            </button>
            {editId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditId(null);
                  setForm({ nombre: "", apellido: "", ci: "", email: "" });
                  setErrorCI("");
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="abogado-list">
          <h3>Listado de Abogados</h3>
          {items.length === 0 ? (
            <p>No hay abogados registrados.</p>
          ) : (
            <table className="abogado-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>CI</th>
                  <th>Email</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id}>
                    <td>{a.nombre}</td>
                    <td>{a.apellido}</td>
                    <td>{a.ci}</td>
                    <td>{a.email}</td>
                    <td>
                      <button className="btn-edit" onClick={() => startEdit(a)}>
                        Editar
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

export default AbogadoCRUD;
