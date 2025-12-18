import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { authService } from './services/authService';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MovieShows from './pages/MovieShows';
import SeatSelection from './components/SeatSelection';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import PrivateRoute from './utils/PrivateRoute';

function App() {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="bg-white/90 backdrop-blur shadow-sm border-b border-gray-100 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <Link to="/" className="flex items-center gap-2 text-primary-700 font-bold text-2xl">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                    🎟️
                  </span>
                  BookMyShow
                </Link>
              </div>
              <div className="flex items-center gap-3">
                {isAuthenticated ? (
                  <>
                    <span className="hidden sm:inline text-sm text-gray-600">
                      Welcome, <span className="font-semibold text-gray-800">{user?.name || 'User'}</span>
                    </span>
                    <Link
                      to="/"
                      className="px-3 py-2 text-sm font-medium text-primary-700 hover:text-primary-800 transition-colors"
                    >
                      Movies
                    </Link>
                    <Link
                      to="/my-bookings"
                      className="px-3 py-2 text-sm font-medium text-primary-700 hover:text-primary-800 transition-colors"
                    >
                      My Bookings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-700 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/movie/:movieId" element={<MovieShows />} />
            <Route
              path="/show/:showId"
              element={
                <PrivateRoute>
                  <SeatSelection />
                </PrivateRoute>
              }
            />
            <Route
              path="/booking/:bookingId"
              element={
                <PrivateRoute>
                  <BookingConfirmation />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <PrivateRoute>
                  <MyBookings />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

