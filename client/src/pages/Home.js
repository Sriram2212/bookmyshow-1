import { movieService } from '../services/movieService';
import MovieCard from '../components/UI/MovieCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
// In Home.js, either remove the Link import:
import { useState, useEffect } from 'react';
// Remove this line if not using Link:
// import { Link } from 'react-router-dom';

// Or if you plan to use it later, add this comment:
// eslint-disable-next-line no-unused-vars
import { Link } from 'react-router-dom';
const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await movieService.getMovies();
      if (response.success) {
        setMovies(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || movie.genre?.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  const allGenres = ['all', ...new Set(movies.flatMap(movie => movie.genre || []))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="xl" text="Loading amazing movies..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <EmptyState
          title="Oops! Something went wrong"
          description={error}
          action={
            <button
              onClick={fetchMovies}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Book Your Perfect Movie Experience
            </h1>
            <p className="text-xl text-indigo-100 mb-8">
              Discover the latest movies and book tickets in seconds
            </p>
            
            {/* Search and Filter */}
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for movies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 pr-12 text-gray-900 bg-white rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300"
                />
                <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {allGenres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedGenre === genre
                        ? 'bg-white text-indigo-600 shadow-lg'
                        : 'bg-indigo-500/20 text-white hover:bg-indigo-500/30'
                    }`}
                  >
                    {genre === 'all' ? 'All Movies' : genre}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredMovies.length === 0 ? (
          <EmptyState
            title="No movies found"
            description="Try adjusting your search or filters to find what you're looking for."
            action={
              <button
                onClick={() => { setSearchTerm(''); setSelectedGenre('all'); }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Clear Filters
              </button>
            }
          />
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {searchTerm || selectedGenre !== 'all' ? 'Search Results' : 'Now Showing'}
              </h2>
              <p className="text-gray-600 mt-1">
                {filteredMovies.length} {filteredMovies.length === 1 ? 'movie' : 'movies'} available
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;