import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { Refresh, TrendingUp, TrendingDown } from '@mui/icons-material';
import energyService from '../services/energy.services';

const OrderBook = () => {
  const [buyOrders, setBuyOrders] = useState([]);
  const [sellOrders, setSellOrders] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [marketStats, setMarketStats] = useState({
    currentPrice: 0,
    priceChange: 0,
    totalVolume: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderBookData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all transactions
      const response = await energyService.getAllTransactions({
        limit: 50,
        status: 'completed'
      });

      if (response.status === 'success') {
        const transactions = response.data.transactions;
        
        // Process transactions for order book
        processOrderBookData(transactions);
        
        // Get recent trades (last 10 completed transactions)
        const recent = transactions.slice(0, 10);
        setRecentTrades(recent);
        
        // Calculate market statistics
        calculateMarketStats(transactions);
      }
    } catch (err) {
      console.error('Error fetching order book data:', err);
      setError('Failed to load order book data');
    } finally {
      setLoading(false);
    }
  };

  const processOrderBookData = (transactions) => {
    // Group transactions by type (buy/sell) and price level
    const buyOrdersMap = new Map();
    const sellOrdersMap = new Map();

    transactions.forEach(transaction => {
      const price = transaction.price || 0;
      const amount = transaction.amount || 0;
      const total = price * amount;

      // Determine if it's a buy or sell order based on your business logic
      // For now, let's assume transactions with "Community Battery" as seller are buy orders
      const isBuyOrder = transaction.to === 'Community Battery' || 
                        transaction.to.includes('Battery') ||
                        transaction.buyerType === 'house';

      const orderMap = isBuyOrder ? buyOrdersMap : sellOrdersMap;

      if (orderMap.has(price)) {
        const existing = orderMap.get(price);
        orderMap.set(price, {
          price,
          amount: existing.amount + amount,
          total: existing.total + total
        });
      } else {
        orderMap.set(price, {
          price,
          amount,
          total
        });
      }
    });

    // Convert maps to arrays and sort
    const buyOrdersArray = Array.from(buyOrdersMap.values())
      .sort((a, b) => b.price - a.price) // Highest buy price first
      .slice(0, 10); // Top 10 buy orders

    const sellOrdersArray = Array.from(sellOrdersMap.values())
      .sort((a, b) => a.price - b.price) // Lowest sell price first
      .slice(0, 10); // Top 10 sell orders

    setBuyOrders(buyOrdersArray);
    setSellOrders(sellOrdersArray);
  };

  const calculateMarketStats = (transactions) => {
    if (transactions.length === 0) return;

    // Calculate current price (average of last 5 transactions)
    const recentPrices = transactions.slice(0, 5).map(t => t.price || 0);
    const currentPrice = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;

    // Calculate price change (compared to previous 5 transactions)
    const previousPrices = transactions.slice(5, 10).map(t => t.price || 0);
    const previousAvg = previousPrices.length > 0 
      ? previousPrices.reduce((sum, price) => sum + price, 0) / previousPrices.length
      : currentPrice;

    const priceChange = previousAvg > 0 ? ((currentPrice - previousAvg) / previousAvg) * 100 : 0;

    // Calculate total volume
    const totalVolume = transactions.reduce((sum, transaction) => 
      sum + (transaction.amount || 0), 0
    );

    setMarketStats({
      currentPrice,
      priceChange,
      totalVolume
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 3
    }).format(amount);
  };

  const formatEnergy = (amount) => {
    return `${parseFloat(amount).toFixed(1)} kWh`;
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    
    return date.toLocaleTimeString();
  };

  useEffect(() => {
    fetchOrderBookData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchOrderBookData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && buyOrders.length === 0) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Order Book
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time buy and sell orders in the energy marketplace
          </Typography>
        </Box>
        <Button 
          startIcon={<Refresh />} 
          onClick={fetchOrderBookData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Current Market Price */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Current Market Price
              </Typography>
              <Typography variant="h3" sx={{ color: marketStats.priceChange >= 0 ? '#4caf50' : '#f44336' }}>
                {formatCurrency(marketStats.currentPrice)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                {marketStats.priceChange >= 0 ? (
                  <TrendingUp color="success" />
                ) : (
                  <TrendingDown color="error" />
                )}
                <Typography 
                  variant="body2" 
                  color={marketStats.priceChange >= 0 ? 'success.main' : 'error.main'}
                >
                  {marketStats.priceChange >= 0 ? '+' : ''}{marketStats.priceChange.toFixed(2)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • 24h Volume: {formatEnergy(marketStats.totalVolume)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Buy Orders */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="success.main">
                  Buy Orders
                </Typography>
                <Chip 
                  label={`${buyOrders.length} orders`} 
                  size="small" 
                  color="success" 
                  variant="outlined" 
                />
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Price</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {buyOrders.length > 0 ? (
                      buyOrders.map((order, index) => (
                        <TableRow key={index} hover>
                          <TableCell style={{ color: '#4caf50', fontWeight: 'bold' }}>
                            {formatCurrency(order.price)}
                          </TableCell>
                          <TableCell>{formatEnergy(order.amount)}</TableCell>
                          <TableCell>{formatCurrency(order.total)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">
                            No buy orders available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Sell Orders */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="error.main">
                  Sell Orders
                </Typography>
                <Chip 
                  label={`${sellOrders.length} orders`} 
                  size="small" 
                  color="error" 
                  variant="outlined" 
                />
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Price</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sellOrders.length > 0 ? (
                      sellOrders.map((order, index) => (
                        <TableRow key={index} hover>
                          <TableCell style={{ color: '#f44336', fontWeight: 'bold' }}>
                            {formatCurrency(order.price)}
                          </TableCell>
                          <TableCell>{formatEnergy(order.amount)}</TableCell>
                          <TableCell>{formatCurrency(order.total)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">
                            No sell orders available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Trades */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Trades
                </Typography>
                <Chip 
                  label={`${recentTrades.length} trades`} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>From</TableCell>
                      <TableCell>To</TableCell>
                      <TableCell>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentTrades.length > 0 ? (
                      recentTrades.map((trade, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            {getTimeAgo(trade.completedAt || trade.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: trade.price >= marketStats.currentPrice ? '#4caf50' : '#f44336',
                                fontWeight: 'bold'
                              }}
                            >
                              {formatCurrency(trade.price)}
                            </Typography>
                          </TableCell>
                          <TableCell>{formatEnergy(trade.amount)}</TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                              {trade.from}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                              {trade.to}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {formatCurrency((trade.price || 0) * (trade.amount || 0))}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">
                            No recent trades available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderBook;