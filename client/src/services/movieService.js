import api from '../utils/api';

export const movieService = {
  async getMovies() {
    const response = await api.get('/movies');
    return response.data;
  },

  async getMovieById(id) {
    const response = await api.get(`/movies/${id}`);
    return response.data;
  },

  async getShowsByMovie(movieId, date = null) {
    const params = date ? { date } : {};
    const response = await api.get(`/shows/movie/${movieId}`, { params });
    return response.data;
  },

  async getShowById(showId) {
    const response = await api.get(`/shows/${showId}`);
    return response.data;
  }
};

