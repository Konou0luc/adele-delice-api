import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePaymentWebhookOutcome } from '../src/lib/payment-webhook';

test('resolvePaymentWebhookOutcome marks approved payments as successful', () => {
  const outcome = resolvePaymentWebhookOutcome({
    type: 'transaction.approved',
    data: { reference: 'ref-123' },
  });

  assert.deepEqual(outcome, {
    paymentStatus: 'SUCCESS',
    orderStatus: 'PAYMENT_CONFIRMED',
  });
});

test('resolvePaymentWebhookOutcome marks failed payments as failed', () => {
  const outcome = resolvePaymentWebhookOutcome({
    type: 'transaction.failed',
    data: { reference: 'ref-456' },
  });

  assert.deepEqual(outcome, {
    paymentStatus: 'FAILED',
  });
});
