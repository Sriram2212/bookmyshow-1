import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('movies');
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  // Movies state
  const [movies, setMovies] = useState([]);
  const [newMovie, setNewMovie] = useState({
    title: '',
    description: '',
    genre: '',
    duration: '',
    releaseDate: '',
    rating: 0,
    posterUrl: '',
    language: 'English'
  });

  // Theaters state
  const [theaters, setTheaters] = useState([]);
  const [newTheater, setNewTheater] = useState({
    name: '',
    address: { street: '', city: '', state: '', zipCode: '' },
    totalScreens: 1,
    amenities: ''
  });

  // Shows state
  const [shows, setShows] = useState([]);
  const [newShow, setNewShow] = useState({
    movie: '',
    theater: '',
    screen: '',
    showTime: '',
    endTime: '',
    basePrice: ''
  });

  const [stats, setStats] = useState({
    totalMovies: 0,
    totalTheaters: 0,
    totalShows: 0,
    totalBookings: 0,
    totalRevenue: 0
  });

  const API_URL = 'https://bookmyshow-1-three.vercel.app';

  // Check if already logged in
  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      fetchStats();
      fetchMovies();
      fetchTheaters();
      fetchShows();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setToken(data.token);
        setIsLoggedIn(true);
        setUsername('');
        setPassword('');
        fetchStats();
        fetchMovies();
        fetchTheaters();
        fetchShows();
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  // Fetch functions
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setStats(data.stats);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/movies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setMovies(data.data);
    } catch (error) {
      console.error('Fetch movies error:', error);
    }
  };

  const fetchTheaters = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/theaters`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setTheaters(data.data);
    } catch (error) {
      console.error('Fetch theaters error:', error);
    }
  };

  const fetchShows = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/shows`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setShows(data.data);
    } catch (error) {
      console.error('Fetch shows error:', error);
    }
  };

  // Add movie
  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/admin/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newMovie,
          genre: newMovie.genre.split(',').map(g => g.trim()),
          duration: parseInt(newMovie.duration),
          rating: parseFloat(newMovie.rating)
        })
      });

      const data = await response.json();
      if (data.success) {
        setNewMovie({
          title: '',
          description: '',
          genre: '',
          duration: '',
          releaseDate: '',
          rating: 0,
          posterUrl: '',
          language: 'English'
        });
        fetchMovies();
        alert('Movie added successfully');
      }
    } catch (error) {
      console.error('Add movie error:', error);
      alert('Failed to add movie');
    }
  };

  // Delete movie
  const handleDeleteMovie = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        const response = await fetch(`${API_URL}/admin/movies/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success) {
          fetchMovies();
          alert('Movie deleted successfully');
        }
      } catch (error) {
        console.error('Delete movie error:', error);
        alert('Failed to delete movie');
      }
    }
  };

  // Add theater
  const handleAddTheater = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/admin/theaters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newTheater,
          totalScreens: parseInt(newTheater.totalScreens),
          amenities: newTheater.amenities.split(',').map(a => a.trim())
        })
      });

      const data = await response.json();
      if (data.success) {
        setNewTheater({
          name: '',
          address: { street: '', city: '', state: '', zipCode: '' },
          totalScreens: 1,
          amenities: ''
        });
        fetchTheaters();
        alert('Theater added successfully');
      }
    } catch (error) {
      console.error('Add theater error:', error);
      alert('Failed to add theater');
    }
  };

  // Delete theater
  const handleDeleteTheater = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        const response = await fetch(`${API_URL}/admin/theaters/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success) {
          fetchTheaters();
          alert('Theater deleted successfully');
        }
      } catch (error) {
        console.error('Delete theater error:', error);
        alert('Failed to delete theater');
      }
    }
  };

  // Add show
  const handleAddShow = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/admin/shows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newShow,
          basePrice: parseFloat(newShow.basePrice)
        })
      });

      const data = await response.json();
      if (data.success) {
        setNewShow({
          movie: '',
          theater: '',
          screen: '',
          showTime: '',
          endTime: '',
          basePrice: ''
        });
        fetchShows();
        alert('Show added successfully');
      }
    } catch (error) {
      console.error('Add show error:', error);
      alert('Failed to add show');
    }
  };

  // Delete show
  const handleDeleteShow = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        const response = await fetch(`${API_URL}/admin/shows/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success) {
          fetchShows();
          alert('Show deleted successfully');
        }
      } catch (error) {
        console.error('Delete show error:', error);
        alert('Failed to delete show');
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login-container">
        <div className="login-box">
          <h1>Admin Panel</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="123"
              />
            </div>
            <button type="submit">Login</button>
          </form>
          <p className="hint">Credentials: admin / 123</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <nav className="admin-navbar">
        <h1>Admin Panel</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      <div className="admin-container">
        <aside className="admin-sidebar">
          <button
            className={`sidebar-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'movies' ? 'active' : ''}`}
            onClick={() => setActiveTab('movies')}
          >
            Movies
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'theaters' ? 'active' : ''}`}
            onClick={() => setActiveTab('theaters')}
          >
            Theaters
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'shows' ? 'active' : ''}`}
            onClick={() => setActiveTab('shows')}
          >
            Shows
          </button>
        </aside>

        <main className="admin-content">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-stats">
              <h2>Dashboard</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>{stats.totalMovies}</h3>
                  <p>Total Movies</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.totalTheaters}</h3>
                  <p>Total Theaters</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.totalShows}</h3>
                  <p>Total Shows</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.totalBookings}</h3>
                  <p>Total Bookings</p>
                </div>
                <div className="stat-card">
                  <h3>₹{stats.totalRevenue}</h3>
                  <p>Total Revenue</p>
                </div>
              </div>
            </div>
          )}

          {/* Movies Tab */}
          {activeTab === 'movies' && (
            <div className="admin-section">
              <h2>Manage Movies</h2>
              <form onSubmit={handleAddMovie} className="admin-form">
                <h3>Add New Movie</h3>
                <input
                  type="text"
                  placeholder="Title"
                  value={newMovie.title}
                  onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Description"
                  value={newMovie.description}
                  onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Genre (comma separated)"
                  value={newMovie.genre}
                  onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={newMovie.duration}
                  onChange={(e) => setNewMovie({ ...newMovie, duration: e.target.value })}
                  required
                />
                <input
                  type="date"
                  value={newMovie.releaseDate}
                  onChange={(e) => setNewMovie({ ...newMovie, releaseDate: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Rating (0-10)"
                  value={newMovie.rating}
                  onChange={(e) => setNewMovie({ ...newMovie, rating: e.target.value })}
                  min="0"
                  max="10"
                  step="0.1"
                />
                <input
                  type="url"
                  placeholder="Poster URL"
                  value={newMovie.posterUrl}
                  onChange={(e) => setNewMovie({ ...newMovie, posterUrl: e.target.value })}
                />
                <select
                  value={newMovie.language}
                  onChange={(e) => setNewMovie({ ...newMovie, language: e.target.value })}
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Tamil</option>
                  <option>Telugu</option>
                  <option>Kannada</option>
                  <option>Malayalam</option>
                </select>
                <button type="submit">Add Movie</button>
              </form>

              <div className="data-list">
                <h3>Movies List</h3>
                {movies.length === 0 ? (
                  <p>No movies found</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Genre</th>
                        <th>Duration</th>
                        <th>Rating</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movies.map((movie) => (
                        <tr key={movie._id}>
                          <td>{movie.title}</td>
                          <td>{movie.genre.join(', ')}</td>
                          <td>{movie.duration} min</td>
                          <td>{movie.rating}/10</td>
                          <td>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteMovie(movie._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Theaters Tab */}
          {activeTab === 'theaters' && (
            <div className="admin-section">
              <h2>Manage Theaters</h2>
              <form onSubmit={handleAddTheater} className="admin-form">
                <h3>Add New Theater</h3>
                <input
                  type="text"
                  placeholder="Theater Name"
                  value={newTheater.name}
                  onChange={(e) => setNewTheater({ ...newTheater, name: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Street"
                  value={newTheater.address.street}
                  onChange={(e) =>
                    setNewTheater({
                      ...newTheater,
                      address: { ...newTheater.address, street: e.target.value }
                    })
                  }
                />
                <input
                  type="text"
                  placeholder="City"
                  value={newTheater.address.city}
                  onChange={(e) =>
                    setNewTheater({
                      ...newTheater,
                      address: { ...newTheater.address, city: e.target.value }
                    })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="State"
                  value={newTheater.address.state}
                  onChange={(e) =>
                    setNewTheater({
                      ...newTheater,
                      address: { ...newTheater.address, state: e.target.value }
                    })
                  }
                />
                <input
                  type="text"
                  placeholder="Zip Code"
                  value={newTheater.address.zipCode}
                  onChange={(e) =>
                    setNewTheater({
                      ...newTheater,
                      address: { ...newTheater.address, zipCode: e.target.value }
                    })
                  }
                />
                <input
                  type="number"
                  placeholder="Total Screens"
                  value={newTheater.totalScreens}
                  onChange={(e) => setNewTheater({ ...newTheater, totalScreens: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Amenities (comma separated)"
                  value={newTheater.amenities}
                  onChange={(e) => setNewTheater({ ...newTheater, amenities: e.target.value })}
                />
                <button type="submit">Add Theater</button>
              </form>

              <div className="data-list">
                <h3>Theaters List</h3>
                {theaters.length === 0 ? (
                  <p>No theaters found</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>City</th>
                        <th>Screens</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {theaters.map((theater) => (
                        <tr key={theater._id}>
                          <td>{theater.name}</td>
                          <td>{theater.address.city}</td>
                          <td>{theater.totalScreens}</td>
                          <td>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteTheater(theater._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Shows Tab */}
          {activeTab === 'shows' && (
            <div className="admin-section">
              <h2>Manage Shows</h2>
              <form onSubmit={handleAddShow} className="admin-form">
                <h3>Add New Show</h3>
                <select
                  value={newShow.movie}
                  onChange={(e) => setNewShow({ ...newShow, movie: e.target.value })}
                  required
                >
                  <option value="">Select Movie</option>
                  {movies.map((movie) => (
                    <option key={movie._id} value={movie._id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
                <select
                  value={newShow.theater}
                  onChange={(e) => setNewShow({ ...newShow, theater: e.target.value })}
                  required
                >
                  <option value="">Select Theater</option>
                  {theaters.map((theater) => (
                    <option key={theater._id} value={theater._id}>
                      {theater.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Screen (e.g., Screen 1)"
                  value={newShow.screen}
                  onChange={(e) => setNewShow({ ...newShow, screen: e.target.value })}
                  required
                />
                <input
                  type="datetime-local"
                  value={newShow.showTime}
                  onChange={(e) => setNewShow({ ...newShow, showTime: e.target.value })}
                  required
                />
                <input
                  type="datetime-local"
                  value={newShow.endTime}
                  onChange={(e) => setNewShow({ ...newShow, endTime: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Base Price"
                  value={newShow.basePrice}
                  onChange={(e) => setNewShow({ ...newShow, basePrice: e.target.value })}
                  required
                />
                <button type="submit">Add Show</button>
              </form>

              <div className="data-list">
                <h3>Shows List</h3>
                {shows.length === 0 ? (
                  <p>No shows found</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Movie</th>
                        <th>Theater</th>
                        <th>Screen</th>
                        <th>Show Time</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shows.map((show) => (
                        <tr key={show._id}>
                          <td>{show.movie?.title || 'N/A'}</td>
                          <td>{show.theater?.name || 'N/A'}</td>
                          <td>{show.screen}</td>
                          <td>{new Date(show.showTime).toLocaleString()}</td>
                          <td>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteShow(show._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
