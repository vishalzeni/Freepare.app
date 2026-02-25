import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is FREEPARE?",
    answer:
      "FREEPARE provides high-quality exam preparation resources completely free of charge.",
  },
  {
    question: "How can I use FREEPARE?",
    answer:
      "You can access study materials and practice tests directly from the platform without paid plans.",
  },
  {
    question: "Is FREEPARE really free?",
    answer: "Yes, FREEPARE is 100% free and always will be.",
  },
  {
    question: "Do I need to sign up?",
    answer: "You can explore resources first, and sign up when you want to track your progress.",
  },
  {
    question: "Can I contribute to FREEPARE?",
    answer: "Yes. Reach out to the team if you want to contribute content or improvements.",
  },
];

const FAQItem = ({ question, answer, open, onToggle }) => {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-[#066C98] px-4 py-3 text-left text-white"
      >
        <span className="text-sm font-semibold sm:text-base">{question}</span>
        <ChevronDown
          size={18}
          className={`transition ${open ? "rotate-180" : "rotate-0"}`}
          aria-hidden
        />
      </button>
      {open && <p className="px-4 py-3 text-sm leading-6 text-slate-600">{answer}</p>}
    </article>
  );
};

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="mx-auto my-10 w-full max-w-5xl px-4 sm:px-6">
      <h2 className="mb-5 text-center text-2xl font-bold text-[#066C98] sm:text-3xl">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <FAQItem
            key={faq.question}
            question={faq.question}
            answer={faq.answer}
            open={activeIndex === index}
            onToggle={() => setActiveIndex((prev) => (prev === index ? -1 : index))}
          />
        ))}
      </div>
    </section>
  );
};

export default FAQ;
