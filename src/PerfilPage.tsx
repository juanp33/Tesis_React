import { useEffect, useState } from 'react';
import axios from 'axios';

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
    <div style={{ padding: '2rem', fontFamily: 'Segoe UI, sans-serif' }}>
      <h2>Perfil del Usuario</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {usuario ? (
        <div>
          <p><strong>ID:</strong> {usuario.id}</p>
          <p><strong>Username:</strong> {usuario.username}</p>
          <p><strong>Email:</strong> {usuario.email}</p>
        </div>
      ) : !error ? (
        <p>Cargando...</p>
      ) : null}
    </div>
  );
};

export default PerfilPage;
