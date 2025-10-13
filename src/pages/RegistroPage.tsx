import { useState } from "react";
import axios from "axios";
import "../styles/RegistroPage.css";
import { useNavigate } from "react-router-dom";
import LogoNegro from "../assets/logo-negro.png"; // ✅ Ajustá la ruta según tu estructura

const RegistroPage = () => {
  const [username, setUsername] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [ci, setCi] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post(
        "http://localhost:8080/api/auth/register",
        { username, email, password, nombre, apellido, ci },
        { headers: { "Content-Type": "application/json" } }
      );

      setMensaje("✅ Usuario y abogado creados con éxito");
      setError("");
      navigate("/login");
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError("❌ Error al registrar usuario/abogado");
      }
      setMensaje("");
    }
  };

  return (
    <div className="registro-wrapper">
      <div className="header">
        <img src={LogoNegro} alt="Logo Abogado Inteligente" className="logo" />
        <h1>Bienvenido</h1>
        <p>¡Comienza tu camino ahora con nuestro sistema de IA!</p>
      </div>

      <div className="form-box">
        <h2>Crear una cuenta</h2>

        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="CI"
          value={ci}
          onChange={(e) => setCi(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="input-password">
          <input
            type={mostrarPassword ? "text" : "password"}
            placeholder="Escribe tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="toggle-visibility"
            onClick={() => setMostrarPassword(!mostrarPassword)}
          >
            {mostrarPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <a href="#" className="forgot">¿Olvidaste tu contraseña?</a>
        <button onClick={handleRegister}>Crear cuenta</button>

        {mensaje && <p style={{ color: "green", marginTop: "1rem" }}>{mensaje}</p>}
        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

        <p>
          ¿Ya tienes una cuenta? <a href="/login">Iniciar sesión</a>
        </p>
      </div>
    </div>
  );
};

export default RegistroPage;
