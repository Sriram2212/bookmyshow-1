import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieService } from '../services/movieService';

const MovieShows = () => {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchShows();
  }, [movieId]);

  const fetchShows = async () => {
    try {
      setLoading(true);
      const response = await movieService.getShowsByMovie(movieId);
      if (response.success) {
        setMovie(response.data.movie);
        setShows(response.data.shows);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load shows');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading shows...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Movie not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← Back to Movies
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {movie.posterUrl ? (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full md:w-48 h-64 object-cover rounded"
              />
            ) : (
              <div className="w-full md:w-48 h-64 flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600 rounded">
                <span className="text-white text-4xl font-bold">{movie.title.charAt(0)}</span>
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{movie.title}</h1>
              {movie.description && (
                <p className="text-gray-600 mb-4">{movie.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>Duration: {movie.duration} min</span>
                <span>Language: {movie.language}</span>
                {movie.rating > 0 && <span>Rating: ⭐ {movie.rating}</span>}
              </div>
              {movie.genre && movie.genre.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {movie.genre.map((g, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Shows</h2>

        {shows.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg">No shows available for this movie.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {shows.map((show) => (
              <div
                key={show._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {show.theater?.name || 'Theater'}
                    </h3>
                    <p className="text-gray-600 text-sm mb-1">
                      {show.theater?.address?.city || ''} • {show.screen}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-gray-700 font-medium">
                        {formatDate(show.showDate)}
                      </span>
                      <span className="text-primary-600 font-semibold">
                        {formatTime(show.showTime)}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/show/${show._id}`}
                    className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-center"
                  >
                    Select Seats
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieShows;

