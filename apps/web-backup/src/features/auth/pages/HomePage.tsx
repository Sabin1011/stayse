import { useNavigate } from "react-router-dom";
import { useLogout } from "../../auth/hooks/useLogout";

export default function HomePage() {
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <main>
      <h1>Welcome to Stayse</h1>
      <p>Discover your next stay.</p>

      <button onClick={handleLogout}>
        Logout
      </button>
    </main>
  );
}