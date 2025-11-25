// src/app/api/scrape-job/route.ts
export async function POST(req: Request) {
  const { url } = await req.json();

  try {
    // Стабільний проксі 2025 — corsproxy.io (з Reddit/G2, без Cloudflare-блоків)
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl, { 
      timeout: 15000, // 15 сек таймаут
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } // імітація браузера
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Очищуємо HTML
    const text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // видаляємо скрипти
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // видаляємо стилі
      .replace(/<[^>]*>/g, ' ') // видаляємо теги
      .replace(/\s+/g, ' ') // пробіли
      .trim()
      .slice(0, 6000); // 6k символів

    if (text.length < 100) {
      throw new Error('Недостатньо тексту');
    }

    return Response.json({ text });
  } catch (error) {
    console.error('Scrape error:', error);
    return Response.json({ 
      error: "Не вдалося витягнути текст з сайту (проблема з сервером). Вставте опис вакансії вручну в поле нижче.",
      text: '' 
    });
  }
}