export default async function handler(req: any, res: any) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Missing query parameter 'q'" });
  }

  const targetUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(q as string)}&condition=new&limit=20`;
  console.log(`[ML API] Fetching: ${targetUrl}`);

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138 Safari/537.36",
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });

    console.log(`[ML API] Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[ML API] Error Body API: ${errorBody}`);
      return res.status(response.status).json({ 
        error: `ML API error: ${response.statusText}`,
        details: errorBody 
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error(`[ML API] Catch Error: ${error.message}`);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
