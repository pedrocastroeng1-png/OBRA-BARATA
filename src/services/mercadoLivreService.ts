import { Offer } from '../types';

export const ALLOWED_CATEGORIES = [
  'Ferramentas', 'Elétrica', 'Hidráulica', 'Tintas', 
  'Impermeabilização', 'Pisos', 'Porcelanatos', 'Acabamento', 'EPIs'
];

const BLOCKED_TERMS = [
  'celular', 'smartphone', 'iphone', 'xbox', 'playstation', 'nintendo', 'game',
  'brinquedo', 'boneca', 'lego', 'perfume', 'maquiagem', 'shampoo', 'creme',
  'moda', 'camisa', 'tênis', 'vestido', 'pneu automotivo', 'som automotivo', 'capa para celular'
];

const PRIORITY_BRANDS = [
  'bosch', 'makita', 'dewalt', 'vonder', 'stanley', 'tramontina', 
  'tigre', 'krona', 'amanco', 'quartzolit', 'vedacit', 'sika', 
  'suvinil', 'coral'
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
      const response = await fetch(`/api/mercadolivre/search?q=${encodeURIComponent(term)}`);
      if (!response.ok) {
         console.error(`Error fetching ${term}: ${response.statusText}`);
         continue;
      }
      const data = await response.json();
      
      if (data.results) {
        const items = data.results
          .filter((item: any) => {
            const titleLower = item.title.toLowerCase();
            return !BLOCKED_TERMS.some(blocked => titleLower.includes(blocked));
          })
          .map((item: any) => {
            // Apply a default original price for testing if missing, so we have a visual representation
            const actualOriginal = item.original_price || (item.price * 1.3);
            const discountPercentage = Math.floor(((actualOriginal - item.price) / actualOriginal) * 100);
            
            const imageUrl = item.thumbnail_id 
              ? `https://http2.mlstatic.com/D_NQ_NP_${item.thumbnail_id}-O.webp`
              : item.thumbnail;

            const link = generateAffiliateLink(item.permalink);
            const titleLower = item.title.toLowerCase();
            const isPriorityBrand = PRIORITY_BRANDS.some(brand => titleLower.includes(brand));
            const freeShipping = item.shipping?.free_shipping || false;

            let score = 0;
            if (discountPercentage >= 40) score += 40;
            else if (discountPercentage >= 30) score += 30;
            else if (discountPercentage >= 20) score += 20;

            if (isPriorityBrand) score += 20;
            if (freeShipping) score += 10;
            
            let ranking: Offer['ranking'] = 'Regular';
            if (score >= 90) ranking = 'Excelente';
            else if (score >= 70) ranking = 'Boa';

            return {
              id: item.id,
              title: item.title,
              price: item.price,
              originalPrice: actualOriginal, 
              discountPercentage,                 
              link,
              imageUrl,
              categoryId: item.category_id,
              keyword: term,
              status: 'pending',
              dateAdded: new Date().toISOString(),
              ranking,
              score,
              freeShipping,
            } as Offer;
          })
          .filter((offer: Offer) => term.toLowerCase() === 'bosch' || offer.ranking === 'Excelente' || offer.ranking === 'Boa'); // Keep all if testing Bosch
          
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
