import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCartTotal, normalizeCartItems } from '../src/lib/cart';

test('calculateCartTotal sums quantities and unit prices', () => {
  const total = calculateCartTotal([
    { dishId: 'dish-1', quantity: 2, unitPrice: 2500 },
    { dishId: 'dish-2', quantity: 1, unitPrice: 4000 },
  ]);

  assert.equal(total, 9000);
});

test('normalizeCartItems removes invalid entries', () => {
  const normalized = normalizeCartItems([
    { dishId: 'dish-1', quantity: 2, unitPrice: 2500 },
    { dishId: 'dish-2', quantity: 0, unitPrice: 1000 },
  ]);

  assert.deepEqual(normalized, [{ dishId: 'dish-1', quantity: 2, unitPrice: 2500 }]);
});
