import React, { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../styles/MasterPage.css";

import HomeLogo from "../logos/HomeLogo-removebg-preview.png";
import MicLogo from "../logos/MicLogo-removebg-preview.png";
import PencilLogo from "../logos/PencilLogo-removebg-preview.png";
import ChatLogo from "../logos/ChatLogo-removebg-preview.png";
import ZoomLogo from "../logos/ZoomLogo-removebg-preview.png";
import Resumidor from "../logos/resumido2r.png";
import Transformar from "../logos/transforma2.png";
import AbogadoInteligenteLogo from "../logos/AbogadoInteligenteLogo.png";
import ConfigLogo from "../assets/configuracion.png"; // ⚙️ Imagen de configuración

interface MasterPageProps {
  children: ReactNode;
}

const MasterPage = ({ children }: MasterPageProps) => {
  const [adminOpen, setAdminOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setAdminOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    setAdminOpen(false);
  }, [location]);

  return (
    <div className="mp-container">
      {/* ===== HEADER SUPERIOR ===== */}
      <header className="mp-header mp-topbar">
        <div className="mp-brand">
          <img src={AbogadoInteligenteLogo} alt="Logo Abogado Inteligente" className="mp-brand-img" />
        </div>

        {/* ===== NAVEGACIÓN ===== */}
        <nav className="mp-topnav">
          <NavLink to="/perfil" className={({ isActive }) => "mp-toplink" + (isActive ? " active" : "")}>
            <img src={HomeLogo} alt="" className="mp-topicon" /> Inicio
          </NavLink>

          <NavLink to="/transcripcion" className={({ isActive }) => "mp-toplink" + (isActive ? " active" : "")}>
            <img src={MicLogo} alt="" className="mp-topicon" /> Transcripción
          </NavLink>

          <NavLink to="/redactorautomatico" className={({ isActive }) => "mp-toplink" + (isActive ? " active" : "")}>
            <img src={PencilLogo} alt="" className="mp-topicon" /> Redacción Asistida
          </NavLink>

          <NavLink to="/chatbot" className={({ isActive }) => "mp-toplink" + (isActive ? " active" : "")}>
            <img src={ChatLogo} alt="" className="mp-topicon" /> ChatBot Jurídico
          </NavLink>

          <NavLink to="/resumidor" className={({ isActive }) => "mp-toplink" + (isActive ? " active" : "")}>
            <img src={Resumidor} alt="" className="mp-topicon" /> Resumidor
          </NavLink>

          <NavLink to="/ocr" className={({ isActive }) => "mp-toplink" + (isActive ? " active" : "")}>
            <img src={ZoomLogo} alt="" className="mp-topicon" /> OCR
          </NavLink>

          <NavLink to="/transformardocumento" className={({ isActive }) => "mp-toplink" + (isActive ? " active" : "")}>
            <img src={Transformar} alt="" className="mp-topicon" /> Transformar Documento
          </NavLink>

          {/* ===== ADMINISTRACIÓN ===== */}
          <div className="mp-admin-top" ref={dropdownRef}>
            <button className="mp-toplink mp-admin-btn" onClick={() => setAdminOpen((v) => !v)}>
              <img src={ConfigLogo} alt="Administración" className="mp-config-icon" />
              Administración <span className="mp-arrow">{adminOpen ? "▲" : "▼"}</span>
            </button>

            {adminOpen && (
              <div className="mp-admin-dropdown">
                <NavLink to="/abogados" className="mp-admin-link">Abogados</NavLink>
                <NavLink to="/usuarios" className="mp-admin-link">Usuarios</NavLink>
                <NavLink to="/roles" className="mp-admin-link">Roles</NavLink>
                <NavLink to="/permisos" className="mp-admin-link">Permisos</NavLink>
                <NavLink to="/rolpermisos" className="mp-admin-link">RolPermisos</NavLink>
                <NavLink to="/asignar-permisos" className="mp-admin-link">Asignar Permisos a Rol</NavLink>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main className="mp-content">
        <div className="mp-body">{children}</div>
      </main>
    </div>
  );
};

export default MasterPage;
