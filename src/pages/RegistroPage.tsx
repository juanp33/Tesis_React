import { useState } from "react";
import axios from "axios";
import "../styles/RegistroPage.css";
import { useNavigate } from "react-router-dom";
import LogoNegro from "../assets/logo-negro.png";

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

  // 🔹 Función para validar cédula uruguaya
  const validarCedulaUruguaya = (ci: string): boolean => {
    // Eliminar puntos y guiones
    ci = ci.replace(/[^\d]/g, "");

    // Debe tener entre 7 y 8 dígitos
    if (ci.length < 7 || ci.length > 8) return false;

    // Si tiene 7 dígitos, se agrega un cero al inicio
    if (ci.length === 7) ci = "0" + ci;

    const coef = [2, 9, 8, 7, 6, 3, 4];
    let suma = 0;

    for (let i = 0; i < 7; i++) {
      suma += parseInt(ci[i]) * coef[i];
    }

    const digitoVerificador = (10 - (suma % 10)) % 10;
    return digitoVerificador === parseInt(ci[7]);
  };

  const handleRegister = async () => {
    // 🔹 Validar cédula antes de enviar
    if (!validarCedulaUruguaya(ci)) {
      setError("❌ La cédula ingresada no es válida en Uruguay.");
      setMensaje("");
      return;
    }

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
    // Si el backend devuelve un objeto con "mensaje"
    if (err.response.data.mensaje) {
      setError(err.response.data.mensaje);
    } 
    // Si devuelve un string plano
    else if (typeof err.response.data === "string") {
      setError(err.response.data);
    } 
    else {
      setError("❌ Error desconocido en el registro.");
    }
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
          placeholder="Cédula de identidad"
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