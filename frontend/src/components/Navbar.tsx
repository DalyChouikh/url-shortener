import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from "../../public/gdg-logo.png";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="flex items-center justify-between p-4 border-b-2 border-gray-200">
      <div className="flex items-center">
        <Link to="/" className="flex items-center text-gray-600 hover:text-black transition-colors">
          <img src={logo} alt="GDG Logo" className="w-16 h-10 mr-4" />
          <h1 className="text-xl font-medium">Google Developer Groups</h1>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link
              to="/shorten"
              className="text-gray-600 hover:text-black transition-colors"
            >
              URL Shortener
            </Link>
            <Link
              to="/profile"
              className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
            >
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <span>{user.name}</span>
            </Link>
          </>
        ) : (
          <a
            href="http://localhost:8080/auth/login"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Login
          </a>
        )}
      </div>
    </nav>
  );
}
