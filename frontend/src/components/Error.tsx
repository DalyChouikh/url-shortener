import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Error() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const error = searchParams.get('error');

  const getErrorMessage = () => {
    switch (error) {
      case 'not_found':
        return 'The page you are looking for does not exist.';
      case 'authentication_failed':
        return 'Authentication failed. Please try again.';
      default:
        return 'An unexpected error occurred.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Oops! Something went wrong
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getErrorMessage()}
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate('/')}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go back home
          </button>
        </div>
      </div>
    </div>
  );
}
