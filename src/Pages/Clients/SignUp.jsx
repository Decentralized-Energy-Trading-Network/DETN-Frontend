import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Link, 
  Grid, 
  Avatar,
  CircularProgress,
  Divider,
  Chip,
  Alert,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { HowToRegOutlined, AccountBalanceWallet, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import clientService from '../../services/client.services';

// Web3 utility functions
const connectWallet = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      return accounts[0];
    } catch (error) {
      throw new Error('User rejected wallet connection');
    }
  } else {
    throw new Error('MetaMask is not installed');
  }
};

const signMessage = async (message, address) => {
  try {
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address],
    });
    return signature;
  } catch (error) {
    throw new Error('User rejected signature');
  }
};

const steps = ['Connect Wallet', 'Personal Info', 'Complete Registration'];

export default function SignupPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    walletAddress: '',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [connectedAddress, setConnectedAddress] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleConnectWallet = async () => {
    setWalletLoading(true);
    setError('');

    try {
      const address = await connectWallet();
      setConnectedAddress(address);
      setFormData(prev => ({ ...prev, walletAddress: address }));
      setSuccess('Wallet connected successfully!');
      setTimeout(() => {
        setActiveStep(1);
        setSuccess('');
      }, 1000);
    } catch (error) {
      setError(error.message);
    } finally {
      setWalletLoading(false);
    }
  };

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setActiveStep(2);
  };

  const handleCompleteRegistration = async () => {
    setLoading(true);
    setError('');

    try {
      // Sign a registration message with wallet
      const registrationMessage = `Welcome to SolarTrade! Please sign this message to complete your registration. Email: ${formData.email}`;
      const signature = await signMessage(registrationMessage, connectedAddress);

      // Send registration data to backend
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        walletAddress: connectedAddress,
        signature: signature,
        registrationMessage: registrationMessage
      };

      await clientService.register(registrationData);
      setSuccess('Registration successful! Redirecting to dashboard...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Registration failed');
      setActiveStep(1); // Go back to personal info step
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined';
  };

  // Step 1: Wallet Connection
  const renderWalletStep = () => (
    <Card sx={{ width: '100%', mb: 3 }}>
      <CardContent sx={{ textAlign: 'center', p: 4 }}>
        <AccountBalanceWallet 
          sx={{ 
            fontSize: 48, 
            color: 'primary.main',
            mb: 2 
          }} 
        />
        <Typography variant="h5" gutterBottom>
          Connect Your Wallet
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Connect your Web3 wallet to start your journey with SolarTrade
        </Typography>

        {connectedAddress ? (
          <Box sx={{ mb: 3 }}>
            <Chip
              icon={<CheckCircle />}
              label={`Connected: ${formatAddress(connectedAddress)}`}
              color="success"
              variant="outlined"
              sx={{ mb: 2, py: 2 }}
            />
            <Typography variant="body2" color="success.main">
              Wallet connected successfully! Click continue to proceed.
            </Typography>
          </Box>
        ) : (
          !isMetaMaskInstalled() && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              MetaMask not detected. Please install MetaMask to continue.
            </Alert>
          )
        )}

        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={walletLoading ? <CircularProgress size={20} color="inherit" /> : <AccountBalanceWallet />}
          onClick={handleConnectWallet}
          disabled={walletLoading || !isMetaMaskInstalled() || !!connectedAddress}
          sx={{ py: 1.5, mb: 2 }}
        >
          {walletLoading ? 'Connecting...' : connectedAddress ? 'Connected' : 'Connect Wallet'}
        </Button>

        {connectedAddress && (
          <Button
            fullWidth
            variant="contained"
            onClick={() => setActiveStep(1)}
            sx={{ py: 1.5 }}
          >
            Continue to Personal Info
          </Button>
        )}
      </CardContent>
    </Card>
  );

  // Step 2: Personal Information
  const renderPersonalInfoStep = () => (
    <Box component="form" onSubmit={handlePersonalInfoSubmit} sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Personal Information
      </Typography>

      {connectedAddress && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Connected wallet: <strong>{formatAddress(connectedAddress)}</strong>
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            helperText="Minimum 8 characters with letters and numbers"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox 
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                color="primary" 
              />
            }
            label={
              <Typography variant="body2">
                I agree to the{' '}
                <Link href="/terms" target="_blank">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" target="_blank">
                  Privacy Policy
                </Link>
              </Typography>
            }
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={handleBack}>
          Back
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!formData.agreeToTerms}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );

  // Step 3: Complete Registration
  const renderCompleteStep = () => (
    <Card sx={{ width: '100%', textAlign: 'center', p: 4 }}>
      <CardContent>
        <CheckCircle 
          sx={{ 
            fontSize: 64, 
            color: 'success.main',
            mb: 2 
          }} 
        />
        <Typography variant="h5" gutterBottom>
          Complete Registration
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          You're almost done! Click the button below to sign a verification message and complete your registration.
        </Typography>

        <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Wallet:</strong> {formatAddress(connectedAddress)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Email:</strong> {formData.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Name:</strong> {formData.firstName} {formData.lastName}
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleCompleteRegistration}
          disabled={loading}
          sx={{ py: 1.5, mb: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Complete Registration'}
        </Button>

        <Button onClick={handleBack}>
          Back to Edit
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Grid container justifyContent="center">
      <Box
        sx={{
          mt: 4,
          p: 4,
          maxWidth: 600,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <HowToRegOutlined />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
          Join SolarTrade Network
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create your account to start trading energy on the blockchain
        </Typography>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Success and Error Alerts */}
        {success && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        {activeStep === 0 && renderWalletStep()}
        {activeStep === 1 && renderPersonalInfoStep()}
        {activeStep === 2 && renderCompleteStep()}

        {/* Bottom Links */}
        <Grid container justifyContent="center" sx={{ mt: 3 }}>
          <Grid item>
            <Link href="/login" variant="body2">
              Already have an account? Sign in
            </Link>
          </Grid>
        </Grid>

        {/* MetaMask Installation Prompt */}
        {!isMetaMaskInstalled() && activeStep === 0 && (
          <Card sx={{ width: '100%', mt: 3, backgroundColor: 'warning.light' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Need a wallet? Install MetaMask to get started
              </Typography>
              <Button 
                variant="text" 
                size="small" 
                href="https://metamask.io/download.html" 
                target="_blank"
                rel="noopener noreferrer"
              >
                Install MetaMask
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>
    </Grid>
  );
}