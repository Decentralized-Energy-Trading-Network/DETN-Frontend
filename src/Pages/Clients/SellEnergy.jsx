// Pages/Clients/SellEnergy.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'; // Add useDispatch
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Slider,
  Grid,
  Paper,
  Alert,
  useTheme,
  useMediaQuery,
  Stack,
  Divider
} from '@mui/material';
import { AttachMoney, EnergySavingsLeaf } from '@mui/icons-material';
import orderService from '../../services/order.Services';
import { showToast } from '../../utils/toast';
import { updateEnergyBalance } from '../../store/auth'; // Import the action

const SellEnergy = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const userId = useSelector((state) => state.auth?.user?._id);
  const energyBalance = useSelector((state) => state.auth?.user?.energyBalance || 0);
  const dispatch = useDispatch(); // Initialize dispatch

  const [formData, setFormData] = useState({
    energyAmount: 0,
    pricePerKwh: 0.12,
    totalPrice: 0
  });
  const [loading, setLoading] = useState(false);

  const handleEnergyChange = (event, newValue) => {
    const total = newValue * formData.pricePerKwh;
    setFormData({
      ...formData,
      energyAmount: newValue,
      totalPrice: total
    });
  };

  const handlePriceChange = (event) => {
    const price = parseFloat(event.target.value) || 0;
    const total = formData.energyAmount * price;
    setFormData({
      ...formData,
      pricePerKwh: price,
      totalPrice: total
    });
  };

  const handleSubmit = async () => {
    if (!userId) {
      showToast.error('Please sign in to list energy');
      return;
    }

    if (!formData.energyAmount || formData.energyAmount <= 0) {
      showToast.error('Enter a valid energy amount');
      return;
    }

    if (formData.energyAmount > energyBalance) {
      showToast.error('Insufficient energy balance');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        clientId: userId,
        energyAmount: Number(formData.energyAmount),
        pricePerUnit: Number(formData.pricePerKwh)
      };
      await orderService.createOrder(payload);
      
      // Calculate new energy balance
      const newEnergyBalance = energyBalance - formData.energyAmount;
      
      // Update Redux state
      dispatch(updateEnergyBalance(newEnergyBalance));
      
      showToast.success('Sell order created successfully');
      
      // Reset form
      setFormData({
        energyAmount: 0,
        pricePerKwh: formData.pricePerKwh,
        totalPrice: 0
      });
    } catch (err) {
      console.error('Create order error', err);
      showToast.error(err?.message || 'Failed to create sell order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Sell Your Energy
      </Typography>

      <Grid container spacing={3}>
        {/* Sell Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Create Sell Order
              </Typography>
              
              {/* Energy Balance Display */}
              <Alert severity="info" sx={{ mb: 2 }}>
                Available Energy Balance: <strong>{energyBalance} kWh</strong>
              </Alert>
              
              <Stack spacing={3}>
                {/* Energy Amount Slider */}
                <Box>
                  <Typography gutterBottom>
                    Energy Amount: {formData.energyAmount} kWh
                  </Typography>
                  <Slider
                    value={formData.energyAmount}
                    onChange={handleEnergyChange}
                    min={0.1}
                    max={energyBalance}
                    step={0.1}
                    valueLabelDisplay="auto"
                    sx={{ mb: 2 }}
                  />
                </Box>

                {/* Price Input */}
                <TextField
                  fullWidth
                  label="Price per kWh ($)"
                  type="number"
                  value={formData.pricePerKwh}
                  onChange={handlePriceChange}
                  InputProps={{
                    startAdornment: <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />

                {/* Total Price Display */}
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total Value:</Typography>
                    <Typography variant="h6" color="primary">
                      ${formData.totalPrice.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      New Balance:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(energyBalance - formData.energyAmount).toFixed(1)} kWh
                    </Typography>
                  </Box>
                </Paper>

                {/* Submit Button */}
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleSubmit}
                  disabled={loading || formData.energyAmount === 0}
                  sx={{ py: 1.5 }}
                >
                  {loading ? 'Listing...' : 'List Energy for Sale'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Market Info */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Market Tips
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Current average sell price: $0.12/kWh
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Faster sales at or below market average
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Transactions are secured on blockchain
                </Typography>
              </CardContent>
            </Card>

            <Alert severity="info">
              Your energy will be listed in the marketplace for other users to purchase.
            </Alert>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SellEnergy;