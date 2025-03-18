import { Box, Button, Typography, Container } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useNavigate } from "react-router-dom";
import Logo from "../Assets/Freepare_Logo.png"; // Change this to your logo path

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        textAlign: "center", 
        height: "100vh", 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "center", 
        overflow: "hidden"
      }}
    >
      {/* Logo at the Top */}
      <Box sx={{ mb: 3, width: "60%" }}>
        <img 
          src={Logo} 
          alt="Logo"
          style={{ width: "100%", height: "auto" }}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <ErrorOutlineIcon sx={{ fontSize: 100, color: "error.main" }} />
        <Typography variant="h3" sx={{ mt: 2, fontWeight: "bold" }}>
          Oops! Something went wrong.
        </Typography>
        <Typography variant="body1" sx={{ mt: 1, color: "text.secondary" }}>
          The page you’re looking for doesn’t exist or an error occurred.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          onClick={() => navigate("/")}
        >
          Go Back Home
        </Button>
      </Box>
    </Container>
  );
};

export default ErrorPage;
