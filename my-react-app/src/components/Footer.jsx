import React from "react";
import { Box, Container, Grid, Typography, Divider } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{
        background: "linear-gradient(to top,rgb(255, 255, 255), #e3f2fd)",
        padding: { xs: 1, sm: 2, md: 2 },
        color: "#555",
      }}
    >
      {/* Divider in the middle with some cut from left and right */}
      <Box sx={{ width: "90%", mx: "auto", mb: 4, mt: 2 }}>
        <Divider sx={{ height: "2px", backgroundColor: "#066C98" }} />
      </Box>

      <Container maxWidth="lg">
        <Grid container justifyContent="center">
          {/* Remaining Section: About Us */}
          <Grid item xs={12} sm={8} md={6}>
            <Typography
              variant="h3"
              sx={{
                mb: 2,
                textAlign: "center",
                background: `linear-gradient(90deg,rgb(240, 82, 161) 30%, #FFD700 100%)`,          
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 500,                fontSize: "1.5rem",
              }}
            >
              About Us
            </Typography>
            <Typography variant="body1" sx={{ textAlign: "center" }}>
              FREEPARE provides high-quality exam preparation resources
              completely free of charge, helping students ace their exams with
              ease. We aim to make learning accessible and efficient for
              everyone by offering expertly curated study materials and practice
              tests.
            </Typography>
          </Grid>
        </Grid>

        {/* Footer Bottom */}
        <Box sx={{ mt: 4, textAlign: "center", color: "#777", fontSize: "0.9rem", fontWeight: 500 }}>
          <Typography variant="body2" sx={{ fontSize: "0.9rem" }}>
            © {new Date().getFullYear()} FREEPARE. All Rights Reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
