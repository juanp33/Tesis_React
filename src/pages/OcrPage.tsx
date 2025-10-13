import React, { useState } from "react";
import MasterPage from "./MasterPage";
import "../styles/OCRPage.css";

const API_BASE: string = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const OCRPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrUrl, setOcrUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setOcrUrl(null);
      setError("");
    }
  };

  const handleOCR = async () => {
    if (!file) {
      setError("Subí un archivo primero.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("archivo", file);

    try {
      const response = await fetch(`${API_BASE}/ocr/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error al procesar el archivo");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setOcrUrl(url);
    } catch (error) {
      setError("Error procesando el archivo OCR.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MasterPage>
      <div className="ocr-page">
        <div className="ocr-card">
          <h2>Conversión OCR</h2>
          <p>Subí un PDF o imagen y conviértelo a texto editable (PDF OCR).</p>

          <div className="ocr-dropzone">
            <div className="ocr-drop__content">
              <div className="ocr-drop__icon">📄</div>
              <div className="ocr-drop__title">Subir archivo</div>
              <div className="ocr-drop__hint">Arrastrá un archivo aquí o</div>
              <label className="ocr-btn-upload">
                Seleccionar desde el dispositivo
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  hidden
                />
              </label>
            </div>
          </div>

          {/* ✅ Mostrar nombre del archivo seleccionado */}
          {file && (
            <div className="ocr-file-info">
              Archivo seleccionado: <strong>{file.name}</strong>
            </div>
          )}

          <button
            className="ocr-btn"
            onClick={handleOCR}
            disabled={loading || !file}
          >
            {loading ? "Procesando…" : "Convertir OCR"}
          </button>

          {/* ✅ Mensaje de error */}
          {error && <div className="ocr-error">{error}</div>}

          {/* ✅ Resultado y enlace de descarga */}
          {ocrUrl && (
            <div className="ocr-result">
              <iframe src={ocrUrl} title="Resultado OCR" className="ocr-iframe" />
              <a href={ocrUrl} download="archivo_ocr.pdf" className="ocr-download">
                Descargar PDF
              </a>
            </div>
          )}
        </div>
      </div>
    </MasterPage>
  );
};

export default OCRPage;
