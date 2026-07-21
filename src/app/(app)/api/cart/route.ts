import { NextResponse } from 'next/server';
import { calculateCartTotal, normalizeCartItems } from '@/lib/cart';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = normalizeCartItems(body.items ?? []);
    const totalAmount = calculateCartTotal(items);

    return NextResponse.json({
      items,
      totalAmount,
      isValid: items.length > 0,
    }, { status: 200 });
  } catch {
    return NextResponse.json({ erreur: 'Impossible de traiter le panier' }, { status: 500 });
  }
}
