// Pages/Clients/MarketplaceDashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  useTheme,
  useMediaQuery,
  Paper,
  Stack,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  EnergySavingsLeaf,
  ShoppingCart,
  Sell,
  AccountBalanceWallet
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import energyService from '../../services/energy.services';

const MarketplaceDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const user = useSelector((state) => state.auth?.user?._id);
  const [userStats, setUserStats] = useState({
    availableEnergy: 0, // kWh
    walletBalance: 0,
    activeOrders: 0,
    totalEarnings: 0
  });
  const [marketStats, setMarketStats] = useState({
    totalProduction: 0,
    averageProduction: 0,
    totalRecords: 0
  });
  const navigate = useNavigate();

  const quickActions = [
    { icon: <Sell />, label: 'Sell Energy', path: '/clients/sell' },
    { icon: <ShoppingCart />, label: 'Buy Energy', path: '/clients/buy' },
    { icon: <AccountBalanceWallet />, label: 'Wallet', path: '/clients/wallet' },
    { icon: <EnergySavingsLeaf />, label: 'Transaction', path: '/clients/transactions' }
  ];

  // Fetch energy data from API
  const fetchEnergyStats = async () => {
    if (!user) return;

    try {
      const response = await energyService.getClientEnergy(user, { limit: 30 });
      if (response.status === 'success') {
        const { client, statistics } = response.data;
        setUserStats((prev) => ({
          ...prev,
          availableEnergy: client.energyBalance || 0
        }));
        setMarketStats({
          totalProduction: statistics.totalProduction || 0,
          averageProduction: statistics.averageProduction || 0,
          totalRecords: statistics.totalRecords || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch client energy stats:', error);
    }
  };

useEffect(() => {
  fetchEnergyStats();
  
  const intervalId = setInterval(() => {
    fetchEnergyStats();
  }, 3 * 60 * 1000); 
  
  return () => clearInterval(intervalId);
}, [user]);

  // Hardcoded price per KWh (USD)
  const PRICE_PER_KWH = 4;
  const energyWorth = userStats.availableEnergy * PRICE_PER_KWH;
  const formattedWorth = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(energyWorth);

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Energy Marketplace
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Trade solar energy with your community
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EnergySavingsLeaf sx={{ mr: 1 }} />
                <Typography variant="h6">Available Energy</Typography>
              </Box>
              <Typography variant="h4">{userStats.availableEnergy.toFixed(2)} kWh</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceWallet sx={{ mr: 1 }} />
                <Typography variant="h6">Wallet Balance</Typography>
              </Box>
              <Typography variant="h4">{formattedWorth}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Active Orders</Typography>
              <Typography variant="h4">{userStats.activeOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Production (avg)</Typography>
              <Typography variant="h4">{marketStats.averageProduction.toFixed(2)} kWh</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Quick Actions</Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Button
                variant="outlined"
                fullWidth
                sx={{ py: 2, flexDirection: 'column', height: '100%' }}
                startIcon={action.icon}
                onClick={() => navigate(action.path)}
              >
                {action.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default MarketplaceDashboard;
