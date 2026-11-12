import { useEffect, useRef } from "react";

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme: "outline";
              size: "large";
              text: "continue_with";
              shape: "rectangular";
          }
          ) => void;
        };
      };
    };
  }
}

function GoogleSignInButton({
  onSuccess,
  onError,
  disabled = false,
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;

    const initializeGoogle = () => {
      if (!window.google || !buttonRef.current) {
        onError("Google Sign-In could not be loaded.");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (!response.credential) {
            onError("Google did not return an ID token.");
            return;
          }

          onSuccess(response.credential);
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
      });
    };

    if (window.google) {
      initializeGoogle();
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", initializeGoogle);
      return () => {
        existingScript.removeEventListener("load", initializeGoogle);
      };
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    script.onerror = () => onError("Failed to load Google Sign-In.");

    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [onSuccess, onError, disabled]);

  return <div ref={buttonRef} className="flex justify-center" />;
}

export default GoogleSignInButton;