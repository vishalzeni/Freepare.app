import React from "react";
import { Button, Typography, Box, Grid, Container } from "@mui/material";
import { Sparkles } from "lucide-react"; // ✨ Sparkling Star Icon
import img from "../Assets/Freepare_Exam_Img.png";

const JoinUs = () => {
  const handleButtonClick = () => {
    window.open("/signup", "_blank", "noopener,noreferrer");
  };

  return (
    <Box sx={{ width: "100%", p: { xs: 2, sm: 3, md: 4 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={8} alignItems="center">
          {/* Left Side Content */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="h2"
              gutterBottom
              sx={{
                fontWeight: "500",
                fontSize: { xs: "1.8rem", sm: "2rem", md: "2.2rem" },
                background: `linear-gradient(90deg,rgb(240, 82, 161) 30%, #FFD700 100%)`,          
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Choose FREEPARE – Your Path to Success. Start Practicing Today!
            </Typography>
            <Typography variant="body1" paragraph sx={{ color: "#555", mb: 3 }}>
              At <b>FREEPARE</b>, we are dedicated to empowering students with
              high-quality exam preparation resources – absolutely free of cost
            </Typography>

            {/* Features with Sparkling Star Icons ✨ */}
            <Box sx={{ mb: 3 }}>
              {[
                "Mock tests designed to match real exam patterns.",
                "Learn at your own pace, on any device.",
                "Wide range of test categories.",
                "No hidden charges or subscriptions.",
                "Tailored to suit a variety of competitive exams.",
                "Instant Results and Analysis.",

              ].map((text, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
                >
                  <Sparkles
                    size={20}
                    color="#FFA500"
                    style={{ marginRight: "10px" }}
                  />
                  <Typography variant="body1">{text}</Typography>
                </Box>
              ))}
            </Box>

            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleButtonClick}
              sx={{
                
                textTransform: "none",
                fontSize: "16px",
                px: 3,
                borderRadius: 1,
              }}
            >
              Sign Up
            </Button>
          </Grid>

          {/* Right Side Image */}
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={img}
              alt="Join Us"
              sx={{
                width: "100%",
                mx: "auto",
                display: "block",
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default JoinUs;
