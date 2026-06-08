import { Offer } from '../types';

export const KEYWORDS = [
  'Bosch', 'Makita', 'DeWalt', 'Vonder', 'Tramontina', 
  'Tigre', 'Krona', 'Quartzolit', 'Suvinil', 'Coral', 
  'Vedacit', 'Porcelanato', 'Argamassa', "Caixa d'água", 
  'Furadeira', 'Parafusadeira', 'Martelete', 'Esmerilhadeira'
];

export async function fetchOffers(onProgress?: (keyword: string) => void): Promise<Offer[]> {
  const allOffers: Offer[] = [];
  
  // To simulate a real search without making 20 requests at once,
  // we pick a random subset of 6 keywords to cycle through for finding new deals.
  const shuffledKeywords = [...KEYWORDS].sort(() => 0.5 - Math.random()).slice(0, 6);

  for (const keyword of shuffledKeywords) {
    if (onProgress) onProgress(keyword);
    try {
      const response = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(keyword)}&condition=new&limit=20`);
      const data = await response.json();
      
      if (data.results) {
        const items = data.results
          .filter((item: any) => item.original_price && item.price < item.original_price)
          .map((item: any) => {
            const discountPercentage = Math.floor(((item.original_price - item.price) / item.original_price) * 100);
            
            // Generate higher quality image link
            const imageUrl = item.thumbnail_id 
              ? `https://http2.mlstatic.com/D_NQ_NP_${item.thumbnail_id}-O.webp`
              : item.thumbnail;

            return {
              id: item.id,
              title: item.title,
              price: item.price,
              originalPrice: item.original_price,
              discountPercentage,
              link: item.permalink,
              imageUrl,
              categoryId: item.category_id,
              keyword,
              status: 'pending',
              dateAdded: new Date().toISOString(),
            } as Offer;
          })
          // Smart filter: Approve only >= 20% discount
          .filter((offer: Offer) => offer.discountPercentage >= 20); 
          
        allOffers.push(...items);
      }
    } catch (error) {
      console.error(`Failed to fetch for ${keyword}:`, error);
    }
  }
  
  // Remove duplicates across keywords
  const uniqueOffers = Array.from(new Map(allOffers.map(item => [item.id, item])).values());
  return uniqueOffers;
}
