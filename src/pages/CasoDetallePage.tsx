import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MasterPage from "./MasterPage";
import "../styles/CasoDetallePage.css";

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
  estado: string;
  fechaCreacion: string;
  archivos?: ArchivoCaso[];
}

const CasoDetallePage = () => {
  const { id } = useParams<{ id: string }>();
  const [caso, setCaso] = useState<Caso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");   // 👈 estado para el mensaje
  const [nuevoArchivo, setNuevoArchivo] = useState<File | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("jwt");

  useEffect(() => {
    if (!token) {
      setError("⚠️ No estás autenticado");
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:8080/casos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCaso(res.data))
      .catch(() => setError("Error al cargar el caso"))
      .finally(() => setLoading(false));
  }, [id]);

  // 🔹 Actualizar caso
  const actualizarCaso = () => {
    if (!caso) return;
    axios
      .put(`http://localhost:8080/casos/${id}`, caso, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCaso(res.data);
        setSuccess("✅ El caso se editó correctamente");   // 👈 mensaje de éxito
        setTimeout(() => setSuccess(""), 3000);           // 👈 se borra en 3 seg
      })
      .catch(() => setError("Error al actualizar el caso"));
  };

  // 🔹 Cambiar estado
  const cambiarEstado = (estado: string) => {
    if (!caso) return;
    setCaso({ ...caso, estado });
    axios
      .put(
        `http://localhost:8080/casos/${id}/estado`,
        { estado },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setCaso(res.data);
        setSuccess("✅ Estado actualizado correctamente");   // 👈 mensaje
        setTimeout(() => setSuccess(""), 3000);
      })
      .catch(() => setError("Error al cambiar estado"));
  };

  // 🔹 Subir archivo
  const subirArchivo = () => {
    if (!nuevoArchivo) return;
    const formData = new FormData();
    formData.append("file", nuevoArchivo);

    axios
      .post(`http://localhost:8080/casos/${id}/archivos`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        setCaso(res.data);
        setSuccess("✅ Archivo subido correctamente");  // 👈 mensaje
        setTimeout(() => setSuccess(""), 3000);
      })
      .catch(() => setError("Error al subir archivo"));
  };

  // 🔹 Eliminar caso
  const eliminarCaso = () => {
    axios
      .delete(`http://localhost:8080/casos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setSuccess("✅ Caso eliminado correctamente");
        setTimeout(() => navigate(-1), 2000);
      })
      .catch(() => setError("Error al eliminar el caso"));
  };

  return (
    <MasterPage>
      <div className="caso-detalle-layout">
        {loading ? (
          <p>Cargando...</p>
        ) : caso ? (
          <div className="caso-card">
            <h2>✏️ Editar Caso</h2>

            <label>Título</label>
            <input
              type="text"
              value={caso.titulo}
              onChange={(e) => setCaso({ ...caso, titulo: e.target.value })}
            />

            <label>Tipo</label>
            <select
              value={caso.tipo}
              onChange={(e) => setCaso({ ...caso, tipo: e.target.value })}
            >
              <option value="civil">Civil</option>
              <option value="penal">Penal</option>
              <option value="laboral">Laboral</option>
              <option value="comercial">Comercial</option>
            </select>

            <label>Descripción</label>
            <textarea
              value={caso.descripcion}
              onChange={(e) =>
                setCaso({ ...caso, descripcion: e.target.value })
              }
            />

            <label>Estado</label>
            <select
              value={caso.estado}
              onChange={(e) => cambiarEstado(e.target.value)}
            >
              <option value="abierto">Abierto</option>
              <option value="cerrado">Cerrado</option>
              <option value="en_juicio">En Juicio</option>
            </select>

            <button onClick={actualizarCaso}>💾 Guardar</button>
            <button onClick={eliminarCaso} style={{ color: "red" }}>
              🗑️ Eliminar Caso
            </button>

            <h3>📂 Archivos</h3>
            <ul>
              {caso.archivos?.map((a) => (
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

            <input
              type="file"
              onChange={(e) =>
                setNuevoArchivo(e.target.files ? e.target.files[0] : null)
              }
            />
            <button onClick={subirArchivo}>⬆️ Subir Archivo</button>
          </div>
        ) : (
          <p>No se encontró el caso</p>
        )}

        {/* Mensajes */}
        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}
      </div>
    </MasterPage>
  );
};

export default CasoDetallePage;
