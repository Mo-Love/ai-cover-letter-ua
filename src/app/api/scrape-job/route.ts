// src/app/api/generate/route.ts
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  const { resume, jobDescription, language = "Українська" } = await req.json();

  let resumeText = typeof resume === "string" ? resume.slice(0, 2000) : "Резюме додано";
  const cleanJob = typeof jobDescription === "string" ? jobDescription.slice(0, 4000) : "";

  const prompt = `Ти — найкращий кар'єрний коуч України.

Напиши потужний супровідний лист на ${language} мові.

Резюме кандидата (скорочено):
${resumeText}

Вакансія (скорочено):
${cleanJob}

250–350 слів, конкретні цифри, чому ця компанія, щирий тон, без кліше.
Закінчи сильним CTA.

Після листа додай розділ "Чому цей лист працює" (3–5 пунктів).`;

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
    return Response.json(
      { error: error?.error?.message || "Не вдалося згенерувати" },
      { status: 500 }
    );
  }
}