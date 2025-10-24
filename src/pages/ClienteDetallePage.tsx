import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MasterPage from "./MasterPage";
import "../styles/ClienteDetallePage.css";

interface ArchivoCaso {
  id: number;
  nombreArchivo: string;
  rutaArchivo: string;
  fechaSubida: string;
}

interface Caso {
  id: number;
  titulo: string;
  tipo: string;
  descripcion: string;
  abogado: string;
  estado: string;
  fechaCreacion: string;
  archivos?: ArchivoCaso[];
}

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  ci: string;
  email: string;
}

const ClienteDetallePage = () => {
  const { id } = useParams<{ id: string }>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [casos, setCasos] = useState<Caso[]>([]);
  const [archivosUrls, setArchivosUrls] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      setError("⚠️ No estás autenticado");
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:8080/clientes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCliente(res.data))
      .catch(() => setError("Error al cargar el cliente"));

    axios
      .get(`http://localhost:8080/clientes/${id}/casos`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        let data = res.data;
        if (Array.isArray(data) && Array.isArray(data[0])) {
          data = data[0];
        } else if (data.casos && Array.isArray(data.casos)) {
          data = data.casos;
        }
        setCasos(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Error al cargar los casos"))
      .finally(() => setLoading(false));
  }, [id]);

  const fetchArchivo = async (casoId: number, archivo: ArchivoCaso) => {
    const token = localStorage.getItem("jwt");
    try {
      const res = await axios.get(
        `http://localhost:8080/api/archivos/${casoId}/${archivo.nombreArchivo}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const url = URL.createObjectURL(res.data);
      setArchivosUrls((prev) => ({ ...prev, [archivo.id]: url }));
    } catch {
      setError("No se pudo cargar un archivo");
    }
  };

  useEffect(() => {
    casos.forEach((caso) => {
      caso.archivos?.forEach((archivo) => {
        if (!archivosUrls[archivo.id]) {
          fetchArchivo(caso.id, archivo);
        }
      });
    });
  }, [casos]);

  // 🧹 Función para eliminar el cliente
  const handleEliminarCliente = async () => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      setMensaje("⚠️ No estás autenticado.");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/clientes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMensaje("✅ Cliente eliminado correctamente junto a sus casos.");
      setTimeout(() => navigate("/clientes"), 1800);
    } catch (err) {
      setMensaje("❌ No se pudo eliminar el cliente.");
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <MasterPage>
      <div className="cliente-detalle-layout">
        <div className="casos-section">
          <h2>📂 Casos</h2>

          {loading ? (
            <p>Cargando...</p>
          ) : casos.length === 0 ? (
            <p>No hay casos registrados.</p>
          ) : (
            <div className="casos-grid">
              {casos.map((caso) => (
                <div
                  key={caso.id}
                  className="caso-card"
                  onClick={() => navigate(`/casos/${caso.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <h3>{caso.titulo}</h3>
                  <p><b>Tipo:</b> {caso.tipo}</p>
                  <p><b>Estado:</b> {caso.estado}</p>
                  <p><b>Descripción:</b> {caso.descripcion}</p>
                  <p><b>Abogado:</b> {caso.abogado}</p>
                  <p><b>Fecha:</b> {new Date(caso.fechaCreacion).toLocaleString()}</p>

                  <h4>Archivos:</h4>
                  {caso.archivos && caso.archivos.length > 0 ? (
                    <ul>
                      {caso.archivos.map((a) => (
                        <li key={a.id}>
                          {archivosUrls[a.id] ? (
                            <a
                              href={archivosUrls[a.id]}
                              download={a.nombreArchivo}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()} 
                            >
                              {a.nombreArchivo}
                            </a>
                          ) : (
                            <span>Cargando {a.nombreArchivo}...</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Sin archivos adjuntos</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            className="nuevo-caso-btn"
            onClick={() => navigate(`/clientes/${id}/nuevo-caso`)}
          >
            ➕ Agregar Caso
          </button>
        </div>

        <div className="cliente-info-section">
          <h2>👤 Información del Cliente</h2>
          {cliente ? (
            <div className="perfil-card">
              <p><b>ID:</b> {cliente.id}</p>
              <p><b>Nombre:</b> {cliente.nombre} {cliente.apellido}</p>
              <p><b>CI:</b> {cliente.ci}</p>
              <p><b>Email:</b> {cliente.email}</p>

              <button
                className="btn-danger"
                onClick={() => setShowConfirm(true)}
              >
                🗑️ Eliminar Cliente
              </button>

              {mensaje && <p className="mensaje">{mensaje}</p>}
            </div>
          ) : (
            <p>No se pudo cargar el cliente.</p>
          )}
        </div>

        {/* Modal de confirmación */}
        {showConfirm && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>⚠️ Confirmar eliminación</h3>
              <p>
                ¿Seguro que deseas eliminar este cliente?<br />
                Se eliminarán también todos sus casos y vínculos.
              </p>
              <div className="modal-buttons">
                <button className="btn-danger" onClick={handleEliminarCliente}>
                  Sí, eliminar
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowConfirm(false)}
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

export default ClienteDetallePage;
