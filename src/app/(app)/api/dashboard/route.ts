import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { buildDashboardSummary } from '@/lib/dashboard-stats';
import { requireRole } from '@/lib/auth-helpers';

export async function GET() {
  const authResult = await requireRole(['ADMIN', 'MANAGER']);
  if (authResult.response) return authResult.response;

  try {
    const [ordersCount, todayOrders, pendingOrders, reservationsCount, revenue, topDishes] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.reservation.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'CANCELLED' } },
      }),
      prisma.orderItem.groupBy({
        by: ['dishId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    const dishIds = topDishes.map((item) => item.dishId);
    const dishDetails = await prisma.dish.findMany({
      where: { id: { in: dishIds } },
      select: { id: true, name: true },
    });

    const dishMap = new Map(dishDetails.map((dish) => [dish.id, dish.name]));
    const topDishStats = topDishes
      .map((item) => ({
        name: dishMap.get(item.dishId) ?? 'Plat inconnu',
        quantity: Number(item._sum.quantity ?? 0),
      }))
      .filter((item) => item.quantity > 0);

    const summary = buildDashboardSummary({
      ordersCount,
      revenue: Number(revenue._sum.totalAmount ?? 0),
      todayOrders,
      pendingOrders,
      reservationsCount,
      topDishes: topDishStats,
      salesByPeriod: [
        { label: '7j', value: Number(revenue._sum.totalAmount ?? 0) },
      ],
    });

    return NextResponse.json(summary);
  } catch {
    return NextResponse.json({ erreur: 'Impossible de récupérer le tableau de bord' }, { status: 500 });
  }
}
