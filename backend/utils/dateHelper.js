// Get today's date as YYYY-MM-DD string
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Format date to YYYY-MM-DD
const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

// Get start and end of a date (for queries)
const getDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

module.exports = { getTodayDate, formatDate, getDateRange };
