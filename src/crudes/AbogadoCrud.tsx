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
  const [originalCI, setOriginalCI] = useState<string>("");
  const [errorCI, setErrorCI] = useState<string>("");
  const [errorNombre, setErrorNombre] = useState<string>("");
  const [errorApellido, setErrorApellido] = useState<string>("");

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

    if (name === "ci") verificarCedula(value);
    if (name === "nombre") validarNombre(value);
    if (name === "apellido") validarApellido(value);
  };

  const validarNombre = (nombre: string) => {
    if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(nombre)) {
      setErrorNombre("El nombre no puede contener números ni símbolos.");
    } else if (nombre.trim().length < 3) {
      setErrorNombre("El nombre debe tener al menos 3 letras.");
    } else {
      setErrorNombre("");
    }
  };

  const validarApellido = (apellido: string) => {
    if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(apellido)) {
      setErrorApellido("El apellido no puede contener números ni símbolos.");
    } else if (apellido.trim().length < 3) {
      setErrorApellido("El apellido debe tener al menos 3 letras.");
    } else {
      setErrorApellido("");
    }
  };

  const verificarCedula = (ci: string) => {
    const clean = ci.replace(/\D/g, "");
    if (!clean) {
      setErrorCI("");
      return;
    }

    if (!validateUruguayanCI(clean)) {
      setErrorCI("Cédula uruguaya inválida.");
      return;
    }

    const existe = items.some((a) => a.ci === clean && a.ci !== originalCI);
    if (existe) {
      setErrorCI("Esta cédula ya está registrada.");
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

    if (errorCI || errorNombre || errorApellido) return;

    if (!validateUruguayanCI(form.ci)) {
      setErrorCI("Debe ingresar una cédula uruguaya válida.");
      return;
    }

    const existe = items.some(
      (a) => a.ci === form.ci && a.ci !== originalCI
    );
    if (existe) {
      setErrorCI("Esta cédula ya está registrada.");
      return;
    }

    if (form.nombre.trim().length < 3 || form.apellido.trim().length < 3) {
      setErrorNombre("El nombre y apellido deben tener al menos 3 letras.");
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
      setErrorNombre("");
      setErrorApellido("");
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
    setErrorNombre("");
    setErrorApellido("");
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
              <div className="input-with-error">
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Nombre"
                  required
                  className={errorNombre ? "input-error" : ""}
                />
                {errorNombre && <p className="error-text">{errorNombre}</p>}
              </div>

              <div className="input-with-error">
                <input
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  placeholder="Apellido"
                  required
                  className={errorApellido ? "input-error" : ""}
                />
                {errorApellido && <p className="error-text">{errorApellido}</p>}
              </div>
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
                disabled={!!(errorCI || errorNombre || errorApellido)}
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
                  setErrorNombre("");
                  setErrorApellido("");
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
