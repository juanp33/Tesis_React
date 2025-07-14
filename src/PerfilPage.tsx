import { useEffect, useState } from 'react';
import axios from 'axios';
import './PerfilPage.css';
import MasterPage from './MasterPage';

interface Usuario {
  id: number;
  username: string;
  email: string;
}

const PerfilPage = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('jwt');

    if (!token) {
      setError('No estás autenticado');
      return;
    }

    axios
      .get('http://localhost:8080/api/usuario/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUsuario(response.data);
      })
      .catch((err) => {
        console.error(err);
        setError('No se pudo obtener la información del usuario');
      });
  }, []);

  return (
    <MasterPage>
      <div className="perfil-container">
        <h2>Perfil del Usuario</h2>
        {error && <p className="error-msg">{error}</p>}
        {usuario ? (
          <>
            <div className="perfil-card">
              <p><span className="label">ID:</span> {usuario.id}</p>
              <p><span className="label">Username:</span> {usuario.username}</p>
              <p><span className="label">Email:</span> {usuario.email}</p>
            </div>
            <div className="perfil-actions">
              <button onClick={() => alert('Ir a configuración')}>Configuración</button>
              <button
                onClick={() => {
                  localStorage.removeItem('jwt');
                  window.location.reload();
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </>
        ) : !error ? (
          <p className="cargando">Cargando...</p>
        ) : null}
      </div>
    </MasterPage>
  );
};

export default PerfilPage;
