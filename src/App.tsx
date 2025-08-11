import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegistroPage from './RegistroPage';
import PerfilPage from './PerfilPage';
import TranscripcionPage from './TranscripcionPage';
import OCRPage from './OcrPage';
import RedaccionAutomatica from './RedactorAutomatico';
import AuthGuard from "./components/AuthGuard";

// CRUDs y utilidades
import AbogadoCRUD from "./crudes/AbogadoCrud";
import PermisoCRUD from "./crudes/PermisoCrud";
import RolCRUD from "./crudes/RolCrud";
import UsuarioCRUD from "./crudes/UsuarioCrud";

import AsignarPermisosPorRol from "./crudes/AsignarPermisosPorRol";

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />

        {/* Rutas privadas: */}
        <Route
          path="/*"
          element={
            <AuthGuard>
           
                <Routes>
                  <Route path="/perfil" element={<PerfilPage />} />
                  <Route path="/redactorautomatico" element={<RedaccionAutomatica />} />
                  <Route path="/transcripcion" element={<TranscripcionPage />} />
                  <Route path="/ocr" element={<OCRPage />} />

                  {/* CRUDs y administración */}
                  <Route path="/abogados" element={<AbogadoCRUD />} />
                  <Route path="/permisos" element={<PermisoCRUD />} />
                  <Route path="/roles" element={<RolCRUD />} />
                  <Route path="/usuarios" element={<UsuarioCRUD />} />
                 
                  <Route path="/asignar-permisos" element={<AsignarPermisosPorRol />} />

                  {/* Página por defecto (dashboard) */}
                  <Route path="*" element={<div>Bienvenido al sistema</div>} />
                </Routes>
              
            </AuthGuard>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
