import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import MasterPage from "./MasterPage";
import "../styles/NuevoCasoPage.css";
const NuevoCasoPage = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [archivos, setArchivos] = useState<FileList | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("jwt");
    if (!token) {
      setError("No estás autenticado");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("titulo", titulo);
      formData.append("tipo", tipo);
      formData.append("descripcion", descripcion);
      formData.append("clienteId", id!);

      if (archivos) {
        Array.from(archivos).forEach((archivo) => {
          formData.append("archivos", archivo);
        });
      }

      await axios.post("http://localhost:8080/casos", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate(`/clientes/${id}`); 
    } catch {
      setError("No se pudo crear el caso");
    }
  };

  return (
    <MasterPage>
      <div className="nuevo-caso">
        <h2>➕ Nuevo Caso</h2>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit} className="form-caso">
          <label>Título</label>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required />

          <label>Tipo</label>
          <input value={tipo} onChange={(e) => setTipo(e.target.value)} required />

          <label>Descripción</label>
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />

          <label>Archivos</label>
          <input type="file" multiple onChange={(e) => setArchivos(e.target.files)} />

          <button type="submit">Crear Caso</button>
        </form>
      </div>
    </MasterPage>
  );
};

export default NuevoCasoPage;