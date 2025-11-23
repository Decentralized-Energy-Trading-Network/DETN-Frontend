import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  InputAdornment,
  IconButton,
  useMediaQuery,
  Checkbox,
  FormControlLabel,
  Link,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Google,
  Facebook,
  Twitter
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/Images/Energy/ghasw.webp'
import userService from '../services/user.services';


const SignInPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await userService.login({ email, password });
      // Redirect to dashboard or home page after successful login
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: isMobile ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={isMobile ? 0 : 6}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: isMobile ? 'rgba(255, 255, 255, 0.9)' : 'white',
          }}
        >
          <Grid container>
            {/* Image Section - Hidden on mobile */}
            {!isMobile && (
              <Grid
                item
                md={6}
                sx={{
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  minHeight: '600px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                }}
              >
                <Box
                  sx={{
                    p: 4,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                  }}
                >
                  <Typography variant="h4" component="h1" gutterBottom>
                    Energy Trading Platform
                  </Typography>
                  <Typography variant="body1">
                    Decentralized energy trading solutions for a sustainable future.
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Sign-in Form Section */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                p: { xs: 3, sm: 4, md: 6 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  Sign In
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Welcome back! Please sign in to your account
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                {error && (
                  <Typography color="error" sx={{ mt: 1, mb: 2 }}>
                    {error}
                  </Typography>
                )}

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        color="primary"
                        size="small"
                      />
                    }
                    label="Remember me"
                  />
                  <Link href="#" variant="body2" color="primary">
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    mb: 3,
                    borderRadius: 2,
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="body2">
                    Don't have an account?{' '}
                    <Link href="/signup" variant="body2" color="primary">
                      Sign Up
                    </Link>
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Google />}
                    sx={{ borderRadius: 2 }}
                  >
                    Google
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Facebook />}
                    sx={{ borderRadius: 2 }}
                  >
                    Facebook
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Twitter />}
                    sx={{ borderRadius: 2 }}
                  >
                    Twitter
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignInPage;