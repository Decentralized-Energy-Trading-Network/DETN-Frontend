import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';

const MarketplaceOverview = () => {
  const availableEnergy = [
    { seller: 'Alex Johnson', amount: '45.2 kWh', price: '$0.12/kWh', time: '2 min ago' },
    { seller: 'Sarah Miller', amount: '32.8 kWh', price: '$0.11/kWh', time: '5 min ago' },
    { seller: 'Mike Chen', amount: '28.5 kWh', price: '$0.13/kWh', time: '8 min ago' },
    { seller: 'Emma Davis', amount: '51.7 kWh', price: '$0.10/kWh', time: '12 min ago' }
  ];

  const recentTransactions = [
    { buyer: 'John Smith', seller: 'Lisa Brown', amount: '15.3 kWh', price: '$1.84', time: '10:30 AM' },
    { buyer: 'Community Pool', seller: 'Mike Chen', amount: '22.1 kWh', price: '$2.65', time: '10:15 AM' },
    { buyer: 'Sarah Miller', seller: 'Alex Johnson', amount: '18.7 kWh', price: '$2.24', time: '09:45 AM' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Energy Marketplace
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Buy and sell excess solar energy within your community
      </Typography>

      <Grid container spacing={3}>
        {/* Market Stats */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Current Price</Typography>
              <Typography variant="h4">$0.125</Typography>
              <Typography variant="body2" color="text.secondary">per kWh</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>24h Volume</Typography>
              <Typography variant="h4">342 kWh</Typography>
              <Typography variant="body2" color="text.secondary">traded</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Active Sellers</Typography>
              <Typography variant="h4">24</Typography>
              <Typography variant="body2" color="text.secondary">online</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Your Balance</Typography>
              <Typography variant="h4">152.8 kWh</Typography>
              <Typography variant="body2" color="text.secondary">available</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Available Energy Listings */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Available Energy</Typography>
                <Button variant="contained">Sell Energy</Button>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Seller</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableEnergy.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.seller}</TableCell>
                        <TableCell>{row.amount}</TableCell>
                        <TableCell>{row.price}</TableCell>
                        <TableCell>{row.time}</TableCell>
                        <TableCell>
                          <Button variant="outlined" size="small">Buy</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Quick Actions</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="contained" fullWidth>Sell Excess Energy</Button>
                <Button variant="outlined" fullWidth>Set Auto-Sell</Button>
                <Button variant="outlined" fullWidth>Buy Energy</Button>
                <Button variant="outlined" fullWidth>Price Alerts</Button>
              </Box>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
              {recentTransactions.map((transaction, index) => (
                <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="body2">
                    {transaction.buyer} ← {transaction.seller}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {transaction.amount} • {transaction.price} • {transaction.time}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MarketplaceOverview;