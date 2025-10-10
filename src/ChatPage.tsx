import React, { useState, useRef } from "react";
import MasterPage from "./MasterPage";
import "./ChatPage.css";

type Role = "user" | "assistant";

interface ChatMessage {
  role: Role;
  content: string;
  files?: File[];
}

export default function ChatPage() {
  const [chatId] = useState<string>("session_" + Date.now());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
 const sendMessage = async () => {
  if (!message.trim() && files.length === 0) return;
  setIsLoading(true);

  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("message", message);
  files.forEach((f) => form.append("files", f));

  const newUserMsg: ChatMessage = { role: "user", content: message, files };
  setMessages((prev) => [...prev, newUserMsg]);
  setMessage("");
  setFiles([]);

  try {
    const res = await fetch("http://localhost:8000/chat/stream", {
      method: "POST",
      body: form,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // ✅ leemos la respuesta JSON normal
    const data = await res.json();

    // agrega el mensaje del asistente
    const aiMsg: ChatMessage = {
      role: "assistant",
      content: data.response,
    };

    setMessages((prev) => [...prev, aiMsg]);
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    console.error("Error al enviar mensaje:", err);
  } finally {
    setIsLoading(false);
  }
};

  const handleFileClick = () => fileInputRef.current?.click();

  return (
    <MasterPage>
      <div className="chat-container">
        <div className="chat-box">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`msg-bubble ${
                msg.role === "user" ? "user" : "assistant"
              }`}
            >
              <div className="msg-content" style={{ whiteSpace: "pre-line" }}>
  {msg.content}
</div>
              {msg.files?.length ? (
                <ul className="file-list">
                  {msg.files.map((f, idx) => (
                    <li key={idx}>📎 {f.name}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        <div className="chat-input-bar">
          <textarea
            placeholder="Escribe tu consulta legal..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              !e.shiftKey &&
              (e.preventDefault(), sendMessage())
            }
          />
          <div className="actions">
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              style={{ display: "none" }}
            />
            <button className="attach-btn" onClick={handleFileClick}>
              📎
            </button>
            <button className="send-btn" onClick={sendMessage}>
              {isLoading ? "..." : "Enviar"}
            </button>
          </div>
        </div>
      </div>
    </MasterPage>
  );
}
