export type BillingStat = {
  label: string;
  revenue: number;
};

export type BillingStatsResponse = {
  totalRevenue: number;
  mrr: number;
  points: BillingStat[];
};

const billing = {
  async getStats(): Promise<BillingStatsResponse> {
    const points: BillingStat[] = [
      { label: "Mon", revenue: 4200 },
      { label: "Tue", revenue: 5900 },
      { label: "Wed", revenue: 6400 },
      { label: "Thu", revenue: 7100 },
      { label: "Fri", revenue: 8800 },
      { label: "Sat", revenue: 7600 },
      { label: "Sun", revenue: 9100 },
    ];

    const totalRevenue = points.reduce((sum, point) => sum + point.revenue, 0);
    return {
      totalRevenue,
      mrr: 128_400,
      points,
    };
  },
};

export const trpcClient = {
  billing,
};
