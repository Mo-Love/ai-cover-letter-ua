// src/app/api/generate/route.ts — остаточна версія 2025
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  const { resume, jobDescription, language = "Українська" } = await req.json();

  // Обрізаємо, щоб не було 400 помилки
  const cleanResume = typeof resume === "string" ? resume.slice(0, 2000) : "Резюме додано";
  const cleanJob = typeof jobDescription === "string" ? jobDescription.slice(0, 4000) : "Вакансія додана";

  const prompt = `Ти — найкращий кар'єрний коуч України.

Напиши ВБИВЧИЙ супровідний лист на ${language} мові.

Резюме кандидата (скорочено):
${cleanResume}

Вакансія (скорочено):
${cleanJob}

Вимоги:
- 250–350 слів
- Конкретні досягнення з резюме (якщо є цифри — використовуй)
- Чому саме ця компанія і чому зараз
- Тон: щирий, людяний, без кліше типу "passionate about"
- Закінчи потужним CTA

Після листа додай розділ:
"Чому цей лист працює:" (3–5 коротких пункти)`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1200,
    });

    const letter = completion.choices[0]?.message?.content || "Помилка генерації";

    return Response.json({ letter });
  } catch (error: any) {
    console.error("Groq error:", error);
    return Response.json({ 
      error: error?.error?.message || "Не вдалося згенерувати лист" 
    }, { status: 500 });
  }
}