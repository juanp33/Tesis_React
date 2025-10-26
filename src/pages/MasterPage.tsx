import React, { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../styles/MasterPage.css";
import IfPermiso from "../components/IfPermiso";
import { usePermisos } from "../context/PermisosContext";

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
  const { cargando, permisos } = usePermisos();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAdminOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setAdminOpen(false);
    setMenuOpen(false);
  }, [location]);

  if (cargando) {
    return (
      <div className="mp-loading">
        <h3>Cargando permisos...</h3>
      </div>
    );
  }

  // ✅ Verificamos si tiene al menos un permiso de administración
  const tieneAlgunoDeAdmin = [
    "Abogado CRUD",
    "Usuario Crud",
    "Roles Crud",
    "Permisos",
    "Asignar permisos a rol",
  ].some((p) => permisos.includes(p));

  return (
    <div className="mp-container">
      <header className="mp-header mp-topbar">
        <div className="mp-brand">
          <img
            src={AbogadoInteligenteLogo}
            alt="Logo Abogado Inteligente"
            className="mp-brand-img"
          />
        </div>

        <button
          className={`mp-burger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`mp-topnav ${menuOpen ? "open" : ""}`}>
          <NavLink
            to="/perfil"
            className={({ isActive }) =>
              "mp-toplink" + (isActive ? " active" : "")
            }
          >
            <img src={HomeLogo} alt="" className="mp-topicon" /> Inicio
          </NavLink>

          <IfPermiso nombre="Transcripcion">
            <NavLink
              to="/transcripcion"
              className={({ isActive }) =>
                "mp-toplink" + (isActive ? " active" : "")
              }
            >
              <img src={MicLogo} alt="" className="mp-topicon" /> Transcripción
            </NavLink>
          </IfPermiso>

          <IfPermiso nombre="Redaccion Asistida">
            <NavLink
              to="/redactorautomatico"
              className={({ isActive }) =>
                "mp-toplink" + (isActive ? " active" : "")
              }
            >
              <img src={PencilLogo} alt="" className="mp-topicon" /> Redacción Asistida
            </NavLink>
          </IfPermiso>

          <IfPermiso nombre="ChatBot">
            <NavLink
              to="/chatbot"
              className={({ isActive }) =>
                "mp-toplink" + (isActive ? " active" : "")
              }
            >
              <img src={ChatLogo} alt="" className="mp-topicon" /> ChatBot Jurídico
            </NavLink>
          </IfPermiso>

          <IfPermiso nombre="Resumidor">
            <NavLink
              to="/resumidor"
              className={({ isActive }) =>
                "mp-toplink" + (isActive ? " active" : "")
              }
            >
              <img src={Resumidor} alt="" className="mp-topicon" /> Resumidor
            </NavLink>
          </IfPermiso>

          <IfPermiso nombre="OCR">
            <NavLink
              to="/ocr"
              className={({ isActive }) =>
                "mp-toplink" + (isActive ? " active" : "")
              }
            >
              <img src={ZoomLogo} alt="" className="mp-topicon" /> OCR
            </NavLink>
          </IfPermiso>

          <IfPermiso nombre="Transformar Documento">
            <NavLink
              to="/transformardocumento"
              className={({ isActive }) =>
                "mp-toplink" + (isActive ? " active" : "")
              }
            >
              <img src={Transformar} alt="" className="mp-topicon" /> Transformar Documento
            </NavLink>
          </IfPermiso>

          {/* ✅ Mostrar Administración solo si tiene permisos */}
          {tieneAlgunoDeAdmin && (
            <div className="mp-admin-top" ref={dropdownRef}>
              <button
                className="mp-toplink mp-admin-btn"
                onClick={() => setAdminOpen((v) => !v)}
              >
                <img src={ConfigLogo} alt="Administración" className="mp-config-icon" />
                Administración <span className="mp-arrow">{adminOpen ? "▲" : "▼"}</span>
              </button>

              {adminOpen && (
                <div className="mp-admin-dropdown">
                  <IfPermiso nombre="Abogado CRUD">
                    <NavLink to="/abogados" className="mp-admin-link">Abogados</NavLink>
                  </IfPermiso>
                  <IfPermiso nombre="Usuario Crud">
                    <NavLink to="/usuarios" className="mp-admin-link">Usuarios</NavLink>
                  </IfPermiso>
                  <IfPermiso nombre="Roles Crud">
                    <NavLink to="/roles" className="mp-admin-link">Roles</NavLink>
                  </IfPermiso>
                  <IfPermiso nombre="Permisos">
                    <NavLink to="/permisos" className="mp-admin-link">Permisos</NavLink>
                  </IfPermiso>
                  <IfPermiso nombre="Asignar permisos a rol">
                    <NavLink to="/asignar-permisos" className="mp-admin-link">Asignar Permisos a Rol</NavLink>
                  </IfPermiso>
                  <IfPermiso nombre="Usuario Crud">
                    <NavLink to="/asignar-roles" className="mp-admin-link">Asignar Roles a Usuario</NavLink>
                  </IfPermiso>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      <main className="mp-content">
        <div className="mp-body">{children}</div>
      </main>
    </div>
  );
};

export default MasterPage;
