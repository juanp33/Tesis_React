import { useEffect, useState } from "react";
import axios from "axios";
import MasterPage from "./MasterPage";
import "../styles/PerfilPage.css";
import { useNavigate } from "react-router-dom";
import MasIcon from "../assets/mas.png";

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  ci: string;
  email: string;
}

interface Usuario {
  id: number;
  username: string;
  email: string;
}

interface Abogado {
  id: number;
  nombre: string;
  apellido: string;
  ci: string;
}

const PerfilPage = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [abogado, setAbogado] = useState<Abogado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [showConfig, setShowConfig] = useState(false);

  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [abogadoForm, setAbogadoForm] = useState({
    nombre: "",
    apellido: "",
    ci: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("jwt");

  // ================== 🔹 Cargar datos ==================
  useEffect(() => {
    if (!token) {
      setError("No estás autenticado");
      setLoading(false);
      return;
    }

    // Clientes
    axios
      .get("http://localhost:8080/clientes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setClientes(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("No se pudieron cargar los clientes"))
      .finally(() => setLoading(false));

    // Usuario logueado
    axios
      .get("http://localhost:8080/api/usuario/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsuario(res.data);
        setEditForm({
          username: res.data.username,
          email: res.data.email,
          password: "",
        });
      })
      .catch(() => setError("No se pudo obtener el usuario"));

    // Abogado logueado
    axios
      .get("http://localhost:8080/abogados/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAbogado(res.data);
        setAbogadoForm({
          nombre: res.data.nombre,
          apellido: res.data.apellido,
          ci: res.data.ci,
        });
      })
      .catch(() => setError("No se pudo obtener el abogado"));
  }, []);

  // ================== 🔹 Validadores ==================
  const validarTexto = (txt: string) =>
    /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,}$/.test(txt);

  const limpiarNumeros = (txt: string) =>
    txt.replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ\s]/g, "");

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

  // ================== 🔹 Handlers ==================
  const handleChangeUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleChangeAbogado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "nombre" || name === "apellido") {
      setAbogadoForm({ ...abogadoForm, [name]: limpiarNumeros(value) });
    } else {
      setAbogadoForm({ ...abogadoForm, [name]: value });
    }
  };

  // ================== 🔹 Guardar Usuario ==================
  const handleGuardarUsuario = async () => {
    if (!usuario || !token) return;

    if (editForm.username.trim().length < 6) {
      setMensaje("⚠️ El nombre de usuario debe tener al menos 6 caracteres.");
      return;
    }
    if (!editForm.email.includes("@")) {
      setMensaje("⚠️ El correo debe tener '@'.");
      return;
    }
    // 🔴 Contraseña obligatoria y mínima 6 caracteres
    if (!editForm.password.trim() || editForm.password.trim().length < 6) {
      setMensaje("⚠️ Debe ingresar una contraseña de al menos 6 caracteres.");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:8080/usuarios/${usuario.id}`,
        {
          username: editForm.username.trim(),
          email: editForm.email.trim(),
          password: editForm.password.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        setUsuario(res.data);
        setMensaje("✅ Usuario actualizado correctamente.");
        // Limpia contraseña pero deja visible el mensaje
        setEditForm({ ...editForm, password: "" });
        setTimeout(() => setMensaje(""), 2500);
      }
    } catch {
      setMensaje("❌ Error al actualizar el usuario.");
    }
  };

  // ================== 🔹 Guardar Abogado ==================
  const handleGuardarAbogado = async () => {
    if (!abogado || !token) return;

    if (!validarTexto(abogadoForm.nombre)) {
      setMensaje("⚠️ El nombre debe tener al menos 3 letras y sin números.");
      return;
    }
    if (!validarTexto(abogadoForm.apellido)) {
      setMensaje("⚠️ El apellido debe tener al menos 3 letras y sin números.");
      return;
    }
    if (!validateUruguayanCI(abogadoForm.ci)) {
      setMensaje("⚠️ La cédula uruguaya no es válida.");
      return;
    }

    try {
      const todos = await axios.get("http://localhost:8080/abogados", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const existe = todos.data.some(
        (a: Abogado) => a.ci === abogadoForm.ci && a.id !== abogado.id
      );

      if (existe) {
        setMensaje("⚠️ Ya existe un abogado con esa cédula.");
        return;
      }

      const res = await axios.put(
        `http://localhost:8080/abogados/${abogado.id}`,
        abogadoForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        setAbogado(res.data);
        setMensaje("✅ Datos del abogado actualizados correctamente.");
        setTimeout(() => setMensaje(""), 2500);
      }
    } catch {
      setMensaje("❌ Error al actualizar el abogado.");
    }
  };

  const handleCancelar = () => {
    setEditForm({ ...editForm, password: "" });
    setMensaje("");
    setShowConfig(false);
  };

  // ================== 🔹 Render ==================
  return (
    <MasterPage>
      <div className="clientes-layout">
        <div className="clientes-section">
          <h2>Clientes</h2>
          <button
            className="nuevo-cliente-btn"
            onClick={() => navigate("/agregar-cliente")}
          >
            <img src={MasIcon} alt="Agregar" className="icono-mas" />
            Agregar Cliente
          </button>

          {loading ? (
            <p>Cargando...</p>
          ) : clientes.length > 0 ? (
            <div className="clientes-grid">
              {clientes.map((cliente) => (
                <div
                  key={cliente.id}
                  className="perfil-card"
                  onClick={() => navigate(`/clientes/${cliente.id}`)}
                >
                  <h3>
                    {cliente.nombre} {cliente.apellido}
                  </h3>
                  <p>
                    <span className="label">CI:</span> {cliente.ci}
                  </p>
                  <p>
                    <span className="label">Email:</span> {cliente.email}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No hay clientes registrados.</p>
          )}
        </div>

        <div className="usuario-section">
          <h2>Abogado</h2>
          {abogado && (
            <div className="perfil-card">
              <p>
                <b>Nombre:</b> {abogado.nombre} {abogado.apellido}
              </p>
              <p>
                <b>CI:</b> {abogado.ci}
              </p>
            </div>
          )}
          {usuario && (
            <div className="perfil-card">
              <p>
                <b>Usuario:</b> {usuario.username}
              </p>
              <p>
                <b>Email:</b> {usuario.email}
              </p>
              <div className="perfil-actions">
                <button onClick={() => setShowConfig(true)}>Configuración</button>
                <button
                  onClick={() => {
                    localStorage.removeItem("jwt");
                    window.location.reload();
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/*  Popup Configuración */}
      {showConfig && (
        <div className="modal-overlay">
          <div className="modal">
            <h3> Configuración de Usuario</h3>
            <input
              name="username"
              value={editForm.username}
              onChange={handleChangeUser}
              placeholder="Usuario"
            />
            <input
              name="email"
              type="email"
              value={editForm.email}
              onChange={handleChangeUser}
              placeholder="Correo electrónico"
            />
            <input
              name="password"
              type="password"
              value={editForm.password}
              onChange={handleChangeUser}
              placeholder="Contraseña (mínimo 6 caracteres)"
            />
            <button className="btn-primary" onClick={handleGuardarUsuario}>
              Guardar Usuario
            </button>

            <hr style={{ margin: "15px 0", border: "none" }} />

            <h3> Configuración de Abogado</h3>
            <input
              name="nombre"
              value={abogadoForm.nombre}
              onChange={handleChangeAbogado}
              placeholder="Nombre"
            />
            <input
              name="apellido"
              value={abogadoForm.apellido}
              onChange={handleChangeAbogado}
              placeholder="Apellido"
            />
            <input
              name="ci"
              value={abogadoForm.ci}
              onChange={handleChangeAbogado}
              placeholder="Cédula uruguaya"
            />

            {mensaje && <p className="mensaje">{mensaje}</p>}

            <div className="modal-buttons">
              <button className="btn-primary" onClick={handleGuardarAbogado}>
                Guardar Abogado
              </button>
              <button className="btn-secondary" onClick={handleCancelar}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </MasterPage>
  );
};

export default PerfilPage;
