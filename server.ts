import express from "express";
import path from "path";
import fetch from "node-fetch"; // Native fetch is available in modern Node, but let's just use global fetch since type is module, Node 22 has fetch.
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Routes
  app.get("/api/mercadolivre/search", async (req, res) => {
    const query = req.query.q as string;
    
    if (!query) {
      return res.status(400).json({ error: "Missing query parameter 'q'" });
    }

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
        throw new Error(`Scraping failed with status: ${response.status}`);
      }

      const html = await response.text();
      
      // Import cheerio dynamically to avoid issues if added after server start
      const cheerio = await import('cheerio');
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
        
        // Sometimes the original price isn't captured by <s> or it's missing but there's a discount badge.
        // We'll trust what we found.
        
        const textContent = $(el).text().toLowerCase();
        const free_shipping = textContent.includes('frete grátis');

        if (title && price > 0 && permalink) {
          results.push({
            id: `MLB${Math.floor(Math.random() * 1000000000)}`, // fake id since scraping might not easily give MLB id
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
      res.json({ results });
    } catch (error: any) {
      console.error(`[ML Scraping] Error fetching ${query}:`, error.message);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  });

  app.get("/api/mercadolivre/test", async (req, res) => {
    const targetUrl = `https://api.mercadolibre.com/sites/MLB/search?q=bosch`;

    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138 Safari/537.36",
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      });

      const headersObj: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headersObj[key] = value;
      });

      const textBody = await response.text();
      let parsedBody = null;
      try {
        parsedBody = JSON.parse(textBody);
      } catch (e) {
        parsedBody = textBody; // Not valid JSON
      }

      return res.status(200).json({
        status: response.status,
        statusText: response.statusText,
        headers: headersObj,
        body: parsedBody
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Fetch failed", details: error.message });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Support React Router / SPA fallback logic
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
