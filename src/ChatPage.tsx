import React, { useState } from "react";
import MasterPage from "./MasterPage";
import ChatSideBar from "./components/ChatSideBar";
import ChatArea from "./components/ChatArea";
import "./chatpage.css";

export default function ChatPage() {
  // Estado compartido entre ambos componentes
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  return (
    <MasterPage>
      <div className="chat-layout">
        {/* Pasamos los props necesarios */}
        <ChatSideBar
          onSelectChat={setActiveChatId}
          selectedChatId={selectedChatId}
        />
        <ChatArea chatId={activeChatId} />
      </div>
    </MasterPage>
  );
}