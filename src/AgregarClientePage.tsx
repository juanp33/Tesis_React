import { useState } from "react";
import MasterPage from "./MasterPage";
import "./AgregarClientePage.css";

const AgregarClientePage = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [ci, setCi] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("jwt");
    if (!token) {
      setMensaje("⚠️ No estás autenticado");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre, apellido, ci, email }),
      });

      if (!response.ok) throw new Error("Error al registrar cliente");

      setMensaje("✅ Cliente registrado correctamente");
      setNombre("");
      setApellido("");
      setCi("");
      setEmail("");
    } catch (error) {
      setMensaje("❌ Hubo un error al registrar el cliente");
    }
  };

  return (
    <MasterPage>
      <div className="agregar-cliente-container">
        <h2>➕ Agregar Cliente</h2>

        {mensaje && <p className="mensaje">{mensaje}</p>}

        <form className="agregar-cliente-form" onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <label>Apellido</label>
          <input
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
          />

          <label>CI</label>
          <input
            type="text"
            value={ci}
            onChange={(e) => setCi(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit">Guardar Cliente</button>
        </form>
      </div>
    </MasterPage>
  );
};

export default AgregarClientePage;