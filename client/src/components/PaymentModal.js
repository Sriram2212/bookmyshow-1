import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './UI/LoadingSpinner';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  amount, 
  seats, 
  movieTitle, 
  showTime,
  showId,
  onPaymentSuccess
}) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: user?.name || '',
    upiId: '',
    saveCard: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('pendingBooking', JSON.stringify({
        showId,
        seats,
        amount,
        movieTitle,
        showTime
      }));
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    setProcessing(true);
    setError('');
    
    try {
      if (paymentMethod === 'card' && 
          (!paymentData.cardNumber || !paymentData.expiry || !paymentData.cvv || !paymentData.name)) {
        throw new Error('Please fill in all card details');
      }

      if (paymentMethod === 'upi' && !paymentData.upiId) {
        throw new Error('Please enter UPI ID');
      }

      // Simulate payment processing
      const paymentResult = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            transactionId: `TXN${Date.now()}`,
            amount,
            currency: 'INR',
            timestamp: new Date().toISOString()
          });
        }, 2000);
      });

      if (paymentResult.success) {
        onPaymentSuccess({
          ...paymentResult,
          paymentMethod,
          seats,
          showId
        });
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={processing}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span className="text-gray-600">Movie:</span>
                <span className="font-medium text-gray-900">{movieTitle}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Show:</span>
                <span className="font-medium text-gray-900">{showTime}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Seats:</span>
                <span className="font-medium text-gray-900">{seats.join(', ')}</span>
              </p>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <p className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-indigo-600">₹{amount}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
                { id: 'upi', name: 'UPI', icon: '📱' },
                { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
                { id: 'wallet', name: 'Wallet', icon: '💰' }
              ].map(method => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    paymentMethod === method.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <span className="block text-2xl mb-1">{method.icon}</span>
                  <span className="text-sm font-medium">{method.name}</span>
                </button>
              ))}
            </div>

            {/* Payment Form */}
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      name="expiry"
                      value={paymentData.expiry}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      value={paymentData.cvv}
                      onChange={handleInputChange}
                      placeholder="•••"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={paymentData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    name="upiId"
                    value={paymentData.upiId}
                    onChange={handleInputChange}
                    placeholder="yourname@upi"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  You'll be redirected to your UPI app to complete the payment
                </p>
              </div>
            )}

            {(paymentMethod === 'netbanking' || paymentMethod === 'wallet') && (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">
                  {paymentMethod === 'netbanking' 
                    ? 'Select your bank to continue'
                    : 'Select your wallet to continue'}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'sbi', name: 'SBI' },
                    { id: 'hdfc', name: 'HDFC' },
                    { id: 'icici', name: 'ICICI' },
                    { id: 'axis', name: 'Axis' },
                    { id: 'paytm', name: 'Paytm' },
                    { id: 'phonepe', name: 'PhonePe' }
                  ].map(bank => (
                    <button
                      key={bank.id}
                      type="button"
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      {bank.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pay Now Button */}
          <button
            onClick={handlePayment}
            disabled={processing}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
              processing
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {processing ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="small" text="Processing..." />
              </div>
            ) : (
              `Pay ₹${amount}`
            )}
          </button>

          <p className="mt-3 text-center text-xs text-gray-500">
            Your payment is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;