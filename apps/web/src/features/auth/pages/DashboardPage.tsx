import { useNavigate } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";

export default function DashboardPage() {
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div>
      <h1>Stayse Dashboard</h1>

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
