import React from "react";
import Hierarchy from "./Hierarchy/Hierarchy";
import { Box } from "@mui/material";
import Navbar from "../components/Navbar";
import SessionExpireDialog from "../SessionExpireCheck/SessionExpireDialog";
import JoinUs from "../components/JoinUs";
import Footer from "../components/Footer";
import WhyFreepare from "../components/WhyFreepare";
const Home = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <Box
        sx={{
          flexGrow: 1,
          width: "100%",
          background: "linear-gradient(to bottom,rgb(255, 255, 255), #e3f2fd)",
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(to bottom,rgb(251, 253, 255) 0%, #e3f2fd 100%)",
          }}
        >
          <Navbar />
          <main aria-label="Main content">
            <Hierarchy />
          </main>
          <section aria-label="Signup">
            <JoinUs />
          </section>
          <section aria-label="Why Freepare">
          <WhyFreepare />
        </section>
        <section aria-label="Footer">
          <Footer />
        </section>
        </Box>
        <SessionExpireDialog />
        
      </Box>
    </Box>
  );
};

export default Home;
