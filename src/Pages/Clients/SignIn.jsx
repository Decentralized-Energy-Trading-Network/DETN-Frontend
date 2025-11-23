import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Link, 
  Grid, 
  Avatar,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Divider,
  Chip,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { LockOutlined, AccountBalanceWallet } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import clientService from '../../services/client.services';
import { loginStart, loginSuccess, loginFailure } from '../../store/auth';
import { showToast } from '../../utils/toast';

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

export default function LoginPage() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [connectedAddress, setConnectedAddress] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await clientService.login({ email, password });
      dispatch(loginSuccess(response.data));
      setSuccess('Successfully signed in!');
      setTimeout(() => navigate('/clients/marketplace'), 1000);
    } catch (error) {
      dispatch(loginFailure(error.message));
      setError(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    dispatch(loginStart());
    setWalletLoading(true);

    try {
      // Step 1: Connect to wallet
      const address = await connectWallet();
      setConnectedAddress(address);
      showToast.info('Wallet connected! Signing message...');

      // Step 2: Get nonce from backend
      const nonceResponse = await clientService.getNonce(address);
      const nonce = nonceResponse.data.nonce;

      // Step 3: Sign the nonce
      const signature = await signMessage(nonce, address);

      // Step 4: Send signature to backend for verification
      const loginResponse = await clientService.walletLogin({
        walletAddress: address,
        signature: signature,
      });

      dispatch(loginSuccess(loginResponse.data));
      showToast.success('Successfully signed in with wallet!');
      setTimeout(() => navigate('/clients/marketplace'), 1000);
    } catch (error) {
      dispatch(loginFailure(error.message));
      showToast.error(error.message || 'Failed to sign in with wallet');
      setConnectedAddress('');
    } finally {
      setWalletLoading(false);
    }
  };

  const handleDisconnectWallet = () => {
    setConnectedAddress('');
    setSuccess('');
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined';
  };

  return (
    <Grid container justifyContent="center">
      <Box
        sx={{
          mt: 8,
          p: 4,
          maxWidth: 450,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlined />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          Sign in to SolarTrade
        </Typography>

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

        {/* Wallet Login Section */}
        <Card sx={{ width: '100%', mb: 3, border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <AccountBalanceWallet 
              sx={{ 
                fontSize: 40, 
                color: 'primary.main',
                mb: 1 
              }} 
            />
            <Typography variant="h6" gutterBottom>
              Connect Your Wallet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Sign in securely with your blockchain wallet
            </Typography>

            {/* Connected Wallet Info */}
            {connectedAddress ? (
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={`Connected: ${formatAddress(connectedAddress)}`}
                  onDelete={handleDisconnectWallet}
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Click "Sign in with Wallet" to continue
                </Typography>
              </Box>
            ) : (
              !isMetaMaskInstalled() && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  MetaMask not detected. Please install MetaMask to continue.
                </Alert>
              )
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={walletLoading ? <CircularProgress size={20} color="inherit" /> : <AccountBalanceWallet />}
              onClick={handleWalletLogin}
              disabled={walletLoading || !isMetaMaskInstalled()}
              sx={{
                py: 1.5,
                backgroundColor: connectedAddress ? '#2e7d32' : 'primary.main',
                '&:hover': {
                  backgroundColor: connectedAddress ? '#1b5e20' : 'primary.dark',
                }
              }}
            >
              {walletLoading 
                ? 'Signing...' 
                : connectedAddress 
                  ? 'Sign in with Wallet' 
                  : 'Connect Wallet'
              }
            </Button>
          </CardContent>
        </Card>

        <Divider sx={{ width: '100%', my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        {/* Traditional Login Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                color="primary" 
              />
            }
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="outlined"
            disabled={loading}
            sx={{ 
              mt: 2, 
              mb: 2, 
              py: 1.5,
              borderColor: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In with Email'}
          </Button>
          
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="/signup" variant="body2">
                Don't have an account? Sign Up
              </Link>
            </Grid>
          </Grid>
        </Box>

        {/* MetaMask Installation Prompt */}
        {!isMetaMaskInstalled() && (
          <Card sx={{ width: '100%', mt: 3, backgroundColor: 'warning.light' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Need a wallet? Install MetaMask
              </Typography>
              <Button 
                variant="text" 
                size="small" 
                href="https://metamask.io/download.html" 
                target="_blank"
                rel="noopener noreferrer"
              >
                Get MetaMask
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>
    </Grid>
  );
}