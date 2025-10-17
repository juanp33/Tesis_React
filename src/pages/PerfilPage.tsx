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

const PerfilPage = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      setError("No estás autenticado");
      setLoading(false);
      return;
    }

    // Cargar clientes
    axios
      .get("http://localhost:8080/clientes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setClientes(res.data);
        } else {
          setClientes([]);
        }
      })
      .catch(() => setError("No se pudieron cargar los clientes"))
      .finally(() => setLoading(false));

    // Cargar usuario autenticado
    axios
      .get("http://localhost:8080/api/usuario/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsuario(res.data))
      .catch(() => setError("No se pudo obtener el usuario"));
  }, []);

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
          ) : Array.isArray(clientes) && clientes.length > 0 ? (
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
          {error && <p className="error-msg">{error}</p>}
          {usuario && (
            <div className="perfil-card">
              <p>
                <span className="label">ID:</span> {usuario.id}
              </p>
              <p>
                <span className="label">Usuario:</span> {usuario.username}
              </p>
              <p>
                <span className="label">Email:</span> {usuario.email}
              </p>
              <div className="perfil-actions">
                <button onClick={() => alert("Ir a configuración")}>
                  Configuración
                </button>
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
    </MasterPage>
  );
};

export default PerfilPage;
