import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import "../styles/RedaccionAutomatica.css";
import MasterPage from "./MasterPage";

const API_BASE: string = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

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

type ChatMsg = { role: "user" | "assistant"; text: string };

// DropZone simple (1 archivo)
function DropZoneSingle({ accept, id, onFile }: DropZoneSingleProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0] ?? null;
      setSelectedFile(f);
      onFile(f);
    },
    [onFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setSelectedFile(f);
    onFile(f);
  };

  return (
    <div className="ra-dropzone">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`ra-drop ${dragOver ? "ra-drop--active" : ""}`}
      >
        <div className="ra-drop__content">
          <div className="ra-drop__icon">📄</div>
          <div className="ra-drop__title">Subir tu archivo de ejemplo (opcional)</div>
          <div className="ra-drop__hint">Arrastrá un archivo aquí o</div>
          <label className="ra-btn-upload">
            Seleccionar desde el dispositivo
            <input
              id={id}
              type="file"
              accept={accept}
              onChange={handleChange}
              hidden
            />
          </label>

          {selectedFile && (
            <div className="ra-fileinfo">
              Archivo seleccionado: <strong>{selectedFile.name}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function DropZoneMulti({ accept, id, onFiles }: DropZoneMultiProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFiles = (fl: FileList | null) => {
    const arr = fl ? Array.from(fl) : [];
    setSelectedFiles(arr);
    onFiles(arr);
  };

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [onFiles]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div className="ra-dropzone">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`ra-drop ${dragOver ? "ra-drop--active" : ""}`}
      >
        <div className="ra-drop__content">
          <div className="ra-drop__icon">📄</div>
          <div className="ra-drop__title">Subir evidencias (PDFs)</div>
          <div className="ra-drop__hint">Arrastrá varios PDFs aquí o</div>
          <label className="ra-btn-upload">
            Seleccionar desde el dispositivo
            <input
              id={id}
              type="file"
              accept={accept}
              multiple
              onChange={handleChange}
              hidden
            />
          </label>

          {selectedFiles.length > 0 && (
            <div className="ra-fileinfo">
              {selectedFiles.length === 1 ? (
                <>
                  Archivo seleccionado: <strong>{selectedFiles[0].name}</strong>
                </>
              ) : (
                <>
                  Archivos seleccionados:
                  <br />
                  {selectedFiles.map((file, i) => (
                    <div key={i}>
                      <strong>{file.name}</strong>
                    </div>
                  ))}
                </>
              )}
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
  const [pdfSrc, setPdfSrc] = useState<string>("");
  const [evidenceId, setEvidenceId] = useState<string>("");
  const [chatId, setChatId] = useState<string>("");
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatMsgs]);

  const docTypeOptions = useMemo(
    () => ["Demanda", "Poder", "Escrito", "Testamento", "Declaración Jurada"],
    []
  );

  const handleGenerate = async () => {
    setError("");
    setChatId("");
    setChatMsgs([]);
    setPdfSrc("");
    setEvidenceId("");
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("document_type", documentType);
      fd.append("instructions", instructions);
      if (templateFile) fd.append("template_file", templateFile);
      evidenceFiles.forEach((f) => fd.append("evidence_files", f));

      const res = await fetch(`${API_BASE}/redaccion_documento/`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();

      const inicial = json.generated_text || "";
      const evidId = json.evidence_id || "";
      setEvidenceId(evidId);
      setPdfSrc(`${json.pdf_url}?t=${Date.now()}`);

      await startChat(inicial, evidId);
    } catch (err: any) {
      setError(err.message || "Error al generar el documento");
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (documentoInicial: string, evidId: string) => {
    const res = await fetch(`${API_BASE}/redaccion_chat/start/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documento_inicial: documentoInicial, evidence_id: evidId }),
    });
    const json = await res.json();
    setChatId(json.chat_id);
    setPdfSrc(`${json.pdf_url}?t=${Date.now()}`);
    setChatMsgs([{ role: "assistant", text: json.respuesta }]);
  };

  const sendChat = async () => {
    if (!chatId || !chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatMsgs((m) => [...m, { role: "user", text: msg }]);
    setChatInput("");

    try {
      const r = await fetch(`${API_BASE}/redaccion_chat/message/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, mensaje_usuario: msg }),
      });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();

      setChatMsgs((m) => [...m, { role: "assistant", text: data.respuesta }]);
      setPdfSrc(`${data.pdf_url}?t=${Date.now()}`);
    } catch (err: any) {
      setChatMsgs((m) => [
        ...m,
        { role: "assistant", text: "⚠️ Error al procesar la solicitud." },
      ]);
    }
  };

  const copyLink = async () => {
    if (!pdfSrc) return;
    try {
      await navigator.clipboard.writeText(pdfSrc);
    } catch {}
  };

  return (
    <MasterPage>
      <div className="ra-page">
        <div className="ra-top">
          <div className="ra-selectWrap">
            <select
              className="ra-select"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
            >
              <option value="">Tipo de documento</option>
              {docTypeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="ra-dropzones">
            <DropZoneMulti
              id="evid"
              label=""
              accept="application/pdf,.pdf"
              onFiles={setEvidenceFiles}
            />
            <DropZoneSingle
              id="tpl"
              label=""
              accept=".txt,.md,.doc,.docx,.rtf,.pdf,.html,.htm"
              onFile={setTemplateFile}
            />
          </div>

          <textarea
            className="ra-textarea"
            placeholder="Instrucciones"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />

          <div className="ra-right__actions">
            <button
              onClick={handleGenerate}
              disabled={loading || !documentType}
              className="ra-btn"
            >
              {loading ? "Generando…" : "Generar y abrir chat"}
            </button>
          </div>

          {error && <div className="ra-error">{error}</div>}
        </div>

        <div className="ra-bottom">
          <div className="ra-pdfWrap">
            {pdfSrc ? (
              <iframe key={pdfSrc} title="Documento PDF" className="ra-pdf" src={pdfSrc} />
            ) : (
              <div className="ra-pdfPlaceholder">El PDF aparecerá aquí…</div>
            )}
            <div className="ra-pdfActions">
              <button className="ra-btn" onClick={copyLink} disabled={!pdfSrc}>
                Copiar enlace del PDF
              </button>
              {evidenceId && <span className="ra-evidenceTag">Evidencias vinculadas</span>}
            </div>
          </div>

          <div className="ra-chat">
            <div className="ra-chat__header">
              <div className="ra-chat__title">Chat de mejora del documento</div>
              <div className="ra-chat__status">{chatId ? "Listo" : "Esperando inicio…"}</div>
            </div>

            <div className="ra-chat__messages" ref={messagesRef}>
              {chatMsgs.map((m, i) => (
                <div
                  key={i}
                  className={`ra-chat__bubble ${
                    m.role === "user" ? "ra-chat__bubble--user" : "ra-chat__bubble--bot"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <div className="ra-chat__form">
              <input
                className="ra-input"
                placeholder="Escribí qué querés mejorar…"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                disabled={!chatId || loading}
              />
              <button
                className="ra-btn ra-btn--primary"
                onClick={sendChat}
                disabled={!chatId || loading || !chatInput.trim()}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    </MasterPage>
  );
}
