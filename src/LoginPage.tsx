import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();


  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username: email,
        password: password
      });

      const token = response.data.token;
      localStorage.setItem('jwt', token);
      alert('Inicio de sesión exitoso');

       navigate("/perfil"); // ✅ redirección al perfil
      // Redirigir si querés:
      // window.location.href = '/dashboard';

    } catch (err) {
      console.log(err);
      setError('Credenciales inválidas. Intenta nuevamente.');
    }
  };

  return (
    <div className="container">
      <div className="left">
        <h1>
          Bienvenido.<br />
          <span>Ingresa para continuar</span>
        </h1>
      </div>
      <div className="right">
        <div className="form-box">
          <h2>Iniciar sesión</h2>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <a href="#" className="forgot">Olvidé mi contraseña</a>
          <button onClick={handleLogin}>Iniciar sesión</button>
          {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
          <p>
            ¿Aún no estás registrado? <Link to="/registro">Registrarse</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
