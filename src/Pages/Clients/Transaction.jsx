import React from 'react';
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
  Button
} from '@mui/material';

const TransactionHistory = () => {
  const transactions = [
    { id: 'TX001', date: '2024-01-15', type: 'Sale', amount: '25.3 kWh', price: '$0.125', total: '$3.16', status: 'Completed', counterparty: 'John Smith' },
    { id: 'TX002', date: '2024-01-15', type: 'Purchase', amount: '18.7 kWh', price: '$0.127', total: '$2.37', status: 'Completed', counterparty: 'Sarah Miller' },
    { id: 'TX003', date: '2024-01-14', type: 'Sale', amount: '32.1 kWh', price: '$0.123', total: '$3.95', status: 'Completed', counterparty: 'Community Pool' },
    { id: 'TX004', date: '2024-01-14', type: 'Sale', amount: '15.8 kWh', price: '$0.126', total: '$1.99', status: 'Completed', counterparty: 'Mike Chen' },
    { id: 'TX005', date: '2024-01-13', type: 'Purchase', amount: '28.4 kWh', price: '$0.124', total: '$3.52', status: 'Completed', counterparty: 'Emma Davis' }
  ];

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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Transaction History
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Complete history of your energy trading activities
      </Typography>

      <Card>
        <CardContent>
          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Button variant="outlined">All Transactions</Button>
            <Button variant="outlined">Sales Only</Button>
            <Button variant="outlined">Purchases Only</Button>
            <Button variant="outlined">Last 7 Days</Button>
            <Button variant="outlined">Last 30 Days</Button>
          </Box>

          {/* Transactions Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Counterparty</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {transaction.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.type} 
                        color={getTypeColor(transaction.type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{transaction.counterparty}</TableCell>
                    <TableCell>{transaction.amount}</TableCell>
                    <TableCell>{transaction.price}</TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">
                        {transaction.total}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.status} 
                        color={getStatusColor(transaction.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary */}
          <Box sx={{ mt: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>Summary</Typography>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Sales</Typography>
                <Typography variant="h6">73.2 kWh</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Purchases</Typography>
                <Typography variant="h6">47.1 kWh</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Net Energy</Typography>
                <Typography variant="h6" color="success.main">+26.1 kWh</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                <Typography variant="h6">$9.10</Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransactionHistory;