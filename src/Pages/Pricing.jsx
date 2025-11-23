import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';

const PriceManagement = () => {
  const [priceSettings, setPriceSettings] = useState({
    basePrice: 0.125,
    minPrice: 0.08,
    maxPrice: 0.20,
    autoAdjust: true,
    peakMultiplier: 1.5,
    offPeakMultiplier: 0.7
  });

  const priceHistory = [
    { date: '2024-01-15 10:00', price: '$0.125', change: '+2.4%', volume: '342 kWh' },
    { date: '2024-01-14 18:00', price: '$0.122', change: '-1.2%', volume: '298 kWh' },
    { date: '2024-01-14 10:00', price: '$0.124', change: '+1.6%', volume: '315 kWh' },
    { date: '2024-01-13 18:00', price: '$0.122', change: '-0.8%', volume: '287 kWh' },
    { date: '2024-01-13 10:00', price: '$0.123', change: '+0.8%', volume: '301 kWh' }
  ];

  const handlePriceChange = (field, value) => {
    setPriceSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Price Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configure and monitor energy pricing for the marketplace
      </Typography>

      <Grid container spacing={3}>
        {/* Current Price Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Price Settings
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Base Price per kWh</Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={priceSettings.basePrice}
                  onChange={(e) => handlePriceChange('basePrice', parseFloat(e.target.value))}
                  inputProps={{ step: 0.001, min: 0 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Price Range</Typography>
                <Slider
                  value={[priceSettings.minPrice, priceSettings.maxPrice]}
                  onChange={(_, newValue) => {
                    handlePriceChange('minPrice', newValue[0]);
                    handlePriceChange('maxPrice', newValue[1]);
                  }}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `$${value}`}
                  min={0.05}
                  max={0.30}
                  step={0.01}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Min: ${priceSettings.minPrice}</Typography>
                  <Typography variant="body2">Max: ${priceSettings.maxPrice}</Typography>
                </Box>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={priceSettings.autoAdjust}
                    onChange={(e) => handlePriceChange('autoAdjust', e.target.checked)}
                  />
                }
                label="Automatic Price Adjustment"
              />

              {priceSettings.autoAdjust && (
                <Box sx={{ mt: 2 }}>
                  <Typography gutterBottom>Peak Hours Multiplier</Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={priceSettings.peakMultiplier}
                    onChange={(e) => handlePriceChange('peakMultiplier', parseFloat(e.target.value))}
                    inputProps={{ step: 0.1, min: 1 }}
                  />
                  
                  <Typography gutterBottom sx={{ mt: 2 }}>Off-Peak Hours Multiplier</Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={priceSettings.offPeakMultiplier}
                    onChange={(e) => handlePriceChange('offPeakMultiplier', parseFloat(e.target.value))}
                    inputProps={{ step: 0.1, max: 1 }}
                  />
                </Box>
              )}

              <Button variant="contained" fullWidth sx={{ mt: 3 }}>
                Save Price Settings
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Price Statistics & Controls */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Market Statistics
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">Current Market Price</Typography>
                <Typography variant="h4">${priceSettings.basePrice}</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">24h Trading Volume</Typography>
                <Typography variant="h6">342 kWh</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">Active Buy Orders</Typography>
                <Typography variant="h6">18</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">Active Sell Orders</Typography>
                <Typography variant="h6">24</Typography>
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                Market is operating normally. No interventions needed.
              </Alert>
            </CardContent>
          </Card>

          {/* Manual Price Override */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Manual Price Override
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Use only in emergency situations
              </Typography>
              <TextField
                fullWidth
                label="Emergency Price"
                type="number"
                size="small"
                sx={{ mb: 2 }}
              />
              <Button variant="outlined" color="warning" fullWidth>
                Set Emergency Price
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Price History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Price History (Last 5 Updates)
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date & Time</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Change</TableCell>
                      <TableCell>Volume</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {priceHistory.map((record, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>
                          <Typography fontWeight="bold">
                            {record.price}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            color={record.change.startsWith('+') ? 'success.main' : 'error.main'}
                          >
                            {record.change}
                          </Typography>
                        </TableCell>
                        <TableCell>{record.volume}</TableCell>
                      </TableRow>
                    ))}
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

export default PriceManagement;