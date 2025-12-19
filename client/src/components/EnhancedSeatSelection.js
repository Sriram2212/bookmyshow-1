import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showService } from '../services/showService';
import { bookingService } from '../services/bookingService';
import PaymentModal from './PaymentModal';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './UI/LoadingSpinner';
import EmptyState from './UI/EmptyState';
import { formatCurrency } from '../utils/currency';

const EnhancedSeatSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        setIsProcessing(true);
        const response = await showService.getShow(showId);
        if (response.success) {
          setShow(response.data);
        }
      } catch (err) {
        setError('Failed to load show details. Please try again.');
        console.error('Error fetching show:', err);
      } finally {
        setIsProcessing(false);
      }
    };

    fetchShowDetails();
  }, [showId]);

  const handleSeatClick = (seat) => {
    if (seat.status === 'booked' || seat.status === 'locked') return;

    setSelectedSeats(prev => {
      if (prev.includes(seat.number)) {
        return prev.filter(s => s !== seat.number);
      }
      return [...prev, seat.number];
    });
  };

  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    if (!isAuthenticated) {
      const totalAmount = selectedSeats.length * show.price;
      sessionStorage.setItem('pendingBooking', JSON.stringify({
        showId,
        seats: selectedSeats,
        amount: totalAmount,
        movieTitle: show.movie.title,
        showTime: show.time
      }));
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      setIsProcessing(true);
      const response = await bookingService.confirmBooking({
        showId,
        seats: selectedSeats,
        payment: {
          ...paymentResult,
          status: 'completed'
        }
      });

      if (response.success) {
        navigate(`/booking/${response.data.bookingId}`, { 
          state: { 
            booking: response.data,
            paymentStatus: 'success'
          } 
        });
      }
    } catch (err) {
      setError('Failed to confirm booking. Please try again.');
      console.error('Booking confirmation failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getSeatStatus = (seat) => {
    if (seat.status === 'booked') return 'booked';
    if (selectedSeats.includes(seat.number)) return 'selected';
    return 'available';
  };

  if (isProcessing && !show) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading show details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!show) return null;

  const totalAmount = selectedSeats.length * show.price;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{show.movie.title}</h1>
              <p className="text-gray-600 mt-1">
                {new Date(show.date).toLocaleDateString()} • {show.time}
              </p>
              <p className="text-gray-600">Screen {show.screen}</p>
            </div>
            <div className="text-left md:text-right">
              <div className="text-xl md:text-2xl font-bold text-indigo-600">
                {formatCurrency(show.price)} <span className="text-sm font-normal text-gray-500">per seat</span>
              </div>
              {selectedSeats.length > 0 && (
                <div className="text-lg text-gray-700 mt-2">
                  {selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'} selected • {formatCurrency(totalAmount)}
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Screen */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-b from-gray-800 to-gray-600 text-white py-4 rounded-lg">
              <p className="text-sm font-medium">SCREEN</p>
            </div>
          </div>

          {/* Seat Map */}
          <div className="grid grid-cols-10 gap-2 max-w-2xl mx-auto mb-8">
            {show.seats.map((seat) => {
              const status = getSeatStatus(seat);
              return (
                <button
                  key={seat.number}
                  onClick={() => handleSeatClick(seat)}
                  disabled={status === 'booked' || status === 'locked'}
                  className={`
                    aspect-square rounded-lg text-xs font-medium transition-all
                    ${status === 'booked' 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : status === 'selected'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-green-400 hover:bg-green-500'
                    }
                    ${status === 'selected' ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}
                  `}
                >
                  {seat.number}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-indigo-600 rounded"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span>Booked</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              {selectedSeats.length > 0 ? (
                <>
                  <p className="text-lg font-medium">
                    {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'} Selected
                  </p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {formatCurrency(totalAmount)}
                  </p>
                </>
              ) : (
                <p className="text-gray-600">Please select your seats</p>
              )}
            </div>
            <button
              onClick={handleProceedToPayment}
              disabled={selectedSeats.length === 0 || isProcessing}
              className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="small" text="" />
                  Processing...
                </div>
              ) : (
                'Proceed to Pay'
              )}
            </button>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={totalAmount}
        seats={selectedSeats}
        movieTitle={show.movie.title}
        showTime={show.time}
        showId={showId}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default EnhancedSeatSelection;