export const cerrarSesion = () => {
  localStorage.removeItem("jwt");
  localStorage.removeItem("permisos");
  window.location.href = "/"; // 🔁 redirige al login
};