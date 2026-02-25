import { Sparkles, ArrowRight } from "lucide-react";
import img from "../Assets/Freepare_Exam_Img.png";

const featureList = [
  "Mock tests designed to match real exam patterns.",
  "Learn at your own pace on any device.",
  "Wide range of test categories.",
  "No hidden charges or subscriptions.",
  "Tailored for different competitive exams.",
  "Instant results and analysis.",
];

const JoinUs = () => {
  const handleButtonClick = () => {
    window.open("/signup", "_blank", "noopener,noreferrer");
  };

  return (
    <section className="w-full px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto grid w-full max-w-6xl gap-8 overflow-hidden rounded-3xl border border-sky-100 bg-white p-6 shadow-xl lg:grid-cols-2 lg:p-10">
        <div className="flex flex-col justify-center">
          <h2 className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">
            Choose FREEPARE. Your path to success starts today.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            At <span className="font-semibold text-slate-900">FREEPARE</span>, we help students
            prepare smarter with high-quality exam resources at zero cost.
          </p>

          <div className="mt-5 space-y-2.5">
            {featureList.map((text) => (
              <div key={text} className="flex items-start gap-2 text-sm text-slate-700 sm:text-base">
                <Sparkles size={18} className="mt-0.5 shrink-0 text-amber-500" />
                <p>{text}</p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleButtonClick}
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-[#066C98] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#045472]"
          >
            Start Free Signup
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="flex items-center justify-center">
          <img
            src={img}
            alt="FREEPARE practice"
            className="h-auto w-full max-w-xl rounded-2xl object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default JoinUs;
