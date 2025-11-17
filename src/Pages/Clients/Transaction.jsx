import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Grid
} from '@mui/material';
import { Download, Refresh } from '@mui/icons-material';
import energyService from '../../services/energy.services';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    timeframe: 'all',
    status: 'completed'
  });
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalPurchases: 0,
    netEnergy: 0,
    totalRevenue: 0,
    transactionCount: 0
  });

  const fetchTransactionHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all transactions
      const response = await energyService.getAllTransactions({
        limit: 100,
        status: 'completed'
      });

      if (response.status === 'success') {
        const allTransactions = response.data.transactions;
        setTransactions(allTransactions);
        applyFilters(allTransactions, filters);
        calculateSummary(allTransactions);
      }
    } catch (err) {
      console.error('Error fetching transaction history:', err);
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (txs, filterSettings) => {
    let filtered = txs;

    // Filter by type
    if (filterSettings.type !== 'all') {
      filtered = filtered.filter(tx => {
        if (filterSettings.type === 'sale') {
          return tx.from === getUserName() || tx.sellerType === 'user';
        } else if (filterSettings.type === 'purchase') {
          return tx.to === getUserName() || tx.buyerType === 'user';
        }
        return true;
      });
    }

    // Filter by timeframe
    if (filterSettings.timeframe !== 'all') {
      const now = new Date();
      let startDate;

      switch (filterSettings.timeframe) {
        case '7days':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case '30days':
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case '90days':
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter(tx => 
          new Date(tx.completedAt || tx.createdAt) >= startDate
        );
      }
    }

    setFilteredTransactions(filtered);
  };

  const calculateSummary = (txs) => {
    const currentUser = getUserName();
    
    const sales = txs.filter(tx => 
      tx.from === currentUser || tx.sellerType === 'user'
    );
    const purchases = txs.filter(tx => 
      tx.to === currentUser || tx.buyerType === 'user'
    );

    const totalSales = sales.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const totalPurchases = purchases.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const totalRevenue = sales.reduce((sum, tx) => 
      sum + ((tx.price || 0) * (tx.amount || 0)), 0
    );

    setSummary({
      totalSales,
      totalPurchases,
      netEnergy: totalSales - totalPurchases,
      totalRevenue,
      transactionCount: txs.length
    });
  };

  const getUserName = () => {
    // Get current user's name from localStorage or context
    const clientData = localStorage.getItem('client');
    if (clientData) {
      const client = JSON.parse(clientData);
      return `${client.firstName} ${client.lastName}`.trim() || 'You';
    }
    return 'You';
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    applyFilters(transactions, newFilters);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Counterparty', 'Amount (kWh)', 'Price ($/kWh)', 'Total ($)', 'Status'];
    const csvData = filteredTransactions.map(tx => [
      tx.id,
      new Date(tx.completedAt || tx.createdAt).toLocaleDateString(),
      getTransactionType(tx),
      getCounterparty(tx),
      tx.amount?.toFixed(1) || '0',
      tx.price?.toFixed(3) || '0',
      ((tx.price || 0) * (tx.amount || 0)).toFixed(2),
      'Completed'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `energy-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getTransactionType = (transaction) => {
    const currentUser = getUserName();
    return (transaction.from === currentUser || transaction.sellerType === 'user') ? 'Sale' : 'Purchase';
  };

  const getCounterparty = (transaction) => {
    const currentUser = getUserName();
    if (transaction.from === currentUser || transaction.sellerType === 'user') {
      return transaction.to || transaction.buyer || 'Community';
    } else {
      return transaction.from || transaction.seller || 'Community';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Pending': return 'warning';
      case 'Failed': return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    return type === 'Sale' ? 'success' : 'primary';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatEnergy = (amount) => {
    return `${parseFloat(amount).toFixed(1)} kWh`;
  };

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  if (loading && transactions.length === 0) {
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
            Transaction History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete history of your energy trading activities
          </Typography>
        </Box>
        <Button 
          startIcon={<Refresh />} 
          onClick={fetchTransactionHistory}
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

      <Card>
        <CardContent>
          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="sale">Sales Only</MenuItem>
                <MenuItem value="purchase">Purchases Only</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={filters.timeframe}
                label="Timeframe"
                onChange={(e) => handleFilterChange('timeframe', e.target.value)}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="7days">Last 7 Days</MenuItem>
                <MenuItem value="30days">Last 30 Days</MenuItem>
                <MenuItem value="90days">Last 90 Days</MenuItem>
              </Select>
            </FormControl>

            <Button 
              variant="outlined" 
              startIcon={<Download />}
              onClick={exportToCSV}
              disabled={filteredTransactions.length === 0}
            >
              Export CSV
            </Button>
          </Box>

          {/* Transactions Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Counterparty</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction, index) => {
                    const type = getTransactionType(transaction);
                    const counterparty = getCounterparty(transaction);
                    const totalValue = (transaction.price || 0) * (transaction.amount || 0);

                    return (
                      <TableRow key={transaction.id || index} hover>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {transaction.id || `TX${String(index + 1).padStart(3, '0')}`}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.completedAt || transaction.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={type} 
                            color={getTypeColor(type)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{counterparty}</TableCell>
                        <TableCell>{formatEnergy(transaction.amount)}</TableCell>
                        <TableCell>
                          {transaction.price ? formatCurrency(transaction.price) + '/kWh' : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="bold">
                            {formatCurrency(totalValue)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label="Completed" 
                            color={getStatusColor('Completed')}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No transactions found matching your filters
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary */}
          <Box sx={{ mt: 3, p: 3, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>Transaction Summary</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Sales</Typography>
                  <Typography variant="h6">{formatEnergy(summary.totalSales)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Purchases</Typography>
                  <Typography variant="h6">{formatEnergy(summary.totalPurchases)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Net Energy</Typography>
                  <Typography 
                    variant="h6" 
                    color={summary.netEnergy >= 0 ? 'success.main' : 'error.main'}
                  >
                    {summary.netEnergy >= 0 ? '+' : ''}{formatEnergy(summary.netEnergy)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                  <Typography variant="h6">{formatCurrency(summary.totalRevenue)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredTransactions.length} of {transactions.length} total transactions
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransactionHistory;