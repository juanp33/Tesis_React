import React, { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import MasterPage from "../pages/MasterPage";
import "./AbogadoCRUD.css";
import { fetchWithAuth } from "../utils/FetchWithAuth";

interface Abogado {
  id?: number;
  nombre: string;
  apellido: string;
  ci: string;
}

const API_URL = "http://localhost:8080/abogados";

const AbogadoCRUD: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Abogado[]>([]);
  const [form, setForm] = useState<Abogado>({
    nombre: "",
    apellido: "",
    ci: "",
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [originalCI, setOriginalCI] = useState<string>(""); // 🔹 para guardar la cédula original al editar
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
      verificarCedula(value);
    }
  };

  const verificarCedula = (ci: string) => {
    const clean = ci.replace(/\D/g, "");
    if (!clean) {
      setErrorCI("");
      return;
    }

    // Validar formato
    if (!validateUruguayanCI(clean)) {
      setErrorCI("Cédula uruguaya inválida");
      return;
    }

    // Validar duplicados solo si cambia la cédula original
    const existe = items.some(
      (a) => a.ci === clean && a.ci !== originalCI
    );

    if (existe) {
      setErrorCI("Esta cédula ya está registrada");
    } else {
      setErrorCI("");
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

    // Validar duplicado al enviar (por seguridad)
    const existe = items.some(
      (a) => a.ci === form.ci && a.ci !== originalCI
    );
    if (existe) {
      setErrorCI("Esta cédula ya está registrada");
      return;
    }

    try {
      const method = "PUT";
      const url = `${API_URL}/${editId}`;
      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`${method} abogados: ${res.status}`);

      setEditId(null);
      setForm({ nombre: "", apellido: "", ci: "" });
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
    });
    setOriginalCI(a.ci); 
    setEditId(a.id ?? null);
    setErrorCI("");
  };

  return (
    <MasterPage>
      <div className="abogado-container">
        <h2 className="abogado-title">Gestión de Abogados</h2>

        {!editId && (
          <div className="abogado-buttons">
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate("/registro")}
            >
              Crear
            </button>
          </div>
        )}

        {editId && (
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
            </div>

            <div className="abogado-buttons">
              <button
                type="submit"
                className="btn-primary"
                disabled={!!errorCI}
              >
                Actualizar
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditId(null);
                  setForm({ nombre: "", apellido: "", ci: "" });
                  setErrorCI("");
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id}>
                    <td>{a.nombre}</td>
                    <td>{a.apellido}</td>
                    <td>{a.ci}</td>
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
