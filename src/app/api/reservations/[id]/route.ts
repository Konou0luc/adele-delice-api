import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = Promise<{ id: string }>;

/**
 * @swagger
 * /api/reservations/{id}:
 *   put:
 *     summary: Mettre à jour une réservation (confirmer, modifier, etc.)
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reservation'
 *     responses:
 *       200:
 *         description: Réservation mise à jour
 *       500:
 *         description: Erreur serveur
 */
export async function PUT(request: Request, segmentData: { params: Params }) {
  try {
    const { id } = await segmentData.params;
    const body = await request.json();
    const reservation = await prisma.reservation.update({
      where: { id },
      data: body
    });
    return NextResponse.json(reservation);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de mettre à jour la réservation' }, { status: 500 });
  }
}
