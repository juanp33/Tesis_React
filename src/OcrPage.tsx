import React, { useState } from "react";
import MasterPage from "./MasterPage";
import "./OCRPage.css";

const OCRPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrUrl, setOcrUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setOcrUrl(null);
    }
  };

  const handleOCR = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("archivo", file);

    try {
      const response = await fetch("http://localhost:8000/ocr_archivo_con_texto/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error al procesar el archivo");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setOcrUrl(url);
    } catch (error) {
      alert("Error procesando el archivo OCR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MasterPage>
      <div className="ocr-page">
        <div className="ocr-controls">
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
          <button onClick={handleOCR} disabled={loading || !file}>
            {loading ? "Procesando..." : "Convertir OCR"}
          </button>
        </div>

        {ocrUrl && (
          <div className="ocr-result">
            <iframe src={ocrUrl} title="Resultado OCR" />
            <a href={ocrUrl} download="archivo_ocr.pdf">
              Descargar PDF
            </a>
          </div>
        )}
      </div>
    </MasterPage>
  );
};

export default OCRPage;
