import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import Home from "./pages/Home";
import Admin from "./pages/Admin/Admin";
import Test from "./pages/Test";
import SignupPage from "./pages/Authentication/SignupPage";
import LoginPage from "./pages/Authentication/LoginPage";

// Import the SessionProvider
import { SessionProvider } from './SessionExpireCheck/SessionProvider';

const App = () => {
  return (
    <>
      <CssBaseline />
      {/* Wrap your entire app with the SessionProvider */}
      <SessionProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<Test />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </Router>
      </SessionProvider>
    </>
  );
};

export default App;
