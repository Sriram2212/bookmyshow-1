import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  const getPosterUrl = (movie) => {
    if (movie.posterUrl) return movie.posterUrl;
    return `https://picsum.photos/seed/${movie.title}/300/450.jpg`;
  };

  const getGenreColor = (genre) => {
    const colors = {
      'Action': 'bg-red-100 text-red-700',
      'Comedy': 'bg-yellow-100 text-yellow-700',
      'Drama': 'bg-blue-100 text-blue-700',
      'Horror': 'bg-purple-100 text-purple-700',
      'Romance': 'bg-pink-100 text-pink-700',
      'Thriller': 'bg-gray-100 text-gray-700',
      'Sci-Fi': 'bg-indigo-100 text-indigo-700',
      'Animation': 'bg-green-100 text-green-700',
    };
    return colors[genre] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Link
      to={`/movie/${movie._id}`}
      className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
    >
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={getPosterUrl(movie)}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = `https://picsum.photos/seed/fallback/300/450.jpg`;
          }}
        />
        
        {/* Overlay with rating */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
          <span className="text-yellow-400">⭐</span>
          <span className="text-white text-sm font-semibold">{movie.rating || 'N/A'}</span>
        </div>

        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
              <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {movie.title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
            </svg>
            {movie.duration} min
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            {movie.language || 'EN'}
          </span>
        </div>

        {/* Genres */}
        {movie.genre && movie.genre.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {movie.genre.slice(0, 3).map((g, idx) => (
              <span
                key={idx}
                className={`px-2 py-1 text-xs font-medium rounded-full ${getGenreColor(g)}`}
              >
                {g}
              </span>
            ))}
            {movie.genre.length > 3 && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                +{movie.genre.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default MovieCard;
