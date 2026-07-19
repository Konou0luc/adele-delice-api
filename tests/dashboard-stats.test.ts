import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDashboardSummary } from '../src/lib/dashboard-stats';

test('buildDashboardSummary formats dashboard metrics', () => {
  const summary = buildDashboardSummary({
    ordersCount: 12,
    revenue: 345000,
    todayOrders: 3,
    pendingOrders: 4,
    reservationsCount: 2,
    topDishes: [
      { name: 'Poulet braisé', quantity: 8 },
      { name: 'Curry de poisson', quantity: 5 },
    ],
    salesByPeriod: [
      { label: 'Lun', value: 120000 },
      { label: 'Mar', value: 90000 },
    ],
  });

  assert.equal(summary.ordersCount, 12);
  assert.equal(summary.revenue, 345000);
  assert.equal(summary.todayOrders, 3);
  assert.equal(summary.pendingOrders, 4);
  assert.equal(summary.reservationsCount, 2);
  assert.deepEqual(summary.topDishes, [
    { name: 'Poulet braisé', quantity: 8 },
    { name: 'Curry de poisson', quantity: 5 },
  ]);
  assert.deepEqual(summary.salesByPeriod, [
    { label: 'Lun', value: 120000 },
    { label: 'Mar', value: 90000 },
  ]);
});
