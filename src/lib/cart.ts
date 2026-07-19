export interface CartItemInput {
  dishId: string;
  quantity: number;
  unitPrice: number;
}

export function calculateCartTotal(items: CartItemInput[]): number {
  return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}

export function normalizeCartItems(items: CartItemInput[]) {
  return items.map((item) => ({
    dishId: item.dishId,
    quantity: Number(item.quantity) || 0,
    unitPrice: Number(item.unitPrice) || 0,
  })).filter((item) => item.quantity > 0 && item.unitPrice >= 0);
}
