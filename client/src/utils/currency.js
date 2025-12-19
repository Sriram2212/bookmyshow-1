// client/src/utils/currency.js
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const convertToINR = (amountInUSD) => {
  // You can fetch this from an API for real-time rates
  const exchangeRate = 83.25; // Example rate, replace with actual rate
  return Math.round(amountInUSD * exchangeRate);
};