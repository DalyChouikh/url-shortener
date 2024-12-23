import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import About from "./components/About";
import ShortLinkGenerator from "./components/ShortLinkGenerator";
import Profile from "./components/Profile";
import AuthCallback from "./components/AuthCallback";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import Error from "./components/Error";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<About />} />
        <Route path="/callback" element={<AuthCallback />} />
        <Route
          path="/shorten"
          element={
            <ProtectedRoute>
              <div className="container flex justify-center items-center mx-auto px-4 py-8">
                <ShortLinkGenerator />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/error" element={<Error />} />
        <Route path="*" element={<Navigate to="/error?error=not_found" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
