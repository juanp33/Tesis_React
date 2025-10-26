// src/pages/LoginPage.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/LoginPage.css";
import LogoNegro from "../assets/logo-negro.png";
import { usePermisos } from "../context/PermisosContext"; // ✅ para refrescar permisos tras JWT

type Paso = "credenciales" | "otp";

const LoginPage = () => {
  const [paso, setPaso] = useState<Paso>("credenciales");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [txId, setTxId] = useState<string | null>(null);
  const [emailMasked, setEmailMasked] = useState<string>("");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { refrescarPermisos } = usePermisos(); // ✅

  const handleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      localStorage.removeItem("jwt");

      // Paso 1: credenciales → /api/auth/login
      const resp = await axios.post("http://localhost:8080/api/auth/login", {
        username: email,
        password: password,
      });

      // Respuesta: { twoFactor: true, txId, emailMasked }
      if (resp.data?.twoFactor && resp.data?.txId) {
        setTxId(resp.data.txId);
        setEmailMasked(resp.data.emailMasked || "");
        setPaso("otp");
      } else if (resp.data?.token) {
        // (por si en algún entorno devolvés token directo)
        localStorage.setItem("jwt", resp.data.token);
        await refrescarPermisos();
        navigate("/perfil");
      } else {
        setError("Respuesta inesperada del servidor.");
      }
    } catch (err: any) {
      console.error(err);
      setError("❌ Credenciales inválidas.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!txId) return;
    try {
      setError(null);
      setLoading(true);

      const resp = await axios.post("http://localhost:8080/api/auth/verify-otp", {
        txId,
        code: otp.trim(),
      });

      if (resp.data?.token) {
        localStorage.setItem("jwt", resp.data.token);
        await refrescarPermisos(); // ✅ cargar permisos ya mismo
        alert("Inicio de sesión exitoso ✅");
        navigate("/perfil");
      } else {
        setError("No se recibió token.");
      }
    } catch (err: any) {
      console.error(err);
      setError("❌ Código inválido o expirado.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!txId) return;
    try {
      setError(null);
      setLoading(true);
      const resp = await axios.post("http://localhost:8080/api/auth/resend-otp", { txId });
      if (resp.data?.txId) {
        setTxId(resp.data.txId);
        setEmailMasked(resp.data.emailMasked || emailMasked);
        setOtp("");
        alert("Se reenvió el código a " + (resp.data.emailMasked || emailMasked));
      } else {
        setError("No se pudo reenviar el código.");
      }
    } catch (err) {
      console.error(err);
      setError("Error al reenviar el código.");
    } finally {
      setLoading(false);
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

        {paso === "credenciales" && (
          <>
            <input
              type="email"
              placeholder="Usuario"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <a href="#" className="forgot">Olvidé mi contraseña</a>
            <button onClick={handleLogin} disabled={loading}>
              {loading ? "Validando..." : "Iniciar sesión"}
            </button>
          </>
        )}

        {paso === "otp" && (
          <>
            <p>Te enviamos un código a <b>{emailMasked || "tu correo"}</b></p>
            <input
              type="text"
              placeholder="Código de 6 dígitos"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              disabled={loading}
            />
            <button onClick={handleVerifyOtp} disabled={loading || otp.trim().length !== 6}>
              {loading ? "Verificando..." : "Verificar código"}
            </button>
            <button onClick={handleResend} disabled={loading} style={{ marginTop: 8 }}>
              Reenviar código
            </button>
            <button
              onClick={() => { setPaso("credenciales"); setOtp(""); setTxId(null); }}
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              Volver
            </button>
          </>
        )}

        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

        {paso === "credenciales" && (
          <p>
            ¿Aún no estás registrado? <Link to="/registro">Registrarse</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
