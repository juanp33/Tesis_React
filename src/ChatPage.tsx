import React, { useState } from "react";
import MasterPage from "./MasterPage";
import "./ChatPage.css";

const API_BASE = "http://localhost:8000";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatPage: React.FC = () => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Inicia el chat automáticamente al cargar la primera vez
  const startChat = async () => {
    const res = await fetch(`${API_BASE}/chatbot/start/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documento_inicial: "" }),
    });
    const data = await res.json();
    setChatId(data.chat_id);
  };

  React.useEffect(() => {
    startChat();
  }, []);

  // Envía mensaje
  const sendMessage = async () => {
    if (!chatId || !input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    const res = await fetch(`${API_BASE}/chatbot/message/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, mensaje_usuario: userMsg }),
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { role: "assistant", content: data.respuesta }]);
    setLoading(false);
  };

  return (
    <MasterPage>
      <div className="chat-page">
        {/* Header fijo arriba */}
        <header className="chat-header">
          <div className="chat-logo">⚖️</div>
          <h1>Asistente Jurídico Uruguayo</h1>
          <p className="chat-subtitle">
            Responde consultas jurídicas en estilo formal y redacta documentos legales.
          </p>
        </header>

        {/* Mensajes */}
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              <div className="chat-bubble">{msg.content}</div>
            </div>
          ))}
          {loading && <div className="chat-message assistant">Escribiendo...</div>}
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu consulta legal..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} disabled={!input.trim() || loading}>
            ➤
          </button>
        </div>
      </div>
    </MasterPage>
  );
};

export default ChatPage;
