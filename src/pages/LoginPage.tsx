import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // lo dejamos, por si querés leer info del token
import "../styles/LoginPage.css";
import LogoNegro from "../assets/logo-negro.png";
import { usePermisos } from "../context/PermisosContext"; 

// 👇 Tipo para el contenido del token JWT
interface JwtPayload {
  id?: number;
  sub?: string;
  username?: string;
}

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
    const { refrescarPermisos } = usePermisos();

  const handleLogin = async () => {
    try {
      // 🧹 Limpieza previa
      localStorage.removeItem("jwt");
      localStorage.removeItem("permisos"); // ya no se usa, pero se limpia por si quedó de sesiones viejas

      // 🔹 Autenticación
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        username: email,
        password: password,
      });

      const token = response.data.token;
      localStorage.setItem("jwt", token);

      await refrescarPermisos();

      // 🔍 (opcional) decodificamos el token para mostrar algo, pero sin pedir permisos
      const decoded: JwtPayload = jwtDecode(token);
      console.log("Usuario autenticado:", decoded);

      // 🚫 🔴 SE ELIMINÓ este bloque:
      // - GET /usuarios/{id}/permisos
      // - localStorage.setItem("permisos", ...)
      // porque ahora los permisos se consultan dinámicamente desde el back
      // en el componente IfPermiso y en RequirePermiso

      alert("Inicio de sesión exitoso ✅");
      navigate("/perfil");
    } catch (err) {
      console.error(err);
      setError("❌ Credenciales inválidas. Intenta nuevamente.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="header">
        <img src={LogoNegro} alt="Logo UruguAI Legal" className="logo" />
        <h1>Bienvenido</h1>
        <p>Ingresa para continuar</p>
      </div>

      <div className="form-box">
        <h2>Iniciar sesión</h2>

        <input
          type="email"
          placeholder="Usuario"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <a href="#" className="forgot">
          Olvidé mi contraseña
        </a>
        <button onClick={handleLogin}>Iniciar sesión</button>

        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

        <p>
          ¿Aún no estás registrado? <Link to="/registro">Registrarse</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
