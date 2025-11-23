// src/app/api/scrape-job/route.ts
export async function POST(req: Request) {
  const { url } = await req.json();

  // Простий скрапер через сторонній сервіс (безплатний)
  const response = await fetch("https://api.allorigins.win/raw?url=" + encodeURIComponent(url));
  const html = await response.text();

  // Видаляємо теги і залишаємо чистий текст
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, "")
                   .replace(/<style[\s\S]*?<\/style>/gi, "")
                   .replace(/<[^>]*>/g, " ")
                   .replace(/\s+/g, " ")
                   .trim();

  return Response.json({ text: text.slice(0, 10000) }); // обмежуємо довжину
}