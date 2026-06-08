export interface Offer {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  link: string;
  imageUrl: string;
  categoryId: string;
  keyword: string;
  status: 'pending' | 'approved' | 'rejected';
  dateAdded: string;
  dateProcessed?: string;
  ranking: 'Excelente' | 'Boa' | 'Regular';
  score: number;
  freeShipping: boolean;
}

export interface Stats {
  foundToday: number;
  approved: number;
  rejected: number;
  lastUpdate: string | null;
}
