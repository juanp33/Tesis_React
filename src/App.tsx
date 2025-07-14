import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegistroPage from './RegistroPage'; // Asegurate que este archivo exista
import PerfilPage from './PerfilPage';
import TranscripcionPage from './TranscripcionPage'; 
import OCRPage from './OcrPage';
import AuthGuard from "./components/AuthGuard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/perfil" element={ <AuthGuard><PerfilPage /></AuthGuard>} />
        <Route path="/transcripcion" element={ <AuthGuard><TranscripcionPage /> </AuthGuard>} />
        <Route path="/ocr" element={ <AuthGuard><OCRPage /></AuthGuard>} />
       
      </Routes>
    </Router>
  );
}

export default App;







