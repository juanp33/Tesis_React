import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PermisosProvider } from "./context/PermisosContext"; // ✅ IMPORTANTE

import LoginPage from "./pages/LoginPage";
import RegistroPage from "./pages/RegistroPage";
import PerfilPage from "./pages/PerfilPage";
import TranscripcionPage from "./pages/TranscripcionPage";
import OCRPage from "./pages/OcrPage";
import RedaccionAutomatica from "./pages/RedactorAutomatico";
import AuthGuard from "./components/AuthGuard";
import ChatPage from "./pages/ChatPage";
import RutaProtegida from "./components/RutaProtegida";

import CasoDetallePage from "./pages/CasoDetallePage";
import TransformarDocumento from "./pages/TransformarDocumento";
import ResumenDocumentos from "./pages/ResumenDocumentos";

// CRUDs y utilidades
import AbogadoCRUD from "./crudes/AbogadoCrud";
import PermisoCRUD from "./crudes/PermisoCrud";
import RolCRUD from "./crudes/RolCrud";
import UsuarioCRUD from "./crudes/UsuarioCrud";
import AgregarClientePage from "./pages/AgregarClientePage";
import AsignarPermisosPorRol from "./crudes/AsignarPermisosPorRol";
import ClienteDetallePage from "./pages/ClienteDetallePage";
import NuevoCasoPage from "./pages/NuevoCasoPage";
import AsignarRolesAUsuario from "./crudes/AsignarRolesAUsuario";

function App() {
  return (
    // ✅ Envolvemos toda la app con el provider
    <PermisosProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />

          <Route
            path="/*"
            element={
              <AuthGuard>
                <Routes>
                  <Route path="/casos/:id" element={<CasoDetallePage />} />
                  <Route path="/perfil" element={<PerfilPage />} />

                  {/* === FUNCIONALIDADES CON PERMISOS === */}
                  <Route
                    path="/redactorautomatico"
                    element={
                      <RutaProtegida permiso="Redaccion Asistida">
                        <RedaccionAutomatica />
                      </RutaProtegida>
                    }
                  />
                  <Route
                    path="/transcripcion"
                    element={
                      <RutaProtegida permiso="Transcripcion">
                        <TranscripcionPage />
                      </RutaProtegida>
                    }
                  />
                  
                  <Route
                    path="/ocr"
                    element={
                      <RutaProtegida permiso="OCR">
                        <OCRPage />
                      </RutaProtegida>
                    }
                  />
                  <Route
                    path="/chatbot"
                    element={
                      <RutaProtegida permiso="ChatBot">
                        <ChatPage />
                      </RutaProtegida>
                    }
                  />
                  <Route
                    path="/resumidor"
                    element={
                      <RutaProtegida permiso="Resumidor">
                        <ResumenDocumentos />
                      </RutaProtegida>
                    }
                  />
                  <Route
                    path="/transformardocumento"
                    element={
                      <RutaProtegida permiso="Transformar Documento">
                        <TransformarDocumento />
                      </RutaProtegida>
                    }
                  />

                  {/* === ADMINISTRACIÓN === */}
                  <Route
                    path="/abogados"
                    element={
                      <RutaProtegida permiso="Abogado CRUD">
                        <AbogadoCRUD />
                      </RutaProtegida>
                    }
                  />
                  <Route
                    path="/usuarios"
                    element={
                      <RutaProtegida permiso="Usuario Crud">
                        <UsuarioCRUD />
                      </RutaProtegida>
                    }
                  />
                  <Route
                    path="/roles"
                    element={
                      <RutaProtegida permiso="Roles Crud">
                        <RolCRUD />
                      </RutaProtegida>
                    }
                  />
                  <Route
                    path="/permisos"
                    element={
                      <RutaProtegida permiso="Permisos">
                        <PermisoCRUD />
                      </RutaProtegida>
                    }
                  />
                  <Route
                    path="/asignar-permisos"
                    element={
                      <RutaProtegida permiso="Asignar permisos a rol">
                        <AsignarPermisosPorRol />
                      </RutaProtegida>
                    }
                  />
                  <Route
                    path="/asignar-roles"
                    element={
                      <RutaProtegida permiso="Asignar roles a usuario">
                        <AsignarRolesAUsuario />
                      </RutaProtegida>
                    }
                  />

                  {/* === CLIENTES Y CASOS === */}
                  <Route path="/agregar-cliente" element={<AgregarClientePage />} />
                  <Route path="/clientes/:id" element={<ClienteDetallePage />} />
                  <Route path="/clientes/:id/nuevo-caso" element={<NuevoCasoPage />} />

                  {/* Página por defecto */}
                  <Route path="/*" element={<PerfilPage />} />
                </Routes>
              </AuthGuard>
            }
          />
        </Routes>
      </Router>
    </PermisosProvider>
  );
}

export default App;
