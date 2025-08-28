import React, { useState } from "react";
import MasterPage from "./MasterPage";
import "./ChatPage.css";

const API_BASE = "http://localhost:8000";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatPage = () => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Inicia el chat
  const startChat = async () => {
    const res = await fetch(`${API_BASE}/chatbot/start/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documento_inicial: "Hola, ¿en qué puedo ayudarte?" }),
    });
    const data = await res.json();
    setChatId(data.chat_id);
    setMessages([{ role: "assistant", content: data.respuesta }]);
  };

  // Envía mensaje + archivo (si hay)
  const sendMessage = async () => {
    if (!chatId || (!input.trim() && !file)) return;

    const formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append("mensaje_usuario", input);
    if (file) formData.append("archivo", file);

    // Mostrar mensaje del usuario en el chat
    setMessages((prev) => [
      ...prev,
      { role: "user", content: input + (file ? `\n📎 ${file.name}` : "") },
    ]);

    setInput("");
    setFile(null);
    setLoading(true);

    const res = await fetch(`${API_BASE}/chatbot/send/`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { role: "assistant", content: data.respuesta }]);
    setLoading(false);
  };

  return (
    <MasterPage>
      <div className="chat-page">
        {!chatId ? (
          <div className="chat-start">
            <button onClick={startChat}>Iniciar Chat Legal</button>
          </div>
        ) : (
          <>
            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.role}`}>
                  <strong>{msg.role === "user" ? "Tú" : "Asistente"}</strong>:{" "}
                  <span
                    dangerouslySetInnerHTML={{
                      __html: msg.content.replace(/\n/g, "<br/>"),
                    }}
                  />
                </div>
              ))}
              {loading && <div className="chat-message assistant">Escribiendo...</div>}
            </div>

            <div className="chat-input-area">
              {/* Clip para adjuntar archivo */}
              <label className="file-attach">
                📎
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>

              {/* Input de texto */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu consulta legal..."
              />

              {/* Botón enviar */}
              <button
                onClick={sendMessage}
                disabled={(!input.trim() && !file) || loading}
              >
                Enviar
              </button>
            </div>

            {/* Vista previa de archivo adjunto */}
            {file && <div className="file-preview">📎 {file.name}</div>}
          </>
        )}
      </div>
    </MasterPage>
  );
};

export default ChatPage;
