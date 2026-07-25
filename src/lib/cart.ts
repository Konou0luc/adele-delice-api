export interface CartItemInput {
  dishId: string;
  quantity: number;
  unitPrice: number;
}

function roundMoney(value: number) {
  return Math.max(0, Math.round(Number(value) || 0));
}

export function calculateCartTotal(items: CartItemInput[]): number {
  return items.reduce((total, item) => total + item.quantity * roundMoney(item.unitPrice), 0);
}

export function normalizeCartItems(items: CartItemInput[]) {
  return items
    .map((item) => ({
      dishId: item.dishId,
      quantity: Math.round(Number(item.quantity) || 0),
      unitPrice: roundMoney(item.unitPrice),
    }))
    .filter((item) => item.quantity > 0 && item.unitPrice >= 0);
}
