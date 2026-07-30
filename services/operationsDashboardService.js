const { DepartureInstance } = require('../models/Product');
const { buildOperationsViewQuery } = require('../utils/rbac');

async function getDashboardSummary(user) {
  const scopeQuery = buildOperationsViewQuery(user);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const endOfTomorrow = new Date(endOfToday);
  endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);

  const departures = await DepartureInstance.find(scopeQuery)
    .populate('packageId', 'name durationDays')
    .lean();

  let todayCount = 0;
  let tomorrowCount = 0;
  let activeCount = 0;
  let delayedCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;

  departures.forEach(d => {
    const start = new Date(d.startDate);
    const end = new Date(d.endDate);

    if (d.status === 'Cancelled') {
      cancelledCount++;
      return;
    }

    if (d.status === 'Completed') {
      completedCount++;
      return;
    }

    if (d.status === 'Active') {
      if (end < now) {
        delayedCount++;
      } else {
        activeCount++;
      }
    }

    if (start >= startOfToday && start <= endOfToday) {
      todayCount++;
    }

    if (start >= startOfTomorrow && start <= endOfTomorrow) {
      tomorrowCount++;
    }
  });

  return {
    todayTours: {
      count: todayCount,
      trend: 'flat',
      quickFilters: { date: 'today' },
      deepLink: '/api/operations/departures?filter=today'
    },
    tomorrowTours: {
      count: tomorrowCount,
      trend: 'flat',
      quickFilters: { date: 'tomorrow' },
      deepLink: '/api/operations/departures?filter=tomorrow'
    },
    activeTours: {
      count: activeCount,
      trend: 'up',
      quickFilters: { status: 'Active' },
      deepLink: '/api/operations/departures?status=Active'
    },
    delayedTours: {
      count: delayedCount,
      trend: delayedCount > 0 ? 'warning' : 'healthy',
      quickFilters: { status: 'Active', isDelayed: true },
      deepLink: '/api/operations/departures?status=Active&delayed=true'
    },
    completedTours: {
      count: completedCount,
      trend: 'up',
      quickFilters: { status: 'Completed' },
      deepLink: '/api/operations/departures?status=Completed'
    },
    cancelledTours: {
      count: cancelledCount,
      trend: 'flat',
      quickFilters: { status: 'Cancelled' },
      deepLink: '/api/operations/departures?status=Cancelled'
    }
  };
}

module.exports = {
  getDashboardSummary
};
