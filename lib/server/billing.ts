import { type BillingStat, type BillingStatsResponse } from "../trpc";

export async function getBillingStats(): Promise<BillingStatsResponse> {
  const points: BillingStat[] = [
    { label: "Mon", revenue: 4200, churn: 220, expansion: 640 },
    { label: "Tue", revenue: 5900, churn: 160, expansion: 790 },
    { label: "Wed", revenue: 6400, churn: 310, expansion: 940 },
    { label: "Thu", revenue: 7100, churn: 190, expansion: 1110 },
    { label: "Fri", revenue: 8800, churn: 240, expansion: 1380 },
    { label: "Sat", revenue: 7600, churn: 180, expansion: 1220 },
    { label: "Sun", revenue: 9100, churn: 150, expansion: 1510 },
  ];

  const totalRevenue = points.reduce((sum, point) => sum + point.revenue, 0);

  return {
    totalRevenue,
    mrr: 128_400,
    arr: 1_540_800,
    points,
  };
}
