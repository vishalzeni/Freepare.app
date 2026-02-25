import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./admin/Admin";
import Test from "./pages/Test";
import SignupPage from "./pages/Authentication/SignupPage";
import LoginPage from "./pages/Authentication/LoginPage";

/* Admin sub-pages */
import Panel from "./admin/Panel/Panel";
import Upload from "./admin/ExamUpload";
import AdminCode from "./admin/AdminCode";
import AdminDashboard from "./admin/Dashboard";

// Import the SessionProvider
import { SessionProvider } from './SessionExpireCheck/SessionProvider';
import ErrorPage from "./pages/ErrorPage";
import ExamsList from "./admin/ExamsList";

const App = () => {
  return (
    <>
      <SessionProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<Test />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/panel" element={<Panel />} />
            <Route path="/admin/uploaded-tests" element={<ExamsList />} />
            <Route path="/admin/upload" element={<Upload />} />
            <Route path="/admin/code" element={<AdminCode />} />
            <Route path="/admin/users" element={<AdminDashboard />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<ErrorPage/>} />
          </Routes>
        </Router>
      </SessionProvider>
    </>
  );
};

export default App;
