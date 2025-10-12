import React, { useEffect, useState } from "react";
import "./ChatSideBar.css";

interface Chat {
  chatId: string;
  title: string;
  lastUpdated: string;
}

interface ChatSideBarProps {
  onSelectChat: (chatId: string) => void;
   selectedChatId?: string | null; //
}

export default function ChatSideBar({ onSelectChat }: ChatSideBarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const token = localStorage.getItem("jwt");

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:8080/api/chats/mis-chats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setChats)
      .catch(() => setChats([]));
  }, []);

  // ➕ Crear un nuevo chat con nombre
  const newChat = async () => {
    const title = prompt("📝 Ingrese un nombre para el nuevo chat:")?.trim();
    if (!title) return;

    const res = await fetch("http://localhost:8080/api/chats/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        chatId: "session_" + Date.now(),
        title,
      }),
    });
    const created = await res.json();
    setChats((prev) => [created, ...prev]);
    onSelectChat(created.chatId);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={newChat}>
          + Nuevo Chat
        </button>
        <p className="limit-info">{chats.length} chats guardados</p>
      </div>

      <div className="sidebar-section">
        <h4>Mis chats</h4>
        {chats.length === 0 ? (
          <p>No hay chats guardados</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.chatId}
              className="chat-item"
              onClick={() => onSelectChat(chat.chatId)}
            >
              💬 {chat.title}
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <button onClick={handleLogout}>Cerrar sesión</button>
      </div>
    </div>
  );
}
