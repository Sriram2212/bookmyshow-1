import api from '../utils/api';

export const bookingService = {
  async lockSeats(showId, seatIds) {
    const response = await api.post('/booking/lock', { showId, seatIds });
    return response.data;
  },

  async confirmBooking(showId, seatIds, paymentId = null) {
    const response = await api.post('/booking/confirm', {
      showId,
      seatIds,
      paymentId
    });
    return response.data;
  },

  async releaseLocks(showId, seatIds) {
    const response = await api.post('/booking/release', { showId, seatIds });
    return response.data;
  },

  async getUserBookings() {
    const response = await api.get('/booking/my-bookings');
    return response.data;
  },

  async getBookingById(bookingId) {
    const response = await api.get(`/booking/${bookingId}`);
    return response.data;
  }
};

