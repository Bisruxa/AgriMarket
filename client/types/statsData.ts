export interface StatsData {
  users: {
    total: number;
    farmers: number;
    traders: number;
    admins: number;
    verified: number;
    deleted: number;
    newLast30Days: number;
  };
  traders: {
    pending: number;
    approved: number;
    rejected: number;
  };
  products: {
    total: number;
    available: number;
    organic: number;
    byCategory: Array<{
      category: string;
      count: number;
    }>;
  };
  recent: {
    users: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      approvalStatus: string;
      createdAt: string;
    }>;
    products: Array<{
      id: string;
      name: string;
      category: string;
      price: string;
      isAvailable: boolean;
      createdAt: string;
      farmer: {
        name: string;
      };
    }>;
  };
}
