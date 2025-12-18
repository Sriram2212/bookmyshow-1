import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookingById(bookingId);
      if (response.success) {
        setBooking(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Unable to load booking details'}</p>
          <Link
            to="/"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6 text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your tickets have been booked successfully</p>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-primary-600 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Booking Details</h2>
          </div>
          
          <div className="p-6">
            {/* Booking ID */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Booking ID</p>
              <p className="text-lg font-mono font-semibold text-gray-900">{booking._id}</p>
            </div>

            {/* Movie & Show Info */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {booking.show?.movie?.title || 'Movie'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Theater</p>
                  <p className="font-semibold text-gray-900">
                    {booking.show?.theater?.name || 'Theater'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Screen</p>
                  <p className="font-semibold text-gray-900">{booking.show?.screen || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Show Time</p>
                  <p className="font-semibold text-gray-900">
                    {booking.show?.showTime ? formatDate(booking.show.showTime) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Booking Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(booking.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Seats */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Seats</p>
              <div className="flex flex-wrap gap-2">
                {booking.seats.map((seat, idx) => (
                  <div
                    key={idx}
                    className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-semibold"
                  >
                    {seat.seatNumber}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Info */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Payment ID</p>
                  <p className="font-mono text-sm text-gray-900">{booking.paymentId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Amount */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-primary-600">
                  ${booking.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/"
            className="flex-1 px-6 py-3 bg-primary-600 text-white text-center rounded-lg hover:bg-primary-700 transition-colors font-semibold"
          >
            Book More Tickets
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 text-center rounded-lg hover:bg-primary-50 transition-colors font-semibold"
          >
            Print Ticket
          </button>
        </div>

        {/* Important Note */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> Please arrive at the theater at least 15 minutes before the show time. 
            Carry a valid ID proof for verification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
