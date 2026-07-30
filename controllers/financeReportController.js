const {
  getDepartureProfitability,
  getFinancialSummary,
  getBookingFinancialSummary,
  getTourFinancialSummary,
  getExecutiveFinanceDashboard
} = require('../services/profitabilityService');

async function getDepartureProfitabilityReport(req, res) {
  const report = await getDepartureProfitability(req.params.departureInstanceId);
  res.json({ data: report });
}

async function getFinancialSummaryReport(req, res) {
  const summary = await getFinancialSummary();
  res.json({ data: summary });
}

async function getExecutiveDashboard(req, res) {
  const dashboard = await getExecutiveFinanceDashboard();
  res.json({ data: dashboard });
}

async function getBookingSummary(req, res) {
  const summary = await getBookingFinancialSummary(req.params.bookingId);
  res.json({ data: summary });
}

async function getTourSummary(req, res) {
  const summary = await getTourFinancialSummary(req.params.departureInstanceId);
  res.json({ data: summary });
}

module.exports = {
  getDepartureProfitabilityReport,
  getFinancialSummaryReport,
  getExecutiveDashboard,
  getBookingSummary,
  getTourSummary
};
