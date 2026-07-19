import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Vérifier la signature FedaPay (optionnel mais recommandé)
    const event = body;

    if (event.type === 'transaction.approved') {
      // Paiement approuvé
      const transactionId = event.data.id;
      const fedaPayReference = event.data.reference;

      // Trouver le paiement dans la base de données
      const payment = await prisma.payment.findUnique({
        where: { fedaPayReference }
      });

      if (payment) {
        // Mettre à jour le statut du paiement
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS' }
        });

        // Mettre à jour le statut de la commande
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'PAYMENT_CONFIRMED' }
        });
      }
    } else if (event.type === 'transaction.canceled' || event.type === 'transaction.failed') {
      // Paiement annulé ou échoué
      const fedaPayReference = event.data.reference;
      
      const payment = await prisma.payment.findUnique({
        where: { fedaPayReference }
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' }
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Erreur webhook' }, { status: 500 });
  }
}
