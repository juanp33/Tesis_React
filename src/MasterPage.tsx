// src/components/MasterPage.tsx
import React, { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import "./MasterPage.css";

interface MasterPageProps {
  children: ReactNode;
}

const MasterPage = ({ children }: MasterPageProps) => {
  const [adminOpen, setAdminOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Cerrar el dropdown si se hace click fuera de él
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setAdminOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Opcional: cerrar al navegar a otra ruta
  useEffect(() => {
    setAdminOpen(false);
  }, [location]);

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

        {/* --- BOTÓN ADMINISTRACIÓN --- */}
        <div
          className="nav-item admin-dropdown"
          ref={dropdownRef}
          onClick={() => setAdminOpen((open) => !open)}
        >
          <span className="icon">⚙️</span>
          <span className="label">Administración</span>
          <span className="arrow">{adminOpen ? "▲" : "▼"}</span>

          {adminOpen && (
            <div className="admin-menu">
              <Link to="/abogados" className="admin-link">
                Abogados
              </Link>
              <Link to="/usuarios" className="admin-link">
                Usuarios
              </Link>
              <Link to="/roles" className="admin-link">
                Roles
              </Link>
              <Link to="/permisos" className="admin-link">
                Permisos
              </Link>
              <Link to="/rolpermisos" className="admin-link">
                RolPermisos
              </Link>
              <Link to="/asignar-permisos" className="admin-link">
                Asignar Permisos a Rol
              </Link>
            </div>
          )}
        </div>
        {/* ------------------------- */}
      </aside>
      <main className="content">{children}</main>
    </div>
  );
};

export default MasterPage;
