import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/LoginPage.css";
import LogoNegro from "../assets/logo-negro.png";
import { usePermisos } from "../context/PermisosContext";

type Paso = "credenciales" | "otp" | "recuperar" | "reset";

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
  const { refrescarPermisos } = usePermisos();

  
  useEffect(() => {
    setEmail("");
    setPassword("");
    setOtp("");
    setError(null);
  }, [paso]);

  // ================== LOGIN ==================
  const handleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      localStorage.removeItem("jwt");

      const resp = await axios.post("http://localhost:8080/api/auth/login", {
        username: email,
        password: password,
      });

      if (resp.data?.twoFactor && resp.data?.txId) {
        setTxId(resp.data.txId);
        setEmailMasked(resp.data.emailMasked || "");
        setPaso("otp");
      } else if (resp.data?.token) {
        localStorage.setItem("jwt", resp.data.token);
        await refrescarPermisos();
        navigate("/perfil");
      } else {
        setError("Respuesta inesperada del servidor.");
      }
    } catch {
      setError("❌ Credenciales inválidas.");
    } finally {
      setLoading(false);
    }
  };

  // ================== VERIFICAR OTP ==================
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
        await refrescarPermisos();
        alert("Inicio de sesión exitoso ✅");
        navigate("/perfil");
      } else {
        setError("No se recibió token.");
      }
    } catch {
      setError("❌ Código inválido o expirado.");
    } finally {
      setLoading(false);
    }
  };

  // ================== REENVIAR CÓDIGO (Login y Reset) ==================
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
    } catch {
      setError("Error al reenviar el código.");
    } finally {
      setLoading(false);
    }
  };

  // ================== RECUPERAR CONTRASEÑA ==================
  const handleForgotPassword = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await axios.post("http://localhost:8080/api/auth/forgot-password", { email });
      setTxId(resp.data.txId);
      setEmailMasked(resp.data.emailMasked);
      setPaso("reset");
      alert(resp.data.mensaje);
    } catch {
      setError("❌ No se pudo enviar el código.");
    } finally {
      setLoading(false);
    }
  };

  // ================== RESETEAR CONTRASEÑA ==================
  const handleResetPassword = async () => {
    try {
      setLoading(true);
      setError(null);
      await axios.post("http://localhost:8080/api/auth/reset-password", {
        txId,
        code: otp.trim(),
        password,
      });
      alert("✅ Contraseña restablecida. Ahora puedes iniciar sesión.");
      setPaso("credenciales");
      setOtp("");
      setPassword("");
    } catch {
      setError("❌ Código inválido o error al restablecer contraseña.");
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
        {/* 🔹 TÍTULO DINÁMICO */}
        <h2>
          {paso === "credenciales" && "Ingrese el email del usuario"}
          {paso === "otp" && "Esperando código de verificación"}
          {paso === "recuperar" && "Recuperar contraseña"}
          {paso === "reset" && "Restablecer contraseña"}
        </h2>

        {/* === Paso 1: Credenciales === */}
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
            <a href="#" className="forgot" onClick={() => setPaso("recuperar")}>
              Olvidé mi contraseña
            </a>
            <button onClick={handleLogin} disabled={loading}>
              {loading ? "Validando..." : "Iniciar sesión"}
            </button>
          </>
        )}

        {/* === Paso 2: OTP === */}
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
              onClick={() => {
                setPaso("credenciales");
                setOtp("");
                setTxId(null);
              }}
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              Volver
            </button>
          </>
        )}

        {/* === Paso 3: Recuperar contraseña === */}
        {paso === "recuperar" && (
          <>
            <p>Ingresa tu correo y te enviaremos un código para restablecer tu contraseña.</p>
            <input
              type="email"
              placeholder="Correo registrado"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <button onClick={handleForgotPassword} disabled={loading || !email}>
              {loading ? "Enviando..." : "Enviar código"}
            </button>
            <button
              onClick={() => setPaso("credenciales")}
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              Volver
            </button>
          </>
        )}

        {/* === Paso 4: Resetear contraseña === */}
        {paso === "reset" && (
          <>
            <p>Revisa tu correo <b>{emailMasked || email}</b> e ingresa el código recibido.</p>
            <input
              type="text"
              placeholder="Código de 6 dígitos"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              onClick={handleResetPassword}
              disabled={loading || otp.length !== 6 || password.trim().length < 4}
            >
              {loading ? "Actualizando..." : "Cambiar contraseña"}
            </button>

            {/* 🔁 Reenviar código solo acá */}
            <button onClick={handleResend} disabled={loading} style={{ marginTop: 8 }}>
              Reenviar código
            </button>

            <button
              onClick={() => setPaso("credenciales")}
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
