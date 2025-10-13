import React, { useState, useEffect, useRef } from "react";
import MasterPage from "./MasterPage";
import "../styles/TranscripcionPage.css";
import { jsPDF } from "jspdf";
import micIcon from "../assets/mic-icon.png"; // o la ruta correcta si estás en /pages/


const TranscripcionPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [rawText, setRawText] = useState<string>("");
  const [buttonText, setButtonText] = useState("Transcribir");
  const [dotCount, setDotCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (f: File | null) => {
    setFile(f);
    setRawText("");
  };

  const handleTranscribe = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("audio", file);

    try {
      const response = await fetch("http://localhost:8000/transcribir_diarizado/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.conversacion) {
        setRawText(data.conversacion);
      }
    } catch (error) {
      alert("Error al transcribir el archivo");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 10;

    const lines = rawText.split("\n");
    lines.forEach((line) => {
      const wrapped = doc.splitTextToSize(line, 180);
      wrapped.forEach((ln: string) => {
        if (y > pageHeight - 10) {
          doc.addPage();
          y = 10;
        }
        doc.text(ln, 10, y);
        y += 10;
      });
    });

    doc.save("transcripcion.pdf");
  };

  useEffect(() => {
    if (!loading) {
      setButtonText("Transcribir");
      return;
    }
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (loading) {
      setButtonText("Transcribiendo" + ".".repeat(dotCount));
    }
  }, [dotCount, loading]);

  return (
    <MasterPage>
      <h1 className="titulo-principal">Transcripción de Audio</h1>

      <div className="transcripcion-layout">
        {/* Panel izquierdo */}
        <div className="panel-contenedor">
          <p className="descripcion">
            Subí un archivo de audio para generar la transcripción diarizada.
          </p>

          {/* Caja de subida */}
          <div
            className="upload-box"
            onClick={() => fileInputRef.current?.click()}
          >
            {/* 🔹 Reemplazo del emoji por la imagen */}
            <img
  src={micIcon}
  alt="Icono micrófono"
  className="upload-img"
/>

            <div className="upload-text">Subí tu archivo de audio aquí</div>
            <div className="upload-hint">Arrastrá un archivo de audio o</div>
            <button type="button" className="upload-btn">
              Seleccionar desde el dispositivo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="upload-input"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            />
          </div>

          <button
            className="transcribir-btn" 
            onClick={handleTranscribe}
            disabled={loading || !file}
          >
            {buttonText}
          </button>
        </div>

        {/* Panel derecho */}
        <div className="transcripcion-output">
          <textarea
            className="transcripcion-textarea"
            value={rawText}
            readOnly
            placeholder="La transcripción aparecerá aquí…"
          ></textarea>

          {rawText && (
            <button className="exportar-btn" onClick={handleExportPDF}>
              EXPORTAR
            </button>
          )}
        </div>
      </div>
    </MasterPage>
  );
};

export default TranscripcionPage;
