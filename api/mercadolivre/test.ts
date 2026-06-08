export default async function handler(req: any, res: any) {
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
}
