import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
      <p className="text-lg mb-6 max-w-lg">
        You don't have permission to access this page. If you believe this is an
        error, please contact the administrators.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={() => navigate("/")} variant="default">
          Return to Home
        </Button>
        <Button onClick={() => navigate("/profile")} variant="outline">
          Go to Profile
        </Button>
      </div>
    </div>
  );
}
