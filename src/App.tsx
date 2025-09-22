import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegistroPage from './RegistroPage';
import PerfilPage from './PerfilPage';
import TranscripcionPage from './TranscripcionPage';
import OCRPage from './OcrPage';
import RedaccionAutomatica from './RedactorAutomatico';
import AuthGuard from "./components/AuthGuard";
import ChatPage from './ChatPage';

import CasoDetallePage from './CasoDetallePage';
import TransformarDocumento from './TransformarDocumento';
import ResumenDocumentos from './ResumenDocumentos';
// CRUDs y utilidades
import AbogadoCRUD from "./crudes/AbogadoCrud";
import PermisoCRUD from "./crudes/PermisoCrud";
import RolCRUD from "./crudes/RolCrud";
import UsuarioCRUD from "./crudes/UsuarioCrud";
import AgregarClientePage from './AgregarClientePage';
import AsignarPermisosPorRol from "./crudes/AsignarPermisosPorRol";
import ClienteDetallePage from "./ClienteDetallePage";
import NuevoCasoPage from "./NuevoCasoPage";
function App() {
  return (
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
                  <Route path="/redactorautomatico" element={<RedaccionAutomatica />} />
                  <Route path="/transcripcion" element={<TranscripcionPage />} />
                  <Route path="/ocr" element={<OCRPage />} />
                  <Route path="/chatbot" element={<ChatPage />} />
                  <Route path="/agregar-cliente" element={<AgregarClientePage />} />
                  <Route path="/abogados" element={<AbogadoCRUD />} />
                  <Route path="/permisos" element={<PermisoCRUD />} />
                  <Route path="/roles" element={<RolCRUD />} />
                  <Route path="/usuarios" element={<UsuarioCRUD />} />
                  <Route path="/clientes/:id" element={<ClienteDetallePage />} />
                  <Route path="/asignar-permisos" element={<AsignarPermisosPorRol />} />
                   <Route path="/clientes/:id/nuevo-caso" element={<NuevoCasoPage />} />
                   <Route path="/transformardocumento" element={<TransformarDocumento />} />
                  <Route path="/resumidor" element={<ResumenDocumentos />} />
                  {/* Página por defecto (dashboard) */}
                  <Route path="/*" element={<PerfilPage />} />
                </Routes>
              
            </AuthGuard>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
