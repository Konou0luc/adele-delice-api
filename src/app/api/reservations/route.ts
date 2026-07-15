import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     summary: Récupérer toutes les réservations
 *     tags: [Reservations]
 *     responses:
 *       200:
 *         description: Liste des réservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 *       500:
 *         description: Erreur serveur
 */
export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { date: 'asc' }
    });
    return NextResponse.json(reservations);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer les réservations' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Créer une nouvelle réservation
 *     tags: [Reservations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *               customerPhone:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               numberOfPeople:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Réservation créée
 *       500:
 *         description: Erreur serveur
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reservation = await prisma.reservation.create({
      data: body
    });
    return NextResponse.json(reservation, { status: 201 });
  } catch {
    return NextResponse.json({ erreur: 'Impossible de créer la réservation' }, { status: 500 });
  }
}
