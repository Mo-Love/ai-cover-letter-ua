import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  const { resume = "", jobDescription = "", language = "Українська" } = await req.json();

  const resumeText = resume.slice(0, 2000);
  const jobText = jobDescription.slice(0, 4000);

  const prompt = `Ти — найкращий кар'єрний коуч України.

Напиши потужний супровідний лист на ${language} мові.

Резюме кандидата:
${resumeText || "Резюме додано"}

Вакансія:
${jobText || "Вакансія додана"}

250–350 слів, з цифрами, щиро, без кліше типу "passionate about".
Закінчи сильним CTA.

Після листа додай розділ "Чому цей лист працює" (3–5 пунктів).`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1200,
    });

    return Response.json({
      letter: completion.choices[0]?.message?.content || "Помилка генерації",
    });
  } catch (error) {
    return Response.json({ error: "Не вдалося згенерувати" }, { status: 500 });
  }
}