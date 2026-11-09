import { useAppDispatch } from "../../../app/store/hooks";
import { clearCredentials } from "../../../app/store/authSlice";
import { logoutUser } from "../../../services/api/authApi";

export function useLogout() {
  const dispatch = useAppDispatch();

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      dispatch(clearCredentials());
    }
  };

  return logout;
}