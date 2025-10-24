import React, { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../styles/MasterPage.css";
import { tienePermiso } from "../utils/PermisosHelper";

// ===== ICONOS =====
import HomeLogo from "../logos/HomeLogo-removebg-preview.png";
import MicLogo from "../logos/MicLogo-removebg-preview.png";
import PencilLogo from "../logos/PencilLogo-removebg-preview.png";
import ChatLogo from "../logos/ChatLogo-removebg-preview.png";
import ZoomLogo from "../logos/ZoomLogo-removebg-preview.png";
import Resumidor from "../logos/resumido2r.png";
import Transformar from "../logos/transforma2.png";
import AbogadoInteligenteLogo from "../logos/AbogadoInteligenteLogo.png";
import ConfigLogo from "../assets/configuracion.png";

interface MasterPageProps {
  children: ReactNode;
}

const MasterPage = ({ children }: MasterPageProps) => {
  const [adminOpen, setAdminOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Cierra el menú de administración al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAdminOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cierra los menús al cambiar de página
  useEffect(() => {
    setAdminOpen(false);
    setMenuOpen(false);
  }, [location]);

  return (
    <div className="mp-container">
      {/* ===== HEADER SUPERIOR ===== */}
      <header className="mp-header mp-topbar">
        <div className="mp-brand">
          <img
            src={AbogadoInteligenteLogo}
            alt="Logo Abogado Inteligente"
            className="mp-brand-img"
          />
        </div>

        {/* ===== BOTÓN HAMBURGUESA ===== */}
        <button
          className={`mp-burger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* ===== NAVEGACIÓN ===== */}
        <nav className={`mp-topnav ${menuOpen ? "open" : ""}`}>
          {/* Inicio — todos pueden verlo */}
          <NavLink
            to="/perfil"
            className={({ isActive }) =>
              "mp-toplink" + (isActive ? " active" : "")
            }
          >
            <img src={HomeLogo} alt="" className="mp-topicon" /> Inicio
          </NavLink>

          {/* Funcionalidades visibles según permisos */}
          {tienePermiso("Transcripcion") && (
            <NavLink
              to="/transcripcion"
              className={({ isActive }) =>
                "mp-toplink" + (isActive ? " active" : "")
              }
            >
              <img src={MicLogo} alt="" className="mp-topicon" /> Transcripción
            </NavLink>
          )}

          {tienePermiso("Redaccion Asistida") && (
            <NavLink
              to="/redactorautomatico"
              className={({ isActive }) =>
                "mp-toplink" + (isActive ? " active" : "")
              }
            >
              <img src={PencilLogo} alt="" className="mp-topicon" /> Redacción Asistida
            </NavLink>
          )}

          {tienePermiso("ChatBot") && (
            <NavLink
              to="/chatbot"
              className={({ isActive }) =>
                "mp-toplink" + (isActive ? " active" : "")
              }
            >
              <img src={ChatLogo} alt="" className="mp-topicon" /> ChatBot Jurídico
            </NavLink>
          )}

          {tienePermiso("Resumidor") && (
            <NavLink
              to="/resumidor"
              className={({ isActive }) =>
                "mp-toplink" + (isActive ? " active" : "")
              }
            >
              <img src={Resumidor} alt="" className="mp-topicon" /> Resumidor
            </NavLink>
          )}

          {tienePermiso("OCR") && (
            <NavLink
              to="/ocr"
              className={({ isActive }) =>
                "mp-toplink" + (isActive ? " active" : "")
              }
            >
              <img src={ZoomLogo} alt="" className="mp-topicon" /> OCR
            </NavLink>
          )}

          {tienePermiso("Transformar Documento") && (
            <NavLink
              to="/transformardocumento"
              className={({ isActive }) =>
                "mp-toplink" + (isActive ? " active" : "")
              }
            >
              <img src={Transformar} alt="" className="mp-topicon" /> Transformar Documento
            </NavLink>
          )}

          {/* ===== ADMINISTRACIÓN ===== */}
          {(tienePermiso("Abogado CRUD") ||
            tienePermiso("Usuario Crud") ||
            tienePermiso("Roles Crud") ||
            tienePermiso("Permisos") ||
            tienePermiso("Asignar permisos a rol")) && (
            <div className="mp-admin-top" ref={dropdownRef}>
              <button
                className="mp-toplink mp-admin-btn"
                onClick={() => setAdminOpen((v) => !v)}
              >
                <img
                  src={ConfigLogo}
                  alt="Administración"
                  className="mp-config-icon"
                />
                Administración{" "}
                <span className="mp-arrow">{adminOpen ? "▲" : "▼"}</span>
              </button>

              {adminOpen && (
                <div className="mp-admin-dropdown">
                  {tienePermiso("Abogado CRUD") && (
                    <NavLink to="/abogados" className="mp-admin-link">
                      Abogados
                    </NavLink>
                  )}
                  {tienePermiso("Usuario Crud") && (
                    <NavLink to="/usuarios" className="mp-admin-link">
                      Usuarios
                    </NavLink>
                  )}
                  {tienePermiso("Roles Crud") && (
                    <NavLink to="/roles" className="mp-admin-link">
                      Roles
                    </NavLink>
                  )}
                  {tienePermiso("Permisos") && (
                    <NavLink to="/permisos" className="mp-admin-link">
                      Permisos
                    </NavLink>
                  )}
                  {tienePermiso("Asignar permisos a rol") && (
                    <NavLink to="/asignar-permisos" className="mp-admin-link">
                      Asignar Permisos a Rol
                    </NavLink>
                  )}
                  {tienePermiso("Usuario Crud") && (
                    <NavLink to="/asignar-roles" className="mp-admin-link">
                      Asignar Roles a Usuario
                    </NavLink>
                  )}
                </div>
              )}
            </div>
          )}
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
