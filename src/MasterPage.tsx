import React, { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import "./MasterPage.css";

import HomeLogo from "./logos/HomeLogo-removebg-preview.png";
import MicLogo from "./logos/MicLogo-removebg-preview.png";
import PencilLogo from "./logos/PencilLogo-removebg-preview.png";
import ChatLogo from "./logos/ChatLogo-removebg-preview.png";
import ZoomLogo from "./logos/ZoomLogo-removebg-preview.png";
import Resumidor from "./logos/resumido2r.png";
import Transformar from "./logos/transforma2.png";
import AbogadoInteligenteLogo from "./logos/AbogadoInteligenteLogo.png"; 
interface MasterPageProps {
  children: ReactNode;
}

type Item = {
  to: string;
  label: string;
  icon: string;
};

const ITEMS: Item[] = [
  { to: "/perfil", label: "Dashboard", icon: HomeLogo },
  { to: "/transcripcion", label: "Transcripcion", icon: MicLogo },
  { to: "/redactorautomatico", label: "Redaccion Asistida", icon: PencilLogo },
  { to: "/chatbot", label: "ChatBot Juridico", icon: ChatLogo },
  { to: "/resumidor", label: "Resumidor", icon: Resumidor },
  { to: "/ocr", label: "OCR", icon: ZoomLogo },
  { to: "/transformardocumento", label: "Transformar Documento", icon: Transformar }
];

const MasterPage = ({ children }: MasterPageProps) => {
  const [adminOpen, setAdminOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setAdminOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    setAdminOpen(false);
  }, [location]);

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <div className="mp-container">
      <aside className="mp-sidebar">
        {ITEMS.map((it) => (
          <Link key={it.to} to={it.to} className={`mp-item ${isActive(it.to) ? "active" : ""}`}>
            <img src={it.icon} alt="" className="mp-icon" />
            <span className="mp-label">{it.label}</span>
          </Link>
        ))}

        <div
          className={`mp-item mp-admin ${adminOpen ? "open" : ""}`}
          ref={dropdownRef}
          onClick={() => setAdminOpen((v) => !v)}
        >
          <div className="mp-admin-row">
            <span className="mp-gear">⚙️</span>
            <span className="mp-label">Administración</span>
            <span className="mp-arrow">{adminOpen ? "▲" : "▼"}</span>
          </div>

          {adminOpen && (
            <div className="mp-admin-menu">
              <Link to="/abogados" className="mp-admin-link">Abogados</Link>
              <Link to="/usuarios" className="mp-admin-link">Usuarios</Link>
              <Link to="/roles" className="mp-admin-link">Roles</Link>
              <Link to="/permisos" className="mp-admin-link">Permisos</Link>
              <Link to="/rolpermisos" className="mp-admin-link">RolPermisos</Link>
              <Link to="/asignar-permisos" className="mp-admin-link">Asignar Permisos a Rol</Link>
            </div>
          )}
        </div>
      </aside>

     <main className="mp-content">
  <header className="mp-header">
    <img
      src={AbogadoInteligenteLogo}
      alt="Abogado Inteligente"
      className="mp-header-logo"
    />
  </header>
  <div className="mp-body">{children}</div>
</main>
    </div>
  );
};

export default MasterPage;