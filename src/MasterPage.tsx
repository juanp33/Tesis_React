import React from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "./MasterPage.css";

interface MasterPageProps {
  children: ReactNode;
}

const MasterPage = ({ children }: MasterPageProps) => {
  return (
    <div className="container">
      <aside className="sidebar">
        <Link to="/perfil" className="nav-item">
          <span className="icon">👤</span>
          <span className="label">Perfil</span>
        </Link>
        <Link to="/transcripcion" className="nav-item">
          <span className="icon">🎙️</span>
          <span className="label">Transcripción</span>
        </Link>
        <Link to="/redaccion" className="nav-item">
          <span className="icon">✍️</span>
          <span className="label">Redacción Asistida</span>
        </Link>
        <Link to="/chatbot" className="nav-item">
          <span className="icon">💬</span>
          <span className="label">ChatBot Jurídico</span>
        </Link>
        <Link to="/busqueda" className="nav-item">
          <span className="icon">🔍</span>
          <span className="label">Búsqueda Normativa</span>
        </Link>
        <Link to="/ocr" className="nav-item">
          <span className="icon">🧾</span>
          <span className="label">OCR</span>
        </Link>
      </aside>
      <main className="content">
        {children}
      </main>
    </div>
  );
};

export default MasterPage;
