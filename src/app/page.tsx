"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Upload, Link2, Sparkles, Loader2, FileText, Globe } from "lucide-react";

type Lang = "ua" | "en";

const translations = {
  ua: {
    title: "AI Супровідний лист",
    subtitle: "PDF + посилання → ідеальний лист за 10 секунд",
    resume: "Резюме",
    resumePlaceholder: "Або встав текст...",
    uploadPdf: "Завантаж PDF",
    vacancy: "Вакансія",
    vacancyPlaceholder: "https://jobs.dou.ua/...",
    fetchText: "Взяти текст",
    generate: "Створити супровідний лист",
    generating: "Генеруємо...",
    result: "Твій лист",
    resultPlaceholder: "Тут з’явиться твій ідеальний супровідний лист",
    pdfUploaded: "PDF завантажено!",
    vacancyFetched: "Вакансія завантажена!",
    ready: "Готовий!",
    pay10: "10 листів за $2",
    payUnlimited: "Безлім назавжди за $5",
    payNote: "Після оплати доступ відкриється автоматично",
  },
  en: {
    title: "AI Cover Letter",
    subtitle: "PDF + link → perfect letter in 10 seconds",
    resume: "Resume",
    resumePlaceholder: "Or paste your text...",
    uploadPdf: "Upload PDF",
    vacancy: "Job Posting",
    vacancyPlaceholder: "https://jobs.dou.ua/...",
    fetchText: "Fetch text",
    generate: "Generate Letter",
    generating: "Generating...",
    result: "Your Letter",
    resultPlaceholder: "Your perfect cover letter will appear here",
    pdfUploaded: "Resume uploaded!",
    vacancyFetched: "Job posting loaded!",
    ready: "Ready!",
    pay10: "10 letters for $2",
    payUnlimited: "Unlimited forever for $5",
    payNote: "Access opens automatically after payment",
  },
};

export default function Home() {
  const [lang, setLang] = useState<Lang>("ua");
  const [resume, setResume] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [letter, setLetter] = useState("");
  const [loadingScrape, setLoadingScrape] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    if (navigator.language.startsWith("en")) setLang("en");
    const paid = localStorage.getItem("coverletter_paid");
    if (paid === "true") setHasPaid(true);
  }, []);

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error(lang === "ua" ? "Тільки PDF" : "PDF only");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setResume(`PDF_BASE64:${base64}`);
      toast.success(t.pdfUploaded);
    };
    reader.readAsDataURL(file);
  };

  const fetchJobFromUrl = async () => {
    if (!jobUrl.trim()) return toast.error(lang === "ua" ? "Встав посилання" : "Paste link");
    setLoadingScrape(true);
    try {
      const res = await fetch("/api/scrape-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl }),
      });
      const data = await res.json();
      if (data.text) {
        setJobDescription(data.text);
        toast.success(t.vacancyFetched);
      } else {
        toast.error(data.error || (lang === "ua" ? "Не вдалося витягнути текст" : "Failed to fetch text"));
      }
    } catch {
      toast.error(lang === "ua" ? "Помилка сервера" : "Server error");
    }
    setLoadingScrape(false);
  };

  const generate = async () => {
    if (!hasPaid) {
      toast.error(lang === "ua" ? "Купи доступ для генерації" : "Buy access to generate");
      return;
    }
    if (!resume) return toast.error(lang === "ua" ? "Додай резюме" : "Add resume");
    if (!jobDescription) return toast.error(lang === "ua" ? "Додай вакансію" : "Add job posting");

    setLoadingGenerate(true);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume, jobDescription, language: lang === "ua" ? "Українська" : "Англійська" }),
    });
    const data = await res.json();
    if (data.letter) {
      setLetter(data.letter);
      toast.success(t.ready);
    } else {
      toast.error(data.error || (lang === "ua" ? "Помилка генерації" : "Generation error"));
    }
    setLoadingGenerate(false);
  };

  return (
    <>
      {/* Фон */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="absolute top-20 -left-32 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -right-32 w-96 h-96 bg-pink-600/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative min-h-screen p-4 sm:p-6 lg:p-12">
        <Toaster position="top-center" />

        {/* Перемикач мови */}
        <div className="fixed top-6 right-6 z-50">
          <button
            onClick={() => setLang(lang === "ua" ? "en" : "ua")}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 hover:border-purple-400 transition-all"
          >
            <Globe className="w-5 h-5" />
            <span className="font-medium">{lang === "ua" ? "UA" : "EN"}</span>
          </button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
            {t.title}
          </h1>
          <p className="text-xl lg:text-2xl text-purple-200 mt-4">
            {t.subtitle}
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Ліва частина */}
          <div className="space-y-8">
            {/* Резюме */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="w-8 h-8 text-purple-400" />
                <h3 className="text-2xl font-bold">{t.resume}</h3>
              </div>

              <label className="block cursor-pointer">
                <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
                <div className="border-2 border-dashed border-purple-500/50 rounded-2xl p-12 text-center hover:border-purple-400 transition-all">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                  <p className="text-xl">{t.uploadPdf}</p>
                </div>
              </label>

              <textarea
                placeholder={t.resumePlaceholder}
                value={resume.startsWith("PDF_BASE64:") ? (lang === "ua" ? "PDF завантажено" : "PDF uploaded") : resume}
                onChange={(e) => setResume(e.target.value)}
                rows={4}
                className="w-full mt-6 p-4 bg-black/30 border border-white/10 rounded-2xl focus:border-purple-400 outline-none resize-none"
              />
            </div>

            {/* Вакансія */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Link2 className="w-8 h-8 text-purple-400" />
                <h3 className="text-2xl font-bold">{t.vacancy}</h3>
              </div>

              <div className="flex gap-4">
                <input
                  type="url"
                  placeholder={t.vacancyPlaceholder}
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="flex-1 px-4 py-4 bg-black/30 border border-white/10 rounded-2xl focus:border-purple-400 outline-none"
                />
                <button
                  onClick={fetchJobFromUrl}
                  disabled={loadingScrape}
                  className="px-8 py-4 bg-purple-600 rounded-2xl font-bold hover:bg-purple-700"
                >
                  {loadingScrape ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : t.fetchText}
                </button>
              </div>

              <textarea
                placeholder="..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={6}
                className="w-full mt-4 p-4 bg-black/30 border border-white/10 rounded-2xl focus:border-purple-400 outline-none resize-none"
              />
            </div>

            {/* Gumroad оплата */}
            {!hasPaid && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* $2 */}
                <a
                  href="https://mochalove2.gumroad.com/l/loqdhq"
                  target="_blank"
                  className="block p-8 bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl text-center hover:scale-105 transition-all"
                >
                  <div className="text-5xl font-bold mb-2">$2</div>
                  <div className="text-xl font-bold">10 листів</div>
                </a>

                {/* $5 */}
                <a
                  href="https://mochalove2.gumroad.com/l/ktoty"
                  target="_blank"
                  className="block p-8 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-700 rounded-3xl text-center hover:scale-110 transition-all ring-4 ring-yellow-400"
                >
                  <div className="text-6xl font-bold mb-2">$5</div>
                  <div className="text-2xl font-bold text-yellow-300">Безлім назавжди</div>
                </a>
              </div>
            )}

            {/* Генерація */}
            {hasPaid && (
              <button
                onClick={generate}
                disabled={loadingGenerate}
                className="w-full py-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl font-bold text-3xl hover:scale-105 transition-all"
              >
                {loadingGenerate ? t.generating : t.generate}
              </button>
            )}
          </div>

          {/* Результат */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-10 h-10 text-purple-400" />
              <h3 className="text-3xl font-bold">{t.result}</h3>
            </div>

            {letter ? (
              <div className="prose prose-invert max-w-none text-lg leading-relaxed">
                {letter.split("\n").map((line, i) => (
                  <p key={i} className="mb-4">{line || <br />}</p>
                ))}
              </div>
            ) : (
              <p className="text-center text-purple-300/60 text-2xl py-32">
                {t.resultPlaceholder}
              </p>
            )}
          </div>
        </div>

        {!hasPaid && (
          <p className="text-center text-purple-300 mt-12">
            {t.payNote}
          </p>
        )}
      </div>
    </>
  );
}