import { useEffect, useState } from "react";
import MasterPage from "./MasterPage";
import "../styles/AgregarClientePage.css";

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  ci: string;
  email: string;
}

const AgregarClientePage = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [ci, setCi] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [todosClientes, setTodosClientes] = useState<Cliente[]>([]);
  const [misClientes, setMisClientes] = useState<Cliente[]>([]);
  const [clientesDisponibles, setClientesDisponibles] = useState<Cliente[]>([]);

  const token = localStorage.getItem("jwt");

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:8080/clientes/all", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setTodosClientes(data))
      .catch(() => setTodosClientes([]));

    fetch("http://localhost:8080/clientes", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setMisClientes(data))
      .catch(() => setMisClientes([]));
  }, [token]);

  useEffect(() => {
    if (todosClientes.length > 0) {
      const misIds = new Set(misClientes.map((c) => c.id));
      const disponibles = todosClientes.filter((c) => !misIds.has(c.id));
      setClientesDisponibles(disponibles);
    }
  }, [todosClientes, misClientes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch {
      setMensaje("❌ Hubo un error al registrar el cliente");
    }
  };

  const vincularCliente = async (clienteId: number) => {
    if (!token) {
      setMensaje("⚠️ No estás autenticado");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/clientes/${clienteId}/vincular`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error al vincular cliente");

      setMensaje("✅ Cliente vinculado correctamente");
      setClientesDisponibles(clientesDisponibles.filter((c) => c.id !== clienteId));
    } catch {
      setMensaje("❌ Hubo un error al vincular el cliente");
    }
  };

  return (
    <MasterPage>
      <div className="agregar-cliente-wrapper">
        <div className="agregar-cliente-container">
          <h2>Agregar Cliente</h2>
          {mensaje && <p className="mensaje">{mensaje}</p>}

          <form className="agregar-cliente-form" onSubmit={handleSubmit}>
            <label>Nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />

            <label>Apellido</label>
            <input value={apellido} onChange={(e) => setApellido(e.target.value)} required />

            <label>CI</label>
            <input value={ci} onChange={(e) => setCi(e.target.value)} required />

            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit">Guardar Cliente</button>
          </form>

          <div className="vincular-clientes">
            <h3>Vincular Cliente Existente</h3>
            {clientesDisponibles.length > 0 ? (
              <div className="clientes-lista">
                {clientesDisponibles.map((c) => (
                  <div key={c.id} className="cliente-card">
                    <p>
                      <b>
                        {c.nombre} {c.apellido}
                      </b>
                    </p>
                    <p>CI: {c.ci}</p>
                    <p>Email: {c.email}</p>
                    <button onClick={() => vincularCliente(c.id)}>Vincular</button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay clientes disponibles para vincular.</p>
            )}
          </div>
        </div>
      </div>
    </MasterPage>
  );
};

export default AgregarClientePage;
