// Pages/Clients/ClientTransactions.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  useMediaQuery,
  Stack,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Grid,
  Button,
  Pagination
} from '@mui/material';
import { 
  Bolt, 
  TrendingUp, 
  TrendingDown,
  AttachMoney,
  ShowChart,
  Refresh
} from '@mui/icons-material';
import orderService from '../../services/order.Services';
import { useSelector } from 'react-redux';

const ClientTransactions = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const userId = useSelector((state) => state.auth?.user?._id);

  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const typeFilter = ['all', 'sold', 'bought'][tabValue];

  const fetchTransactions = async () => {
    if (!userId) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await orderService.transactionHistory(userId, {
        type: typeFilter,
        page: page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      setTransactions(response.data.data.transactions);
      setStatistics(response.data.data.statistics);
      setPagination(response.data.data.pagination);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [userId, tabValue, page]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1); // Reset to first page when changing tabs
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    return then.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'open':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Transaction History
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={fetchTransactions}
          variant="outlined"
          size={isMobile ? 'small' : 'medium'}
        >
          Refresh
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp sx={{ color: 'success.main', mr: 1, fontSize: 28 }} />
                  <Typography variant="body2" color="text.secondary">
                    Energy Sold
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  {statistics.totalEnergySold.toFixed(2)} kWh
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>
                  Revenue: ${statistics.totalRevenue.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingDown sx={{ color: 'error.main', mr: 1, fontSize: 28 }} />
                  <Typography variant="body2" color="text.secondary">
                    Energy Bought
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  {statistics.totalEnergyBought.toFixed(2)} kWh
                </Typography>
                <Typography variant="body2" color="error.main" sx={{ mt: 0.5 }}>
                  Spent: ${statistics.totalSpent.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ShowChart sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
                  <Typography variant="body2" color="text.secondary">
                    Total Transactions
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  {statistics.totalTransactions}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Sold: {statistics.totalSold} | Bought: {statistics.totalBought}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoney sx={{ color: 'warning.main', mr: 1, fontSize: 28 }} />
                  <Typography variant="body2" color="text.secondary">
                    Net Balance
                  </Typography>
                </Box>
                <Typography 
                  variant="h5" 
                  fontWeight="bold"
                  color={statistics.totalRevenue - statistics.totalSpent >= 0 ? 'success.main' : 'error.main'}
                >
                  ${(statistics.totalRevenue - statistics.totalSpent).toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {statistics.totalRevenue >= statistics.totalSpent ? 'Profit' : 'Loss'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All Transactions" />
          <Tab label="Sold" />
          <Tab label="Bought" />
        </Tabs>
      </Box>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No transactions found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {typeFilter === 'all' 
              ? 'You haven\'t made any transactions yet.' 
              : `You haven't ${typeFilter} any energy yet.`}
          </Typography>
        </Paper>
      ) : (
        <>
          <Stack spacing={2}>
            {transactions.map((transaction) => (
              <Paper 
                key={transaction.id} 
                sx={{ 
                  p: 2, 
                  transition: 'all 0.2s',
                  '&:hover': { 
                    transform: 'translateY(-2px)', 
                    boxShadow: 4 
                  } 
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: isMobile ? 'wrap' : 'nowrap',
                  gap: 2
                }}>
                  {/* Left Side - Transaction Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
                    {transaction.type === 'sold' ? 
                      <TrendingUp sx={{ color: 'success.main', mr: 2, fontSize: 36 }} /> : 
                      <TrendingDown sx={{ color: 'error.main', mr: 2, fontSize: 36 }} />
                    }
                    <Box sx={{ minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="h6" component="span">
                          {transaction.type === 'sold' ? 'Sold' : 'Bought'} {transaction.amount} kWh
                        </Typography>
                        <Chip 
                          label={transaction.status} 
                          size="small" 
                          color={getStatusColor(transaction.status)}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {getRelativeTime(transaction.date)} • ${transaction.pricePerUnit.toFixed(3)}/kWh
                      </Typography>
                      {transaction.counterParty && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {transaction.type === 'sold' ? '👤 Buyer: ' : '👤 Seller: '}
                          {transaction.counterParty.name}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  
                  {/* Right Side - Price Info */}
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography 
                      variant="h6" 
                      color={transaction.type === 'sold' ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {transaction.type === 'sold' ? '+' : '-'}${transaction.total.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {transaction.amount} kWh × ${transaction.pricePerUnit.toFixed(3)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={pagination.totalPages} 
                page={page} 
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? 'small' : 'medium'}
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ClientTransactions;