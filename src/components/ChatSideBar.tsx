import React, { useEffect, useState } from "react";
import "./ChatSideBar.css";

interface Chat {
  chatId: string;
  title: string;
  lastUpdated: string;
}

interface ChatSideBarProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId?: string | null;
}

export default function ChatSideBar({
  onSelectChat,
  selectedChatId,
}: ChatSideBarProps) {
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

  const deleteChat = async (chatId: string) => {
    if (!window.confirm("¿Eliminar este chat definitivamente?")) return;

    await fetch(`http://localhost:8080/api/chats/${chatId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setChats((prev) => prev.filter((c) => c.chatId !== chatId));
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={newChat}>
          + Nuevo Chat
        </button>
        <p className="limit-info">{chats.length} chats guardados</p>
      </div>

      <div className="chat-list">
        <h4 className="chat-section-title">Mis chats</h4>
        {chats.length === 0 ? (
          <p className="empty-msg">No hay chats guardados</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.chatId}
              className={`chat-item ${
                selectedChatId === chat.chatId ? "active" : ""
              }`}
              onClick={() => onSelectChat(chat.chatId)}
            >
              <span className="chat-title">💬 {chat.title}</span>
              <span
                className="delete-x"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.chatId);
                }}
              >
                ✕
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}