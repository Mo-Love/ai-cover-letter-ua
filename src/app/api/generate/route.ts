// src/app/api/generate/route.ts
import { Groq } from "groq-sdk";
import PDFParser from "pdf2json";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  apiKey: process.env.GROQ_API_KEY 
});

export async function POST(req: Request) {
  const { resume, jobDescription } = await req.json();

  let resumeText = resume;

  // Якщо прийшов PDF (base64)
  if (typeof resume === "string" && resume.startsWith("PDF_BASE64:")) {
    try {
      const base64 = resume.replace("PDF_BASE64:", "");
      const buffer = Buffer.from(base64, "base64");

      // Парсимо з pdf2json
      const pdfParser = new PDFParser();
      const data = await new Promise<any>((resolve, reject) => {
        pdfParser.on("pdfParser_dataError", reject);
        pdfParser.on("pdfParser_dataReady", resolve);
        pdfParser.parseBuffer(buffer);
      });

      // Витягуємо текст з сторінок
      resumeText = data.Pages.map((page: any) => 
        page.Texts.map((text: any) => decodeURIComponent(text.R[0].T)).join(" ")
      ).join("\n");
    } catch (e) {
      return Response.json({ error: "Не вдалось прочитати PDF" }, { status: 400 });
    }
  }

  const prompt = `Ти — найкращий кар'єрний коуч України.

Напиши ВБИВЧИЙ супровідний лист українською.

Резюме кандидата:
${resumeText}

Вакансія:
${jobDescription}

250–350 слів, конкретні цифри, чому саме ця компанія, щирий тон, потужний CTA.
Після листа додай розділ "Чому цей лист працює:" (3–5 пунктів).`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 1300,
  });

  return Response.json({ letter: completion.choices[0]?.message?.content });
}