import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolvePaymentWebhookOutcome } from '@/lib/payment-webhook';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = body as { type?: string; data?: { reference?: string | null } };
    const outcome = resolvePaymentWebhookOutcome({
      type: event.type ?? 'transaction.failed',
      data: event.data,
    });

    const fedaPayReference = event.data?.reference;
    if (!fedaPayReference) {
      return NextResponse.json({ received: true, skipped: true });
    }

    const payment = await prisma.payment.findUnique({
      where: { fedaPayReference },
    });

    if (!payment) {
      return NextResponse.json({ received: true, skipped: true });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: outcome.paymentStatus },
    });

    if (outcome.orderStatus) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: outcome.orderStatus },
      });
    }

    return NextResponse.json({ received: true, paymentStatus: outcome.paymentStatus });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Erreur webhook' }, { status: 500 });
  }
}
