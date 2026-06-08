import { Offer } from '../types';

export const ALLOWED_CATEGORIES = [
  'Ferramentas', 'Elétrica', 'Hidráulica', 'Tintas', 
  'Impermeabilização', 'Pisos', 'Porcelanatos', 'Acabamento', 'EPIs'
];

// Placeholder for future affiliate link builder
function generateAffiliateLink(originalUrl: string): string {
  // TODO: Replace with actual Mercado Livre affiliate API integration or URL builder
  // Example: return `https://www.mercadolivre.com.br/afiliados?url=${encodeURIComponent(originalUrl)}&campanha=OBRABARATA`;
  return originalUrl;
}

export async function fetchMercadoLivreOffers(termsToSearch: string[], onProgress?: (term: string) => void): Promise<Offer[]> {
  const allOffers: Offer[] = [];

  for (const term of termsToSearch) {
    if (onProgress) onProgress(term);
    try {
      const response = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(term)}&condition=new&limit=20`);
      if (!response.ok) {
         console.error(`Error fetching ${term}: ${response.statusText}`);
         continue;
      }
      const data = await response.json();
      
      if (data.results) {
        const items = data.results
          .filter((item: any) => item.original_price && item.price < item.original_price)
          .map((item: any) => {
            const discountPercentage = Math.floor(((item.original_price - item.price) / item.original_price) * 100);
            
            // Provide high-res image
            const imageUrl = item.thumbnail_id 
              ? `https://http2.mlstatic.com/D_NQ_NP_${item.thumbnail_id}-O.webp`
              : item.thumbnail;

            const link = generateAffiliateLink(item.permalink);
            
            let ranking: Offer['ranking'] = 'Regular';
            if (discountPercentage >= 30) ranking = 'Excelente';
            else if (discountPercentage >= 20) ranking = 'Boa';

            return {
              id: item.id,
              title: item.title,
              price: item.price,
              originalPrice: item.original_price, 
              discountPercentage,                 
              link,
              imageUrl,
              categoryId: item.category_id,
              keyword: term,
              status: 'pending',
              dateAdded: new Date().toISOString(),
              ranking,
            } as Offer;
          })
          .filter((offer: Offer) => offer.ranking === 'Excelente' || offer.ranking === 'Boa'); // Keep only >= 20%
          
        allOffers.push(...items);
      }
    } catch (error) {
      console.error(`Failed to fetch for ${term}:`, error);
    }
  }
  
  // Remove duplicates based on ID
  const uniqueOffers = Array.from(new Map(allOffers.map(item => [item.id, item])).values());
  
  // Sort by highest discount
  return uniqueOffers.sort((a, b) => b.discountPercentage - a.discountPercentage);
}
