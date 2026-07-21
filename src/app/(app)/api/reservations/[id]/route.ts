import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth-helpers';

function normalizeReservationStatus(status?: string) {
  if (!status) return undefined;
  const mappedStatus = status.toUpperCase();
  if (['PENDING', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED'].includes(mappedStatus)) {
    return mappedStatus === 'CANCELLED' ? 'CANCELLED' : mappedStatus;
  }
  return undefined;
}

type Params = Promise<{ id: string }>;

/**
 * @swagger
 * /api/reservations/{id}:
 *   get:
 *     summary: Récupérer une réservation par son ID
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Réservation trouvée
 *       404:
 *         description: Réservation non trouvée
 *       500:
 *         description: Erreur serveur
 */
export async function GET(request: Request, segmentData: { params: Params }) {
  const authResult = await requireAuth();
  if (authResult.response) return authResult.response;

  try {
    const { id } = await segmentData.params;
    const reservation = await prisma.reservation.findUnique({
      where: { id }
    });
    if (!reservation) return NextResponse.json({ erreur: 'Réservation introuvable' }, { status: 404 });
    return NextResponse.json(reservation);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer la réservation' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/reservations/{id}:
 *   put:
 *     summary: Mettre à jour une réservation (confirmer, modifier, etc.) (authentifié seulement)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Authentification requise
 *       500:
 *         description: Erreur serveur
 */
export async function PUT(request: Request, segmentData: { params: Params }) {
  const authResult = await requireRole(["ADMIN", "MANAGER", "EMPLOYEE"]);
  if (authResult.response) return authResult.response;

  try {
    const { id } = await segmentData.params;
    const body = await request.json();
    const status = normalizeReservationStatus(body.status);
    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        ...body,
        ...(status ? { status } : {}),
      }
    });
    return NextResponse.json(reservation);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de mettre à jour la réservation' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/reservations/{id}:
 *   delete:
 *     summary: Supprimer une réservation (authentifié seulement)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Réservation supprimée
 *       401:
 *         description: Authentification requise
 *       500:
 *         description: Erreur serveur
 */
export async function DELETE(request: Request, segmentData: { params: Params }) {
  const authResult = await requireRole(["ADMIN", "MANAGER", "EMPLOYEE"]);
  if (authResult.response) return authResult.response;

  try {
    const { id } = await segmentData.params;
    await prisma.reservation.delete({
      where: { id }
    });
    return NextResponse.json({ succès: true });
  } catch {
    return NextResponse.json({ erreur: 'Impossible de supprimer la réservation' }, { status: 500 });
  }
}
