import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const error = searchParams.get("error");

      if (error) {
        navigate("/?error=" + error);
        return;
      }

      try {
        await refreshUser();
        navigate("/profile");
      } catch (error) {
        navigate("/?error=authentication_failed");
      }
    };

    handleCallback();
  }, [navigate, refreshUser, searchParams]);

  return <div>Authenticating...</div>;
}
