export interface DashboardDishStat {
  name: string;
  quantity: number;
}

export interface DashboardSalesPoint {
  label: string;
  value: number;
}

export interface DashboardSummary {
  ordersCount: number;
  revenue: number;
  todayOrders: number;
  pendingOrders: number;
  reservationsCount: number;
  topDishes: DashboardDishStat[];
  salesByPeriod: DashboardSalesPoint[];
}

export function buildDashboardSummary(input: DashboardSummary): DashboardSummary {
  return {
    ...input,
    revenue: Number(input.revenue) || 0,
    ordersCount: Number(input.ordersCount) || 0,
    todayOrders: Number(input.todayOrders) || 0,
    pendingOrders: Number(input.pendingOrders) || 0,
    reservationsCount: Number(input.reservationsCount) || 0,
    topDishes: input.topDishes ?? [],
    salesByPeriod: input.salesByPeriod ?? [],
  };
}
