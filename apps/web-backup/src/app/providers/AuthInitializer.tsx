import { useEffect, type ReactNode } from "react";

import { useAppDispatch } from "../store/hooks";

import {
  setAccessToken,
  setUser,
  clearCredentials,
  setInitialized,
} from "../store/authSlice";

import {
  refreshAccessToken,
  getCurrentUser,
} from "../../services/api/authApi";

interface AuthInitializerProps {
  children: ReactNode;
}

let initializationPromise: Promise<void> | null = null;

export default function AuthInitializer({
  children,
}: AuthInitializerProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!initializationPromise) {
      initializationPromise = refreshAccessToken()
        .then(async (response) => {
          // Restore access token.
          dispatch(setAccessToken(response.accessToken));

          // Retrieve authenticated user's profile and roles.
          const currentUserResponse = await getCurrentUser();

          dispatch(setUser(currentUserResponse.user));
        })
        .catch(() => {
          dispatch(clearCredentials());
        })
        .finally(() => {
          dispatch(setInitialized(true));
        });
    }
  }, [dispatch]);

  return children;
}