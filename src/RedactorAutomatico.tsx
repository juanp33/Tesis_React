import React, { useCallback, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import "./RedaccionAutomatica.css";
import MasterPage from "./MasterPage";

const API_BASE: string =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

type DropZoneSingleProps = {
  label: string;
  accept?: string;
  id: string;
  onFile: (file: File | null) => void;
};

type DropZoneMultiProps = {
  label: string;
  accept?: string;
  id: string;
  onFiles: (files: File[]) => void;
};

function DropZoneSingle({ label, accept, id, onFile }: DropZoneSingleProps) {
  const [dragOver, setDragOver] = useState(false);
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    onFile(f);
  }, [onFile]);
  return (
    <div className="ra-dropzone">
      <label htmlFor={id} className="ra-sr-only">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`ra-drop ${dragOver ? "ra-drop--active" : ""}`}
      >
        <div className="ra-drop__content">
          <div className="ra-drop__title">{label}</div>
          <div className="ra-drop__hint">Arrastrá un archivo o hacé clic para seleccionar</div>
          <input
            id={id}
            type="file"
            accept={accept}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>
    </div>
  );
}

function DropZoneMulti({ label, accept, id, onFiles }: DropZoneMultiProps) {
  const [dragOver, setDragOver] = useState(false);
  const [names, setNames] = useState<string[]>([]);
  const handleFiles = (fl: FileList | null) => {
    const arr = fl ? Array.from(fl) : [];
    setNames(arr.map(f => f.name));
    onFiles(arr);
  };
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, []);
  return (
    <div className="ra-dropzone">
      <label htmlFor={id} className="ra-sr-only">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`ra-drop ${dragOver ? "ra-drop--active" : ""}`}
      >
        <div className="ra-drop__content">
          <div className="ra-drop__title">{label}</div>
          <div className="ra-drop__hint">Arrastrá varios PDFs o hacé clic para seleccionar</div>
          <input
            id={id}
            type="file"
            accept={accept}
            multiple
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)}
          />
          {names.length > 0 && (
            <div className="ra-filelist" aria-live="polite">
              {names.slice(0, 5).map((n, i) => (
                <div key={i} className="ra-fileitem">{n}</div>
              ))}
              {names.length > 5 && <div className="ra-fileitem">+{names.length - 5} más…</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RedaccionAutomatica() {
  const [documentType, setDocumentType] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<string>("");

  const docTypeOptions = useMemo(
    () => ["demanda", "contestación", "escrito simple", "testamento", "contrato"],
    []
  );

  const handleGenerate = async () => {
    setError("");
    setResult("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("document_type", documentType);
      fd.append("instructions", instructions);
      if (templateFile) fd.append("template_file", templateFile);
      evidenceFiles.forEach((f) => fd.append("evidence_files", f));
      const res = await fetch(`${API_BASE}/redaccion_documento/`, { method: "POST", body: fd });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      const json: { generated_text?: string } = await res.json();
      setResult(json.generated_text || "");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const downloadTxt = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${documentType || "documento"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
    const pageH = doc.internal.pageSize.getHeight();
    const lineHeight = 16;
    doc.setFont("courier", "normal");
    doc.setFontSize(12);
    const text = result.replace(/\r\n/g, "\n");
    const paragraphs = text.split("\n");
    let y = margin;
    paragraphs.forEach((p) => {
      const content = p === "" ? " " : p;
      const wrapped = doc.splitTextToSize(content, maxWidth);
      for (const line of wrapped) {
        if (y + lineHeight > pageH - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      }
    });
    doc.save(`${documentType || "documento"}.pdf`);
  };

  return (
    <MasterPage>
      <div className="ra-page">
        <div className="ra-left">
          <div className="ra-row">
            <div className="ra-selectWrap">
              <select
                className="ra-select"
                value={documentType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDocumentType(e.target.value)}
              >
                <option value="">Tipo de doc.</option>
                {docTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <input
              className="ra-input"
              placeholder="o escribí un tipo personalizado"
              value={documentType}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDocumentType(e.target.value)}
            />
          </div>

          <DropZoneSingle
            id="tpl"
            label="Subir tu archivo de ejemplo aquí"
            accept=".txt,.md,.doc,.docx,.rtf,.pdf,.html,.htm"
            onFile={setTemplateFile}
          />

          <DropZoneMulti
            id="evid"
            label="Subir evidencias (PDFs)"
            accept="application/pdf,.pdf"
            onFiles={setEvidenceFiles}
          />

          <div className="ra-actions">
            <button onClick={downloadPDF} className="ra-btn ra-btn--primary">Exportar (PDF)</button>
            <button onClick={downloadTxt} className="ra-btn">Exportar (.txt)</button>
          </div>
        </div>

        <div className="ra-right">
          <textarea
            className="ra-textarea ra-textarea--small"
            placeholder="Instrucciones"
            value={instructions}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInstructions(e.target.value)}
          />
          <div className="ra-right__actions">
            <button onClick={handleGenerate} disabled={loading || !documentType} className="ra-btn">
              {loading ? "Generando…" : "Generar texto"}
            </button>
          </div>
          <div className="ra-result">
            {error ? (
              <div className="ra-error">{error}</div>
            ) : (
              <textarea
                className="ra-textarea"
                value={result}
                readOnly
                placeholder="El texto generado aparecerá aquí…"
              />
            )}
          </div>
        </div>
      </div>
    </MasterPage>
  );
}
