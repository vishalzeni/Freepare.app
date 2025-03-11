import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const FAQ = () => {
  const faqs = [
    {
      question: "What is FREEPARE?",
      answer:
        "FREEPARE provides high-quality exam preparation resources completely free of charge.",
    },
    {
      question: "How can I use FREEPARE?",
      answer:
        "You can access study materials and practice tests directly from our website without any registration.",
    },
    {
      question: "Is FREEPARE really free?",
      answer: "Yes, FREEPARE is 100% free and always will be.",
    },
    {
      question: "Do I need to sign up to use FREEPARE?",
      answer:
        "No, you can start using all resources instantly without signing up.",
    },
    {
      question: "Can I contribute to FREEPARE?",
      answer:
        "Yes, we welcome contributions! Reach out to us to learn more about how you can help.",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#066C98", mb: 3, fontSize: "1.6rem",                 background: "linear-gradient(90deg, #066C98, #2CACE3)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent", }}
      >
        Frequently Asked Questions
      </Typography>
      {faqs.map((faq, index) => (
        <Accordion
          key={index}
          sx={{ mb: 2, backgroundColor: "#fff", borderRadius: "8px" }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
            sx={{ backgroundColor: "#066C98", borderRadius: "8px 8px 0 0" }}
          >
            <Typography variant="h4" sx={{ color: "#fff", fontWeight: 500 }}>
              {faq.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#555" }}>
              {faq.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
};

export default FAQ;
