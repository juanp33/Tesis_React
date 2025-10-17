import React, { useState } from "react";
import "../styles/TransformarDocumento.css";
import MasterPage from "./MasterPage"; 

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const TransformarDocumento: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [formato, setFormato] = useState<string>("pdf");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [downloadUrl, setDownloadUrl] = useState<string>("");

  const handleConvertir = async () => {
    if (!file) {
      setError("Subí un archivo primero.");
      return;
    }
    setLoading(true);
    setError("");
    setDownloadUrl("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("formato_salida", formato);

      const res = await fetch(`${API_BASE}/convertir_documento/`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error(await res.text() || `Error HTTP ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (e: any) {
      setError(e?.message || "Error en la conversión.");
    } finally {
      setLoading(false);
    }
  };
 return (
    <MasterPage>
      <div className="td-page">
        <div className="td-card">
          <h2 className="td-title">Transformar Documento</h2>
          <p className="td-subtitle">
            Convertí tu documento entre PDF, DOCX o TXT.
          </p>

          <div className="td-dropzone">
            <div className="td-drop-icon">📄</div>
            <p className="td-drop-text">Arrastrá tu documento aquí para subirlo</p>
            <label className="td-btn-upload">
              Seleccionar desde el dispositivo
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                hidden
              />
            </label>
          </div>

          {file && (
            <div className="td-file-info">
              Archivo seleccionado: <strong>{file.name}</strong>
            </div>
          )}

          <select
            value={formato}
            onChange={(e) => setFormato(e.target.value)}
            className="td-select"
          >
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="txt">TXT</option>
          </select>

          <button
            className="td-btn"
            onClick={handleConvertir}
            disabled={loading || !file}
          >
            {loading ? "Convirtiendo…" : "Convertir"}
          </button>

          {error && <div className="td-error">{error}</div>}
          {downloadUrl && (
            <a
              href={downloadUrl}
              download={`convertido.${formato}`}
              className="td-download"
            >
              Descargar archivo convertido
            </a>
          )}
        </div>
      </div>
    </MasterPage>
  );
};

export default TransformarDocumento;