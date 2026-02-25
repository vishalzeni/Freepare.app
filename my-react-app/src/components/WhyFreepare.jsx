import {
  BadgeCheck,
  CirclePlay,
  Globe,
  GraduationCap,
  HandCoins,
  Timer,
  Users,
} from "lucide-react";

const cardData = [
  {
    icon: Users,
    title: "User Experience",
    description:
      "FREEPARE is designed with a clean, intuitive interface so students can focus on learning without distractions.",
  },
  {
    icon: BadgeCheck,
    title: "Quality Assurance",
    description:
      "Every test and study resource is curated by subject experts to keep content accurate and reliable.",
  },
  {
    icon: GraduationCap,
    title: "Level Wise Segregation",
    description:
      "Questions are grouped by difficulty so you can train weak areas and build mastery step by step.",
  },
  {
    icon: HandCoins,
    title: "No Sign-Up Fees",
    description:
      "Everything on FREEPARE stays free. No hidden charges and no forced premium upgrades.",
  },
  {
    icon: Timer,
    title: "High-Quality Mock Tests",
    description:
      "Mock tests are built to match real exam patterns and help you assess readiness with confidence.",
  },
  {
    icon: CirclePlay,
    title: "Updated Question Bank",
    description:
      "Question banks are refreshed regularly to reflect current exam trends and expected formats.",
  },
  {
    icon: Globe,
    title: "Global Accessibility",
    description:
      "Students can access FREEPARE from anywhere on any modern device with a stable internet connection.",
  },
];

const WhyFreepare = () => {
  return (
    <section style={{ width: "100%", padding: "16px" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            margin: "0 0 16px",
            fontSize: "2rem",
            fontWeight: 600,
            background: "linear-gradient(90deg, rgb(240, 82, 161) 30%, #FFD700 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Why FREEPARE?
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {cardData.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  padding: "20px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.06)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                  <Icon size={42} color="#066C98" />
                </div>
                <h3
                  style={{
                    margin: "0 0 10px",
                    textAlign: "center",
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    background: "linear-gradient(90deg, rgb(240, 82, 161) 30%, #FFD700 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {card.title}
                </h3>
                <p style={{ margin: 0, color: "#374151", lineHeight: 1.6 }}>
                  {card.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyFreepare;

