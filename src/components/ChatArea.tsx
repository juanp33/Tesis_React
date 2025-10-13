import React, { useEffect, useRef, useState } from "react";
import "./ChatArea.css";
import clipIcon from "../logos/clip.png";
import sendIcon from "../logos/enviar.png";

interface ChatFile {
  name: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  files?: ChatFile[];
}

interface ChatAreaProps {
  chatId: string | null;
}

export default function ChatArea({ chatId }: ChatAreaProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Cargar mensajes cuando se selecciona un chat
  useEffect(() => {
    if (!chatId) return;
    const token = localStorage.getItem("jwt");
    setMessages([]);

    fetch(`http://localhost:8080/api/messages/${chatId}`, {
      headers: { Authorization: `Bearer ${token || ""}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(() =>
        setMessages([
          {
            role: "assistant",
            content: "⚠️ No se pudieron cargar los mensajes del chat.",
          },
        ])
      );
  }, [chatId]);

  // 🔸 Eliminar un archivo antes de enviar
  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 🔸 Enviar mensaje y placeholder
  const sendMessage = async () => {
    if (!chatId || (!message.trim() && attachedFiles.length === 0)) return;
    setIsLoading(true);

    const newMessages: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        content: message || "[Archivo enviado]",
        files: attachedFiles.map((f) => ({ name: f.name })),
      },
      { role: "assistant", content: "💭 El asistente está redactando..." },
    ];
    setMessages(newMessages);

    const token = localStorage.getItem("jwt");
    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("message", message || "");
    attachedFiles.forEach((file) => form.append("files", file));

    setMessage("");
    setAttachedFiles([]);

    try {
      const res = await fetch("http://localhost:8000/chat/stream", {
        method: "POST",
        headers: { Authorization: `Bearer ${token || ""}` },
        body: form,
      });

      const data = await res.json();
      const assistantResponse =
        data.response || "❌ No se recibió respuesta del servidor.";

      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = [...updated]
          .reverse()
          .findIndex((m) => m.role === "assistant");
        const realIndex =
          lastIndex === -1 ? -1 : updated.length - 1 - lastIndex;

        if (realIndex !== -1) {
          updated[realIndex] = {
            role: "assistant",
            content: assistantResponse,
          };
        }
        return updated;
      });
    } catch (err) {
      console.error("Error enviando mensaje:", err);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "❌ Error interno del servidor." },
      ]);
    }

    setIsLoading(false);
  };

  return (
    <div className="chat-area">
      <div className="messages-box">
        {messages.map((msg, i) => (
          <div key={i} className={`msg-bubble ${msg.role}`}>
            <div className="msg-content" style={{ whiteSpace: "pre-line" }}>
              {msg.content}
            </div>

            {/* Archivos adjuntos dentro del mensaje */}
            {msg.files && msg.files.length > 0 && (
              <div className="attached-preview" style={{ marginTop: "5px" }}>
                {msg.files.map((file, idx) => (
                  <span key={idx} className="file-chip">
                    📎 {file.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      <div className="input-bar">
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* ✅ Vista previa con opción de eliminar */}
          {attachedFiles.length > 0 && (
            <div className="attached-preview">
              {attachedFiles.map((file, idx) => (
                <span key={idx} className="file-chip">
                  {file.name}
                  <span
                    style={{
                      marginLeft: "6px",
                      cursor: "pointer",
                      color: "#888",
                      fontWeight: "bold",
                    }}
                    onClick={() => removeFile(idx)}
                  >
                    ❌
                  </span>
                </span>
              ))}
            </div>
          )}

          <textarea
            placeholder="Escribe tu consulta legal..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())
            }
          />
        </div>

        <div className="right-icons">
          <label className="file-label" title="Adjuntar archivo">
            <img src={clipIcon} alt="Adjuntar" className="icon-btn" />
            <input
              type="file"
              multiple
              onChange={(e) =>
                setAttachedFiles(Array.from(e.target.files || []))
              }
              style={{ display: "none" }}
            />
          </label>

          <button className="send-btn" onClick={sendMessage} title="Enviar">
            <img src={sendIcon} alt="Enviar" className="icon-btn" />
          </button>
        </div>
      </div>
    </div>
  );
}