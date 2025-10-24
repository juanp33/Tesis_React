import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/LoginPage.css";
import LogoNegro from "../assets/logo-negro.png";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [codigo, setCodigo] = useState(""); // Código 2FA
  const [show2FA, setShow2FA] = useState(false); // Mostrar popup
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const navigate = useNavigate();

  // 🔹 LOGIN INICIAL (usuario + contraseña)
  const handleLogin = async () => {
    setError(null);
    setMensaje(null);

    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        username,
        password,
      });

      if (response.data.status === "2FA_REQUIRED") {
        setMensaje(response.data.mensaje);
        setShow2FA(true);
      } else {
        setError("Respuesta inesperada del servidor.");
      }
    } catch (err: any) {
      setError(err.response?.data?.mensaje || "Error en el inicio de sesión.");
    }
  };

  // 🔹 VERIFICAR CÓDIGO 2FA
  const handleVerificar2FA = async () => {
    if (codigo.trim().length !== 6) {
      setError("El código debe tener 6 dígitos.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/auth/verificar-2fa", {
        username,
        codigo,
      });

      if (response.data.token) {
        // ✅ Guardar token y datos en localStorage
        localStorage.setItem("jwt", response.data.token);
        localStorage.setItem("username", response.data.username);

        if (response.data.permisos) {
          localStorage.setItem("permisos", JSON.stringify(response.data.permisos));
        }

        setMensaje("✅ Verificación exitosa, redirigiendo...");
        setTimeout(() => navigate("/perfil"), 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.mensaje || "Código incorrecto o expirado.");
    }
  };

  // 🔹 CANCELAR POPUP (si lo cierra debe volver a loguearse)
  const handleCerrarPopup = () => {
    setShow2FA(false);
    setUsername("");
    setPassword("");
    setCodigo("");
    localStorage.removeItem("jwt");
    setError("⚠️ Debes iniciar sesión nuevamente.");
  };

  return (
    <div className="login-wrapper">
      <img src={LogoNegro} alt="Logo" className="logo" />

      <div className="header">
        <h1>Bienvenido</h1>
        <p>Iniciá sesión en tu cuenta</p>
      </div>

      <div className="form-box">
        <h2>Iniciar Sesión</h2>

        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error-msg">{error}</p>}
        {mensaje && <p className="mensaje-ok">{mensaje}</p>}

        <button onClick={handleLogin}>Ingresar</button>

        <p className="register-text">
          ¿No tienes una cuenta? <Link to="/registro">Regístrate</Link>
        </p>
      </div>

      {/* 🔐 Popup de verificación 2FA */}
      {show2FA && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>🔐 Verificación en dos pasos</h3>
            <p>Ingresá el código que enviamos a tu correo.</p>

            <input
              type="text"
              placeholder="Código de 6 dígitos"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              maxLength={6}
            />

            {error && <p className="error-msg">{error}</p>}
            {mensaje && <p className="mensaje-ok">{mensaje}</p>}

            <div className="modal-buttons">
              <button className="btn-primary" onClick={handleVerificar2FA}>
                Verificar
              </button>
              <button className="btn-secondary" onClick={handleCerrarPopup}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
