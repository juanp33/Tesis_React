import React, { useState } from "react";
import MasterPage from "./MasterPage";
import ChatSideBar from "../components/ChatSideBar";
import ChatArea from "../components/ChatArea";
import "../styles/chatpage.css";

export default function ChatPage() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  return (
    <MasterPage>
      <div className="chat-layout">
        <ChatSideBar
          onSelectChat={setActiveChatId}
          selectedChatId={selectedChatId}
        />
        <ChatArea chatId={activeChatId} />
      </div>
    </MasterPage>
  );
}