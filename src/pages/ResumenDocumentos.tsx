import React, { useState, useRef } from "react";
import MasterPage from "./MasterPage";
import "../styles/ResumenDocumentos.css";
import { jsPDF } from "jspdf";

const API_BASE: string = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const ResumenDocumentos = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumenes, setResumenes] = useState<{ nombre: string; resumen: string }[]>([]);
  const [informe, setInforme] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (fl: FileList | null) => {
    const arr = fl ? Array.from(fl) : [];
    setFiles(arr);
  };

  const handleGenerate = async () => {
    if (!files.length) return;
    setLoading(true);
    setError("");
    setResumenes([]);
    setInforme("");
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));

      const res = await fetch(`${API_BASE}/resumir_documentos/`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error(await res.text());

      const json = await res.json();
      setResumenes(json.documentos || []);
      setInforme(json.informe_final || "");
    } catch (e: any) {
      setError(e?.message || "Error al resumir documentos");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Informe de Resúmenes de Documentos", 20, y);
    y += 15;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    resumenes.forEach((r, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}. ${r.nombre}`, 20, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(r.resumen, 170);
      lines.forEach((line: string) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, 20, y);
        y += 6;
      });
      y += 8;
    });

    if (informe) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.text("Informe Final Consolidado", 20, y);
      y += 10;

      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(informe, 170);
      lines.forEach((line: string) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, 20, y);
        y += 6;
      });
    }

    doc.save("resumen_documentos.pdf");
  };

  return (
    <MasterPage>
      <div className="resumen-page">
        <div className="resumen-left">
          <h2>Resumir Documentos</h2>
          <p className="descripcion">Subí tus documentos para generar resúmenes y un informe consolidado.</p>

          <div className="upload-box" onClick={() => fileInputRef.current?.click()}>
            <div className="upload-icon">📄</div>
            <div className="upload-text">Arrastrá o seleccioná tus archivos</div>
            <div className="upload-hint">Formatos: PDF, DOC, DOCX, TXT</div>
            <button type="button" className="upload-btn">
              Seleccionar desde el dispositivo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              multiple
              className="upload-input"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {files.length > 0 && (
            <ul className="resumen-filelist">
              {files.map((f, i) => (
                <li key={i}>{f.name}</li>
              ))}
            </ul>
          )}

          <button className="resumen-btn" onClick={handleGenerate} disabled={loading || !files.length}>
            {loading ? "Resumiendo…" : "Generar Resúmenes"}
          </button>
          {error && <div className="resumen-error">{error}</div>}
        </div>

        <div className="resumen-right">
          {resumenes.length > 0 && (
            <div>
              <h3>Resúmenes por documento</h3>
              {resumenes.map((r, i) => (
                <div key={i} className="resumen-card">
                  <strong>{r.nombre}</strong>
                  <p>{r.resumen}</p>
                </div>
              ))}
            </div>
          )}

          {informe && (
            <div className="resumen-informe">
              <h3>Informe Final Consolidado</h3>
              <pre>{informe}</pre>
            </div>
          )}

          {(resumenes.length > 0 || informe) && (
            <button className="resumen-btn export-btn" onClick={handleExportPDF}>
              Exportar PDF
            </button>
          )}
        </div>
      </div>
    </MasterPage>
  );
};

export default ResumenDocumentos;
