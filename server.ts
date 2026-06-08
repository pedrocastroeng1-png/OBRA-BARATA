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

    const mlApiUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&condition=new&limit=20`;
    
    console.log(`[ML API] Fetching: ${mlApiUrl}`);

    try {
      const response = await fetch(mlApiUrl);
      console.log(`[ML API] Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        throw new Error(`ML API responded with status: ${response.status}`);
      }

      const data = await response.json();
      const resultsCount = data.results ? data.results.length : 0;
      console.log(`[ML API] Items returned: ${resultsCount}`);

      res.json(data);
    } catch (error: any) {
      console.error(`[ML API] Error fetching ${query}:`, error.message);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
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
