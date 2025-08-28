import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MasterPage from "./MasterPage";
import "./ClienteDetallePage.css";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      setError("⚠️ No estás autenticado");
      setLoading(false);
      return;
    }

    // Cargar cliente
    axios
      .get(`http://localhost:8080/clientes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCliente(res.data))
      .catch(() => setError("Error al cargar el cliente"));

    // Cargar casos
    axios
      .get(`http://localhost:8080/clientes/${id}/casos`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("Respuesta de casos:", res.data);

        let data = res.data;

        // 🔹 Normalizar posibles formatos
        if (Array.isArray(data) && Array.isArray(data[0])) {
          // si viene [[{...}]]
          data = data[0];
        } else if (data.casos && Array.isArray(data.casos)) {
          // si backend devuelve { casos: [...] }
          data = data.casos;
        }

        setCasos(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Error al cargar los casos"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <MasterPage>
      <div className="cliente-detalle-layout">
        {/* Casos */}
        <div className="casos-section">
          <h2>📂 Casos</h2>

          {loading ? (
            <p>Cargando...</p>
          ) : casos.length === 0 ? (
            <p>No hay casos registrados.</p>
          ) : (
            <div className="casos-grid">
              {casos.map((caso) => (
                <div key={caso.id} className="caso-card">
                  <h3>{caso.titulo}</h3>
                  <p><b>Tipo:</b> {caso.tipo}</p>
                  <p><b>Estado:</b> {caso.estado}</p>
                  <p><b>Descripción:</b> {caso.descripcion}</p>
                  <p><b>Abogado:</b> {caso.abogado}</p>
                  <p><b>Fecha:</b> {new Date(caso.fechaCreacion).toLocaleString()}</p>

                  {/* Archivos */}
                  <h4>Archivos:</h4>
                  {caso.archivos && caso.archivos.length > 0 ? (
                    <ul>
                      {caso.archivos.map((a) => (
                        <li key={a.id}>
                          <a
                            href={`http://localhost:8080/${a.rutaArchivo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {a.nombreArchivo}
                          </a>
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

        {/* Cliente info */}
        <div className="cliente-info-section">
          <h2>👤 Información del Cliente</h2>
          {cliente ? (
            <div className="perfil-card">
              <p><b>ID:</b> {cliente.id}</p>
              <p><b>Nombre:</b> {cliente.nombre} {cliente.apellido}</p>
              <p><b>CI:</b> {cliente.ci}</p>
              <p><b>Email:</b> {cliente.email}</p>
            </div>
          ) : (
            <p>No se pudo cargar el cliente.</p>
          )}
        </div>
      </div>
    </MasterPage>
  );
};

export default ClienteDetallePage;
