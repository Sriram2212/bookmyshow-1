import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { bookingService } from '../services/bookingService';
import { authService } from '../services/authService';

const SeatSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [lockTimer, setLockTimer] = useState(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchShow();
    return () => {
      if (lockTimer) {
        clearInterval(lockTimer);
      }
    };
  }, [showId]);

  const fetchShow = async () => {
    try {
      setLoading(true);
      const response = await movieService.getShowById(showId);
      if (response.success) {
        setShow(response.data);
        // Initialize seats grid if not exists
        if (!response.data.seats || response.data.seats.length === 0) {
          initializeSeats(response.data);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load show');
    } finally {
      setLoading(false);
    }
  };

  const initializeSeats = (showData) => {
    // Create a simple 5x10 grid of seats
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const seats = [];
    rows.forEach((row, rowIdx) => {
      for (let col = 1; col <= 10; col++) {
        seats.push({
          seatNumber: `${row}${col}`,
          row: row,
          column: col,
          seatType: rowIdx < 2 ? 'premium' : 'regular',
          price: rowIdx < 2 ? showData.basePrice * 1.5 : showData.basePrice,
          status: 'available'
        });
      }
    });
    // Note: In production, this should be done on the backend
    console.log('Seats initialized:', seats);
  };

  const getSeatStatus = (seat) => {
    if (seat.status === 'booked') return 'booked';
    if (seat.status === 'locked') {
      const lockedSeat = lockedSeats.find(ls => ls.seatId === seat._id.toString());
      if (lockedSeat) return 'locked';
    }
    if (selectedSeats.includes(seat._id.toString())) return 'selected';
    return 'available';
  };

  const handleSeatClick = async (seat) => {
    if (seat.status === 'booked' || seat.status === 'locked') {
      return;
    }

    const seatId = seat._id.toString();
    const isSelected = selectedSeats.includes(seatId);

    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleLockSeats = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      const response = await bookingService.lockSeats(showId, selectedSeats);
      
      if (response.success) {
        setLockedSeats(response.data.lockedSeats);
        setSelectedSeats([]);
        
        // Start countdown timer
        let timeLeft = response.data.lockExpiry;
        const timer = setInterval(() => {
          timeLeft -= 1;
          if (timeLeft <= 0) {
            clearInterval(timer);
            setLockedSeats([]);
            fetchShow(); // Refresh show data
          }
        }, 1000);
        setLockTimer(timer);
      } else {
        setError('Failed to lock seats. Some seats may be unavailable.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to lock seats');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (lockedSeats.length === 0) {
      setError('Please lock seats first');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      const seatIds = lockedSeats.map(ls => ls.seatId);
      const response = await bookingService.confirmBooking(showId, seatIds);
      
      if (response.success) {
        // Clear lock timer
        if (lockTimer) {
          clearInterval(lockTimer);
          setLockTimer(null);
        }
        // Navigate to booking confirmation page
        navigate(`/booking/${response.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm booking');
    } finally {
      setProcessing(false);
    }
  };

  const handleReleaseLocks = async () => {
    try {
      setProcessing(true);
      const seatIds = lockedSeats.map(ls => ls.seatId);
      await bookingService.releaseLocks(showId, seatIds);
      setLockedSeats([]);
      if (lockTimer) {
        clearInterval(lockTimer);
        setLockTimer(null);
      }
      fetchShow();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to release locks');
    } finally {
      setProcessing(false);
    }
  };

  const calculateTotal = () => {
    if (!show) return 0;
    return lockedSeats.reduce((sum, ls) => sum + ls.price, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading seats...</div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Show not found</div>
      </div>
    );
  }

  // Group seats by row
  const seatsByRow = {};
  show.seats.forEach(seat => {
    if (!seatsByRow[seat.row]) {
      seatsByRow[seat.row] = [];
    }
    seatsByRow[seat.row].push(seat);
  });

  const rows = Object.keys(seatsByRow).sort();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {show.movie?.title || 'Movie'}
          </h1>
          <p className="text-gray-600">
            {show.theater?.name || 'Theater'} • {show.screen} •{' '}
            {new Date(show.showTime).toLocaleString()}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-200 h-12 w-3/4 rounded"></div>
            <p className="text-center text-sm text-gray-600 mt-2">Screen</p>
          </div>

          <div className="space-y-2 mb-6">
            {rows.map(row => (
              <div key={row} className="flex items-center justify-center gap-1">
                <span className="w-8 text-sm font-medium text-gray-700">{row}</span>
                {seatsByRow[row]
                  .sort((a, b) => a.column - b.column)
                  .map(seat => {
                    const status = getSeatStatus(seat);
                    const seatId = seat._id.toString();
                    return (
                      <button
                        key={seatId}
                        onClick={() => handleSeatClick(seat)}
                        disabled={status === 'booked' || status === 'locked' || processing}
                        className={`
                          w-10 h-10 rounded text-xs font-medium transition-all
                          ${status === 'booked' 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : status === 'locked'
                            ? 'bg-yellow-400 cursor-not-allowed'
                            : status === 'selected'
                            ? 'bg-primary-600 text-white'
                            : 'bg-green-400 hover:bg-green-500'
                          }
                          disabled:opacity-50
                        `}
                        title={`${seat.seatNumber} - $${seat.price}`}
                      >
                        {seat.column}
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary-600 rounded"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>Locked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span>Booked</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Selected Seats</h2>
          {lockedSeats.length > 0 ? (
            <div>
              <div className="mb-4">
                {lockedSeats.map((ls, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded mr-2 mb-2"
                  >
                    {ls.seatNumber} (${ls.price})
                  </span>
                ))}
              </div>
              <div className="text-xl font-bold mb-4">
                Total: ${calculateTotal().toFixed(2)}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleConfirmBooking}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Confirm Booking'}
                </button>
                <button
                  onClick={handleReleaseLocks}
                  disabled={processing}
                  className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                Select seats and click "Lock Seats" to reserve them for 5 minutes.
              </p>
              <button
                onClick={handleLockSeats}
                disabled={selectedSeats.length === 0 || processing}
                className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {processing ? 'Locking...' : `Lock ${selectedSeats.length} Seat(s)`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;

