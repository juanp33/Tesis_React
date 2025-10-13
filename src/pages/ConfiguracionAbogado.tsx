import { useEffect, useState } from "react";
import axios from "axios";
import MasterPage from "./MasterPage";
import "../styles/ConfiguracionAbogado.css";

interface Abogado {
  id: number;
  nombre: string;
  apellido: string;
  ci: string;
  email: string;
}

const ConfiguracionAbogado = () => {
  const [abogado, setAbogado] = useState<Abogado | null>(null);
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [ciValida, setCiValida] = useState<boolean | null>(null);

  const API_URL = "http://localhost:8080/abogados";

  const validarCI = (ci: string): boolean => {
    const limpio = ci.replace(/\D/g, "");
    if (limpio.length < 7 || limpio.length > 8) return false;
    const digitos = limpio.padStart(8, "0").split("").map(Number);
    const factores = [2, 9, 8, 7, 6, 3, 4];
    const suma = factores.reduce((acc, f, i) => acc + f * digitos[i], 0);
    const verificador = (10 - (suma % 10)) % 10;
    return verificador === digitos[7];
  };

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    axios
      .get("http://localhost:8080/api/usuario/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async (res) => {
        const usuario = res.data;
        // Buscar abogado asociado
        const abogadosRes = await axios.get(`${API_URL}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const encontrado = abogadosRes.data.find(
          (a: Abogado) => a.email === usuario.email
        );
        if (encontrado) setAbogado(encontrado);
      })
      .catch(() => setError("No se pudo obtener el abogado"));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!abogado) return;
    const { name, value } = e.target;
    setAbogado({ ...abogado, [name]: value });
    if (name === "ci") {
      setCiValida(value.length > 0 ? validarCI(value) : null);
    }
  };

  const handleGuardar = async () => {
    if (!abogado) return;
    setError("");
    setMensaje("");

    if (!validarCI(abogado.ci)) {
      setError("La cédula ingresada no es válida.");
      return;
    }

    try {
      const token = localStorage.getItem("jwt");
      const res = await axios.put(`${API_URL}/${abogado.id}`, abogado, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        setMensaje("Cambios guardados correctamente.");
        setEditando(false);
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("La cédula ya está registrada en otro abogado.");
      } else {
        setError("Error al guardar los cambios.");
      }
    }
  };

  return (
    <MasterPage>
      <div className="config-page">
        <h2>Configuración del Abogado</h2>

        {!abogado ? (
          <p>Cargando datos...</p>
        ) : (
          <div className="config-card">
            <label>Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={abogado.nombre}
              onChange={handleChange}
              disabled={!editando}
            />

            <label>Apellido:</label>
            <input
              type="text"
              name="apellido"
              value={abogado.apellido}
              onChange={handleChange}
              disabled={!editando}
            />

            <label>Cédula de Identidad:</label>
            <input
              type="text"
              name="ci"
              value={abogado.ci}
              onChange={handleChange}
              disabled={!editando}
            />
            {ciValida === true && <p className="ci-valid">Cédula válida</p>}
            {ciValida === false && <p className="ci-invalid">Cédula inválida</p>}

            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={abogado.email}
              onChange={handleChange}
              disabled={!editando}
            />

            {error && <p className="error-msg">{error}</p>}
            {mensaje && <p className="success-msg">{mensaje}</p>}

            <div className="config-buttons">
              {!editando ? (
                <button onClick={() => setEditando(true)}>Editar</button>
              ) : (
                <>
                  <button onClick={handleGuardar}>Guardar</button>
                  <button onClick={() => setEditando(false)}>Cancelar</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </MasterPage>
  );
};

export default ConfiguracionAbogado;
