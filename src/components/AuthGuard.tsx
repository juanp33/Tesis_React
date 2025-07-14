import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Props {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: Props) => {
  const navigate = useNavigate();
  const [autorizado, setAutorizado] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("/");
      return;
    }

    axios
      .get("http://localhost:8080/api/auth/validar-token", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setAutorizado(true))
      .catch(() => {
        localStorage.removeItem("jwt");
        navigate("/login");
      });
  }, [navigate]);

  if (autorizado === null) return <p>Cargando...</p>;

  return <>{children}</>;
};

export default AuthGuard;
