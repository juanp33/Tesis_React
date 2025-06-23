
import './RegistroPage.css';

const RegistroPage = () => {
  return (
    <div className="registro-container">
      <div className="registro-left">
        <h1>
          Bienvenido.<br />
          <span>¡Comienza tu camino ahora con nuestro sistema de IA!</span>
        </h1>
      </div>
      <div className="registro-right">
        <div className="form-box">
          <h2>Crear una cuenta</h2>
          <input type="email" placeholder="Correo electrónico" />
          <div className="input-password">
            <input type="password" placeholder="Escribe tu contraseña" />
            <span className="toggle-visibility">👁️</span>
          </div>
          <a href="#" className="forgot">¿Olvidaste tu contraseña?</a>
          <button>Crear cuenta</button>
          <p>¿Ya tienes una cuenta? <a href="#">Iniciar sesión</a></p>
        </div>
      </div>
    </div>
  );
};

export default RegistroPage;
