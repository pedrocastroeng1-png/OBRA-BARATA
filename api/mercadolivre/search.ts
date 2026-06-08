import * as cheerio from 'cheerio';

export default async function handler(req: any, res: any) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Missing query parameter 'q'" });
  }

  const query = q as string;
  const formattedQuery = encodeURIComponent(query.replace(/\s+/g, '-'));
  const targetUrl = `https://lista.mercadolivre.com.br/${formattedQuery}#D[A:${encodeURIComponent(query)}]`;
  
  console.log(`[ML Scraping] Fetching: ${targetUrl}`);

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      }
    });

    console.log(`[ML Scraping] Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[ML Scraping] Error Body: ${errorBody}`);
      return res.status(response.status).json({ 
        error: `Scraping error: ${response.statusText}`,
        details: errorBody 
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const results: any[] = [];

    $('.ui-search-layout__item').each((i, el) => {
      if (i >= 20) return; // Limit to 20 results like the API

      const title = $(el).find('h2.ui-search-item__title').text().trim();
      const permalink = $(el).find('a.ui-search-link').attr('href');
      let thumbnail = $(el).find('img.ui-search-result-image__element').attr('data-src') || $(el).find('img.ui-search-result-image__element').attr('src');
      if (!thumbnail && $(el).find('img').length > 0) {
         thumbnail = $(el).find('img').first().attr('src');
      }

      const parseAmount = (amtEl: any) => {
         const fraction = $(amtEl).find('.andes-money-amount__fraction').first().text().replace(/\D/g, '');
         const cents = $(amtEl).find('.andes-money-amount__cents').first().text().replace(/\D/g, '') || '00';
         if (!fraction) return 0;
         return parseFloat(`${fraction}.${cents}`);
      };

      let tempOriginal = 0;
      let tempCurrent = 0;

      $(el).find('.andes-money-amount').each((_, amtEl) => {
        const isStrikethrough = $(amtEl).closest('s').length > 0 || $(amtEl).closest('.ui-search-price__original-value').length > 0;
        const val = parseAmount(amtEl);
        if (val === 0) return;
        
        if (isStrikethrough && tempOriginal === 0) {
          tempOriginal = val;
        } else if (!isStrikethrough && tempCurrent === 0) {
          tempCurrent = val;
        }
      });

      let price = tempCurrent;
      let original_price = tempOriginal > 0 ? tempOriginal : null;
      
      const textContent = $(el).text().toLowerCase();
      const free_shipping = textContent.includes('frete grátis');

      if (title && price > 0 && permalink) {
        results.push({
          id: `MLB${Math.floor(Math.random() * 1000000000)}`,
          title,
          permalink,
          price,
          original_price,
          thumbnail,
          shipping: { free_shipping }
        });
      }
    });

    console.log(`[ML Scraping] Items parsed: ${results.length}`);
    return res.status(200).json({ results });
  } catch (error: any) {
    console.error(`[ML Scraping] Catch Error: ${error.message}`);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
