import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Grid,
  Paper,
  Link,
  CircularProgress,
  Snackbar,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import PasswordStrengthBar from "react-password-strength-bar";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import img from "../../Assets/Freepare_LogIn.png";

const BASE_URL = "http://localhost:5000";

const AuthForm = ({ type }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const firstInputRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (password && confirmPassword) {
      setPasswordError(password === confirmPassword ? "" : "Passwords do not match");
    }
  }, [password, confirmPassword]);

  const validateEmail = useCallback((email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }, []);

  const validatePhone = useCallback((phone) => {
    const re = /^\d{10}$/;
    return re.test(String(phone));
  }, []);

  const formatPhoneNumber = (phone) => {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  const sanitizePhoneNumber = (phone) => {
    return phone.replace(/\D/g, '');
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setPhoneError("");
    setPasswordError("");

    if (!validateEmail(email)) {
      setEmailError("Invalid email format");
      return;
    }

    if (type === "signup" && !validatePhone(phone)) {
      setPhoneError("Invalid phone number format");
      return;
    }

    if (type === "signup" && password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    const payload = {
      email,
      password,
      ...(type === "signup" && { phone: sanitizePhoneNumber(phone), firstName, lastName }),
    };

    try {
      const response = await fetch(`${BASE_URL}/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      const data = await response.json();
      if (data.success) {
        localStorage.setItem("jwtToken", data.token);

        if (window.opener) {
          window.opener.postMessage("AUTH_SUCCESS", window.location.origin);
        }

        window.close();
      } else {
        setError(data.message || "An error occurred. Please try again.");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      setSnackbarMessage(type === "signup" ? "Account created successfully" : "Welcome back!");
      setSnackbarOpen(true);
      if (type === "signup") {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFirstName("");
        setLastName("");
        setPhone("");
      }
    }
  }, [email, password, confirmPassword, firstName, lastName, phone, type, validateEmail, validatePhone]);

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom,rgb(255, 255, 255), #e3f2fd)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          justifyItems: "center",
          alignItems: "center",
          fontSize: "4rem",
          fontWeight: 700,
          color: "rgba(0, 0, 0, 0.02)",
          textTransform: "uppercase",
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 0,
          gap: "30px",
        }}
      >
        {Array(100)
          .fill("Freepare")
          .map((text, index) => (
            <Box key={index}>{text}</Box>
          ))}
      </Box>

      <Grid
        item
        xs={false}
        sm={4}
        md={5}
        sx={{
          backgroundImage: {xs: "none", sm: `url(${img})`},
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "70vh",
          display: { xs: "none", sm: "block" },
        }}
      ></Grid>

      <Grid
        item
        xs={11}
        sm={8}
        md={5}
        sx={{
          zIndex: 1,
          height: "auto",
          padding: 0,
        }}
      >
        <Paper
          elevation={5}
          sx={{
            padding: 4,
            borderRadius: 3,
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            <Typography
              variant="h3"
              textAlign="center"
              color="primary"
              fontWeight="600"
              gutterBottom
            >
              {type === "signup" ? "Create an Account" : "Welcome Back!"}
            </Typography>
            <Typography
              variant="body1"
              textAlign="center"
              color="textSecondary"
              sx={{ marginBottom: 3 }}
            >
              {type === "signup"
                ? "Join Freepare today to unlock endless possibilities."
                : "Log in to your Freepare account and continue your journey."}
            </Typography>
            {error && (
              <Alert severity="error" sx={{ marginBottom: 2 }} aria-live="assertive">
                {error}
              </Alert>
            )}

            {type === "signup" && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    margin="normal"
                    variant="outlined"
                    inputRef={firstInputRef}
                    aria-label="First Name"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    margin="normal"
                    variant="outlined"
                    aria-label="Last Name"
                  />
                </Grid>
              </Grid>
            )}

            {type === "signup" ? (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      type="text"
                      value={phone}
                      onChange={(e) => {
                        setPhone(formatPhoneNumber(e.target.value));
                        setPhoneError(validatePhone(e.target.value) ? "" : "Invalid phone number format");
                      }}
                      required
                      margin="normal"
                      variant="outlined"
                      error={!!phoneError}
                      helperText={phoneError}
                      aria-label="Phone Number"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError(validateEmail(e.target.value) ? "" : "Invalid email format");
                      }}
                      required
                      margin="normal"
                      variant="outlined"
                      error={!!emailError}
                      helperText={emailError}
                      aria-label="Email Address"
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      margin="normal"
                      variant="outlined"
                      error={!!passwordError}
                      helperText={passwordError}
                      aria-label="Password"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    {password && (
                      <PasswordStrengthBar password={password} onChangeScore={(score) => {
                        setPasswordStrength(score);
                      }} />
                    )}
                    
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      margin="normal"
                      variant="outlined"
                      aria-label="Confirm Password"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle confirm password visibility"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(validateEmail(e.target.value) ? "" : "Invalid email format");
                  }}
                  required
                  margin="normal"
                  variant="outlined"
                  inputRef={firstInputRef}
                  error={!!emailError}
                  helperText={emailError}
                  aria-label="Email Address"
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  margin="normal"
                  variant="outlined"
                  aria-label="Password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{
                paddingY: 1.5,
                marginTop: 2,
                fontSize: "1rem",
                textTransform: "none",
              }}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: "#fff" }} />
              ) : type === "signup" ? (
                "Sign Up"
              ) : (
                "Log In"
              )}
            </Button>

            {type === "login" && (
              <Typography variant="body1" align="center" sx={{ mt: 2 }}>
                Don't have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/signup"
                  underline="hover"
                  sx={{ color: "#066C98", fontWeight: 500 }}
                >
                  Sign up now
                </Link>
              </Typography>
            )}
          </Box>

          {type === "signup" && (
            <Typography variant="body1" align="center" sx={{ mt: 2 }}>
              Already have an account?{" "}
              <Link
                component={RouterLink}
                to="/login"
                underline="hover"
                sx={{ color: "#066C98", fontWeight: 500 }}
              >
                Click here to login
              </Link>
            </Typography>
          )}
        </Paper>
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        ContentProps={{
          sx: {
            backgroundColor: snackbarMessage.includes("successfully") ? "green" : "red",
          },
        }}
      />
    </Grid>
  );
};

export default AuthForm;
