import React from 'react';
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
  Paper
} from '@mui/material';

const OrderBook = () => {
  const buyOrders = [
    { price: '$0.126', amount: '25.3 kWh', total: '$3.19' },
    { price: '$0.125', amount: '18.7 kWh', total: '$2.34' },
    { price: '$0.124', amount: '32.1 kWh', total: '$3.98' },
    { price: '$0.123', amount: '15.8 kWh', total: '$1.94' },
    { price: '$0.122', amount: '28.4 kWh', total: '$3.46' }
  ];

  const sellOrders = [
    { price: '$0.127', amount: '22.5 kWh', total: '$2.86' },
    { price: '$0.128', amount: '19.3 kWh', total: '$2.47' },
    { price: '$0.129', amount: '31.7 kWh', total: '$4.09' },
    { price: '$0.130', amount: '14.2 kWh', total: '$1.85' },
    { price: '$0.131', amount: '26.8 kWh', total: '$3.51' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Order Book
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Real-time buy and sell orders in the energy marketplace
      </Typography>

      <Grid container spacing={3}>
        {/* Current Market Price */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Current Market Price
              </Typography>
              <Typography variant="h3">
                $0.125
              </Typography>
              <Typography variant="body2" color="text.secondary">
                24h Change: +2.4%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Buy Orders */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="success.main">
                Buy Orders
              </Typography>
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
                    {buyOrders.map((order, index) => (
                      <TableRow key={index} hover>
                        <TableCell style={{ color: '#4caf50' }}>{order.price}</TableCell>
                        <TableCell>{order.amount}</TableCell>
                        <TableCell>{order.total}</TableCell>
                      </TableRow>
                    ))}
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
              <Typography variant="h6" gutterBottom color="error.main">
                Sell Orders
              </Typography>
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
                    {sellOrders.map((order, index) => (
                      <TableRow key={index} hover>
                        <TableCell style={{ color: '#f44336' }}>{order.price}</TableCell>
                        <TableCell>{order.amount}</TableCell>
                        <TableCell>{order.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Order History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Trades
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Buyer</TableCell>
                      <TableCell>Seller</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>10:30:15</TableCell>
                      <TableCell>$0.125</TableCell>
                      <TableCell>15.3 kWh</TableCell>
                      <TableCell>John Smith</TableCell>
                      <TableCell>Lisa Brown</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>10:28:42</TableCell>
                      <TableCell>$0.126</TableCell>
                      <TableCell>8.7 kWh</TableCell>
                      <TableCell>Community</TableCell>
                      <TableCell>Mike Chen</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>10:25:19</TableCell>
                      <TableCell>$0.124</TableCell>
                      <TableCell>22.1 kWh</TableCell>
                      <TableCell>Sarah Miller</TableCell>
                      <TableCell>Alex Johnson</TableCell>
                    </TableRow>
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