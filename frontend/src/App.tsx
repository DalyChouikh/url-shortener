import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "@/components/Navbar";
import Home from "@/components/Home";
import ShortLinkGenerator from "@/components/ShortLinkGenerator";
import Profile from "@/components/Profile";
import AuthCallback from "@/components/AuthCallback";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import Error from "@/components/Error";
import Settings from "@/components/Settings";
import Footer from "@/components/Footer";
import About from "@/components/About";

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
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
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/error" element={<Error />} />
          <Route
            path="*"
            element={<Navigate to="/error?error=not_found" replace />}
          />
        </Routes>
      </div>
      <Footer />
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
      <ToastContainer limit={3} />
    </>
  );
}

export default App;
