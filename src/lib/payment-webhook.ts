export interface PaymentWebhookEvent {
  type: string;
  data?: {
    reference?: string | null;
  };
}

export interface PaymentWebhookOutcome {
  paymentStatus: 'SUCCESS' | 'FAILED';
  orderStatus?: 'PAYMENT_CONFIRMED';
}

export function resolvePaymentWebhookOutcome(event: PaymentWebhookEvent): PaymentWebhookOutcome {
  if (event.type === 'transaction.approved') {
    return {
      paymentStatus: 'SUCCESS',
      orderStatus: 'PAYMENT_CONFIRMED',
    };
  }

  return {
    paymentStatus: 'FAILED',
  };
}
