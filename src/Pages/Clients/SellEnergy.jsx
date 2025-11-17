// Pages/Clients/SellEnergy.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { AttachMoney, EnergySavingsLeaf, BatteryChargingFull, Storefront } from '@mui/icons-material';
import orderService from '../../services/order.Services';
import { showToast } from '../../utils/toast';
import { updateEnergyBalance } from '../../store/auth';
import communityBatteryService from '../../services/communityBatteryService';

const SellEnergy = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const userId = useSelector((state) => state.auth?.user?._id);
  const energyBalance = useSelector((state) => state.auth?.user?.energyBalance || 0);
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState(0);
  const [marketPrice, setMarketPrice] = useState(0.12);
  const [loading, setLoading] = useState(false);

  // Marketplace selling state
  const [marketplaceForm, setMarketplaceForm] = useState({
    energyAmount: 0,
    pricePerKwh: 0.12,
    totalPrice: 0
  });

  // Community battery selling state
  const [batteryForm, setBatteryForm] = useState({
    energyAmount: 0,
    totalEarnings: 0
  });

  const [batteryStats, setBatteryStats] = useState({
    energyPricePerKwh: 0.12,
    totalStoredKwh: 0,
    capacity: 1000
  });

  const fetchMarketPrice = async () => {
    try {
      const response = await communityBatteryService.getBatteryStats();
      const batteryData = response?.data?.battery;
      const currentPrice = batteryData?.energyPricePerKwh || 0.12;
      
      setMarketPrice(currentPrice);
      setBatteryStats({
        energyPricePerKwh: currentPrice,
        totalStoredKwh: batteryData?.totalStoredKwh || 0,
        capacity: batteryData?.capacity || 1000
      });

      // Update forms with current market price
      setMarketplaceForm(prev => ({
        ...prev,
        pricePerKwh: currentPrice,
        totalPrice: prev.energyAmount * currentPrice
      }));

      setBatteryForm(prev => ({
        ...prev,
        totalEarnings: prev.energyAmount * currentPrice
      }));

    } catch (err) {
      console.error('Fetch price error', err);
    }
  };

  useEffect(() => {
    fetchMarketPrice();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Marketplace Tab Handlers
  const handleMarketplaceEnergyChange = (event, newValue) => {
    const total = newValue * marketplaceForm.pricePerKwh;
    setMarketplaceForm({
      ...marketplaceForm,
      energyAmount: newValue,
      totalPrice: total
    });
  };

  const handleMarketplacePriceChange = (event) => {
    const price = parseFloat(event.target.value) || 0;
    const total = marketplaceForm.energyAmount * price;
    setMarketplaceForm({
      ...marketplaceForm,
      pricePerKwh: price,
      totalPrice: total
    });
  };

  const handleMarketplaceSubmit = async () => {
    if (!userId) {
      showToast.error('Please sign in to list energy');
      return;
    }

    if (!marketplaceForm.energyAmount || marketplaceForm.energyAmount <= 0) {
      showToast.error('Enter a valid energy amount');
      return;
    }

    if (marketplaceForm.energyAmount > energyBalance) {
      showToast.error('Insufficient energy balance');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        clientId: userId,
        energyAmount: Number(marketplaceForm.energyAmount),
        pricePerUnit: Number(marketplaceForm.pricePerKwh)
      };
      await orderService.createOrder(payload);
      
      // Calculate new energy balance
      const newEnergyBalance = energyBalance - marketplaceForm.energyAmount;
      
      // Update Redux state
      dispatch(updateEnergyBalance(newEnergyBalance));
      
      showToast.success('Sell order created successfully in marketplace!');
      
      // Reset form
      setMarketplaceForm({
        energyAmount: 0,
        pricePerKwh: marketPrice,
        totalPrice: 0
      });
    } catch (err) {
      console.error('Create order error', err);
      showToast.error(err?.message || 'Failed to create sell order');
    } finally {
      setLoading(false);
    }
  };

  // Community Battery Tab Handlers
  const handleBatteryEnergyChange = (event, newValue) => {
    const totalEarnings = newValue * marketPrice;
    setBatteryForm({
      energyAmount: newValue,
      totalEarnings: totalEarnings
    });
  };

  const handleSellToBattery = async () => {
    if (!userId) {
      showToast.error('Please sign in to sell energy');
      return;
    }

    if (!batteryForm.energyAmount || batteryForm.energyAmount <= 0) {
      showToast.error('Enter a valid energy amount');
      return;
    }

    if (batteryForm.energyAmount > energyBalance) {
      showToast.error('Insufficient energy balance');
      return;
    }

    setLoading(true);
    try {
      // Use the depositEnergy API to sell to community battery
      const response = await communityBatteryService.depositEnergy(batteryForm.energyAmount);
      
      // Calculate new energy balance
      const newEnergyBalance = energyBalance - batteryForm.energyAmount;
      
      // Update Redux state
      dispatch(updateEnergyBalance(newEnergyBalance));
      
      showToast.success(`Successfully sold ${batteryForm.energyAmount} kWh to community battery for $${batteryForm.totalEarnings.toFixed(2)}!`);
      
      // Refresh battery stats
      await fetchMarketPrice();
      
      // Reset form
      setBatteryForm({
        energyAmount: 0,
        totalEarnings: 0
      });
    } catch (err) {
      console.error('Sell to battery error', err);
      showToast.error(err?.message || 'Failed to sell energy to battery');
    } finally {
      setLoading(false);
    }
  };

  const batteryUtilization = (batteryStats.totalStoredKwh / batteryStats.capacity) * 100;

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
        Sell Your Energy
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab icon={<Storefront />} label="Sell in Marketplace" />
        <Tab icon={<BatteryChargingFull />} label="Sell to Community Battery" />
      </Tabs>

      {/* Current Balance Display */}
      <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Your Current Energy Balance:
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {energyBalance.toFixed(1)} kWh
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {activeTab === 0 ? (
        /* Marketplace Selling Tab */
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sell in Energy Marketplace
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  List your energy for other users to purchase. You set the price!
                </Alert>
                
                <Stack spacing={3}>
                  {/* Energy Amount Slider */}
                  <Box>
                    <Typography gutterBottom>
                      Energy Amount: {marketplaceForm.energyAmount} kWh
                    </Typography>
                    <Slider
                      value={marketplaceForm.energyAmount}
                      onChange={handleMarketplaceEnergyChange}
                      min={0.1}
                      max={energyBalance}
                      step={0.1}
                      valueLabelDisplay="auto"
                      sx={{ mb: 2 }}
                    />
                  </Box>

                  {/* Price Input - User sets their own price */}
                  <TextField
                    fullWidth
                    label="Your Price per kWh ($)"
                    type="number"
                    value={marketplaceForm.pricePerKwh}
                    onChange={handleMarketplacePriceChange}
                    InputProps={{
                      startAdornment: <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    helperText={`Market price: $${marketPrice.toFixed(2)}/kWh`}
                  />

                  {/* Total Price Display */}
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6">Potential Earnings:</Typography>
                      <Typography variant="h6" color="primary">
                        ${marketplaceForm.totalPrice.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        New Balance:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(energyBalance - marketplaceForm.energyAmount).toFixed(1)} kWh
                      </Typography>
                    </Box>
                  </Paper>

                  {/* Submit Button */}
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleMarketplaceSubmit}
                    disabled={loading || marketplaceForm.energyAmount === 0}
                    sx={{ py: 1.5 }}
                    startIcon={<Storefront />}
                  >
                    {loading ? 'Listing...' : 'List in Marketplace'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Marketplace Info Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Marketplace Tips
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Current market price: ${marketPrice.toFixed(2)}/kWh
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Price competitively for faster sales
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Buyers can purchase from individual sellers
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • You receive payment when energy is purchased
                  </Typography>
                </CardContent>
              </Card>

              <Alert severity="warning">
                Your energy will remain listed until purchased or you cancel the listing.
              </Alert>
            </Stack>
          </Grid>
        </Grid>
      ) : (
        /* Community Battery Selling Tab */
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sell to Community Battery
                </Typography>
                
                {/* Battery Status */}
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>
                      Battery Level: <strong>{batteryStats.totalStoredKwh.toFixed(1)} kWh space</strong>
                    </Typography>
                    <Typography>
                       Buy Price: <strong>${marketPrice.toFixed(2)}/kWh</strong>
                    </Typography>
                  </Box>
                </Alert>
                
                <Stack spacing={3}>
                  {/* Energy Amount Slider */}
                  <Box>
                    <Typography gutterBottom>
                      Energy Amount: {batteryForm.energyAmount} kWh
                    </Typography>
                    <Slider
                      value={batteryForm.energyAmount}
                      onChange={handleBatteryEnergyChange}
                      min={0.1}
                      max={energyBalance}
                      step={0.1}
                      valueLabelDisplay="auto"
                      sx={{ mb: 2 }}
                    />
                  </Box>

                  {/* Fixed Price Display */}
                  <TextField
                    fullWidth
                    label="Battery Buy Price per kWh ($)"
                    type="number"
                    value={marketPrice}
                    disabled
                    InputProps={{
                      startAdornment: <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    helperText="Fixed price offered by community battery"
                  />

                  {/* Total Earnings Display */}
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6">Total Earnings:</Typography>
                      <Typography variant="h6" color="primary">
                        ${batteryForm.totalEarnings.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        New Balance:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(energyBalance - batteryForm.energyAmount).toFixed(1)} kWh
                      </Typography>
                    </Box>
                  </Paper>

                  {/* Sell Button */}
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleSellToBattery}
                    disabled={loading || batteryForm.energyAmount === 0}
                    sx={{ py: 1.5 }}
                    startIcon={<BatteryChargingFull />}
                    color="secondary"
                  >
                    {loading ? 'Selling...' : `Sell to Battery for $${batteryForm.totalEarnings.toFixed(2)}`}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Battery Info Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Battery Information
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Capacity:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {batteryStats.capacity} kWh
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Current Storage:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {batteryStats.totalStoredKwh.toFixed(1)} kWh
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Utilization:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {batteryUtilization.toFixed(1)}%
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Buy Price:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ${marketPrice.toFixed(2)}/kWh
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Alert severity="success">
                Selling to the community battery provides instant payment and helps support the local energy grid.
              </Alert>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Benefits
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Instant payment at market rate
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • No waiting for buyers
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Support community energy storage
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Reliable and guaranteed sale
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default SellEnergy;