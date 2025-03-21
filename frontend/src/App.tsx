import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Layout from "@/components/Layout";
import Home from "@/components/Home";
import About from "@/components/About";
import AuthCallback from "@/components/AuthCallback";
import Profile from "@/components/Profile";
import AdminDashboard from "@/components/AdminDashboard";
import LeaderDashboard from "@/components/LeaderDashboard";
import Unauthorized from "@/components/Unauthorized";
import Settings from "@/components/Settings";
import ShortLinkGenerator from "./components/ShortLinkGenerator";
import URLList from "@/components/URLList";
import NotFound from "@/components/NotFound";
import UserDetail from "@/components/UserDetail";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="callback" element={<AuthCallback />} />
            <Route path="unauthorized" element={<Unauthorized />} />

            {/* URL shortener - protected for Core Team and above */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["SUPER_ADMIN", "GDGC_LEAD", "CORE_TEAM"]}
                />
              }
            >
              <Route path="shorten" element={<ShortLinkGenerator />} />
              <Route path="urls" element={<URLList />} />
            </Route>

            {/* User profile - accessible to all authenticated users */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "SUPER_ADMIN",
                    "GDGC_LEAD",
                    "CORE_TEAM",
                    "COMMUNITY",
                  ]}
                />
              }
            >
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Admin dashboard - protected for Super Admin only */}
            <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/users/:userId" element={<UserDetail />} />
            </Route>

            {/* Leader dashboard - protected for Super Admin and GDGC Lead */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN", "GDGC_LEAD"]} />
              }
            >
              <Route path="leader" element={<LeaderDashboard />} />
              <Route path="leader/users/:userId" element={<UserDetail />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
