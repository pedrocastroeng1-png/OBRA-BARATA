export default async function handler(req: any, res: any) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Missing query parameter 'q'" });
  }

  try {
    const response = await fetch(
      `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(q as string)}&condition=new&limit=20`
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: `ML API error: ${response.statusText}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
