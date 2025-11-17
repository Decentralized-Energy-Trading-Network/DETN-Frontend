// Pages/Clients/BuyEnergy.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Paper,
  useTheme,
  useMediaQuery,
  Stack,
  Chip,
  Divider,
  Tabs,
  Tab,
  Alert,
  Slider
} from '@mui/material';
import {
  Search,
  FilterList,
  Bolt,
  Person,
  BatteryChargingFull,
  ShoppingCart
} from '@mui/icons-material';
import orderService from '../../services/order.Services';
import { showToast } from '../../utils/toast';
import { updateEnergyBalance } from '../../store/auth';
import communityBatteryService from '../../services/communityBatteryService';
import energyService from '../../services/energy.services';

const BuyEnergy = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchTerm, setSearchTerm] = useState('');
  const [energyListings, setEnergyListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const userId = useSelector((state) => state.auth?.user?._id);
  const currentEnergyBalance = useSelector((state) => state.auth?.user?.energyBalance || 0);
  const dispatch = useDispatch();

  // Battery purchase state
  const [batteryStats, setBatteryStats] = useState({
    energyPricePerKwh: 0.12,
    totalStoredKwh: 0,
    capacity: 1000
  });
  const [purchaseData, setPurchaseData] = useState({
    purchaseAmount: 1,
    totalCost: 0
  });

  const fetchOpenOrders = async () => {
    try {
      setLoading(true);
      const resp = await orderService.getOpenOrders();
      const list = resp?.data ?? resp;
      setEnergyListings(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch open orders', err);
      showToast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatteryStats = async () => {
    try {
      const response = await communityBatteryService.getBatteryStats();
      const batteryData = response?.data?.battery;
      
      if (batteryData) {
        setBatteryStats({
          energyPricePerKwh: batteryData.energyPricePerKwh || 0.12,
          totalStoredKwh: batteryData.totalStoredKwh || 0,
          capacity: 1000
        });

        // Update purchase cost
        setPurchaseData(prev => ({
          ...prev,
          totalCost: prev.purchaseAmount * (batteryData.energyPricePerKwh || 0.12)
        }));
      }
    } catch (err) {
      console.error('Fetch battery stats error', err);
    }
  };

  useEffect(() => {
    fetchOpenOrders();
    fetchBatteryStats();
    
    const id = setInterval(() => {
      fetchOpenOrders();
      fetchBatteryStats();
    }, 300000); // 5 minutes
    
    return () => clearInterval(id);
  }, []);

  

  const handlePurchaseFromSeller = async (listing) => {
    if (!userId) {
      showToast.error('Please sign in to purchase');
      return;
    }
    
    try {
      const orderId = listing._id ?? listing.id;
      const purchasedAmount = listing.energyAmount ?? listing.amount ?? 0;
      
      await orderService.buyOrder(orderId, { clientId: userId });
      
      // Calculate new energy balance
      const newEnergyBalance = currentEnergyBalance + purchasedAmount;
      
      // Update Redux state
      dispatch(updateEnergyBalance(newEnergyBalance));
      
      showToast.success(`Purchase successful! Added ${purchasedAmount} kWh to your balance`);
      fetchOpenOrders(); // Refresh listings
    } catch (err) {
      console.error('Purchase error', err);
      showToast.error(err?.message || 'Purchase failed');
    }
  };

  const handlePurchaseFromBattery = async () => {
    if (!userId) {
      showToast.error('Please sign in to purchase');
      return;
    }

    if (!purchaseData.purchaseAmount || purchaseData.purchaseAmount <= 0) {
      showToast.error('Enter a valid energy amount to purchase');
      return;
    }

    if (purchaseData.purchaseAmount > batteryStats.totalStoredKwh) {
      showToast.error('Insufficient energy available in community battery');
      return;
    }

    setLoading(true);
    try {
      // Call API to purchase from community battery
      const response = await communityBatteryService.purchaseFromBattery({
        clientId: userId,
        energyAmount: Number(purchaseData.purchaseAmount),
        pricePerKwh: batteryStats.energyPricePerKwh,
        totalCost: purchaseData.totalCost
      });

      if (response.status === 'success') {
        // Calculate new energy balance
        const newEnergyBalance = currentEnergyBalance + purchaseData.purchaseAmount;
        
        // Update Redux state
        dispatch(updateEnergyBalance(newEnergyBalance));
        
        showToast.success(`Purchased ${purchaseData.purchaseAmount} kWh from community battery!`);
        
        // Refresh data
        await fetchBatteryStats();
        
        // Reset purchase amount
        setPurchaseData({
          purchaseAmount: 1,
          totalCost: 1 * batteryStats.energyPricePerKwh
        });
      }
    } catch (err) {
      console.error('Purchase from battery error', err);
      showToast.error(err?.message || 'Failed to purchase energy from battery');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseAmountChange = (event, newValue) => {
    const totalCost = newValue * batteryStats.energyPricePerKwh;
    setPurchaseData({
      purchaseAmount: newValue,
      totalCost: totalCost
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Fixed seller label function
  const renderSellerLabel = (listing) => {
    if (listing.seller && typeof listing.seller === 'object') {
      const firstName = listing.seller.firstName || '';
      const lastName = listing.seller.lastName || '';
      const name = `${firstName} ${lastName}`.trim();
      
      if (name) return name;
      if (listing.seller.walletAddress) {
        return `Seller ${listing.seller.walletAddress.slice(-6)}`;
      }
    }
    
    if (typeof listing.seller === 'string') return listing.seller;
    if (listing.client) return `Seller ${String(listing.client).slice(-6)}`;
    
    return 'Seller';
  };

  // Helper function to get seller location if available
  const getSellerLocation = (listing) => {
    if (listing.location) return listing.location;
    if (listing.seller && listing.seller.location) return listing.seller.location;
    return null;
  };

  const batteryUtilization = (batteryStats.totalStoredKwh / batteryStats.capacity) * 100;

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
        Buy Energy
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab icon={<Person />} label="From Sellers" />
        <Tab icon={<BatteryChargingFull />} label="From Community Battery" />
      </Tabs>

      {/* Current Balance Display */}
      <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Your Current Energy Balance:
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {currentEnergyBalance.toFixed(1)} kWh
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {activeTab === 0 ? (
        /* From Sellers Tab */
        <>
          {/* Search and Filter */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={8} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search sellers or locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={6}>
                  <Box sx={{ display: 'flex', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
                    <Button startIcon={<FilterList />} variant="outlined">
                      Filters
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Energy Listings */}
          <Grid container spacing={2}>
            {loading ? (
              <Grid item xs={12}><Typography sx={{ p: 2 }}>Loading listings...</Typography></Grid>
            ) : energyListings.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">
                  No energy listings available from sellers. Try purchasing from the community battery instead.
                </Alert>
              </Grid>
            ) : (
              energyListings
                .filter((listing) => {
                  if (!searchTerm) return true;
                  const query = searchTerm.toLowerCase();
                  const sellerName = renderSellerLabel(listing).toLowerCase();
                  const location = String(getSellerLocation(listing) || '').toLowerCase();
                  
                  return sellerName.includes(query) || location.includes(query);
                })
                .map((listing) => {
                  const amount = listing.energyAmount ?? listing.amount ?? 0;
                  const price = listing.pricePerUnit ?? listing.pricePerKwh ?? listing.price ?? 0;
                  const total = (amount * price);
                  const sellerName = renderSellerLabel(listing);
                  const location = getSellerLocation(listing);
                  const newBalanceAfterPurchase = currentEnergyBalance + amount;

                  return (
                    <Grid item xs={12} md={6} lg={4} key={listing._id ?? listing.id}>
                      <Card sx={{ 
                        height: '100%', 
                        transition: '0.3s', 
                        '&:hover': { 
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[8]
                        } 
                      }}>
                        <CardContent>
                          <Stack spacing={2}>
                            {/* Seller Info */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Person sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6" noWrap>
                                  {sellerName}
                                </Typography>
                              </Box>
                              <Chip 
                                label={`⭐ ${listing.rating ?? '4.2'}`} 
                                size="small" 
                                variant="outlined"
                              />
                            </Box>

                            <Divider />

                            {/* Energy Details */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Bolt sx={{ mr: 1, color: 'warning.main' }} />
                                <Typography variant="h6">{amount.toFixed(1)} kWh</Typography>
                              </Box>
                              <Typography variant="h6" color="primary">
                                ${price.toFixed(2)}/kWh
                              </Typography>
                            </Box>

                            {/* Seller Production Info */}
                            {listing.seller?.estimatedDailyProductionKwh && (
                              <Typography variant="body2" color="text.secondary">
                                Daily Production: {listing.seller.estimatedDailyProductionKwh} kWh
                              </Typography>
                            )}

                            {location && (
                              <Typography variant="body2" color="text.secondary">
                                Location: {location}
                              </Typography>
                            )}

                            {/* Expiry Info */}
                            {listing.expiresAt && (
                              <Typography variant="body2" color="text.secondary">
                                Expires: {new Date(listing.expiresAt).toLocaleDateString()}
                              </Typography>
                            )}

                            {/* Total Price */}
                            <Paper sx={{ p: 1.5, bgcolor: 'grey.50' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body1">Total:</Typography>
                                <Typography variant="body1" fontWeight="bold">
                                  ${total.toFixed(2)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  New Balance:
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {newBalanceAfterPurchase.toFixed(1)} kWh
                                </Typography>
                              </Box>
                            </Paper>

                            {/* Purchase Button */}
                            <Button
                              variant="contained"
                              fullWidth
                              onClick={() => handlePurchaseFromSeller(listing)}
                              sx={{ py: 1 }}
                              disabled={listing.status !== 'open'}
                            >
                              {listing.status === 'open' ? 'Purchase Now' : 'Unavailable'}
                            </Button>

                            {/* Status Badge */}
                            <Chip 
                              label={listing.status || 'open'} 
                              color={listing.status === 'open' ? 'success' : 'default'}
                              size="small"
                              variant="filled"
                              sx={{ alignSelf: 'flex-start' }}
                            />
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })
            )}
          </Grid>
        </>
      ) : (
        /* From Community Battery Tab */
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Purchase from Community Battery
                </Typography>
                
                {/* Battery Status */}
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>
                      Battery Level: <strong>{batteryStats.totalStoredKwh.toFixed(1)} kWh</strong>
                    </Typography>
                    <Chip 
                      label={`${batteryUtilization.toFixed(1)}% Full`} 
                      color={batteryUtilization > 80 ? 'success' : batteryUtilization > 20 ? 'warning' : 'error'}
                      size="small"
                    />
                  </Box>
                </Alert>
                
                <Stack spacing={3}>
                  {/* Purchase Amount Slider */}
                  <Box>
                    <Typography gutterBottom>
                      Purchase Amount: {purchaseData.purchaseAmount.toFixed(1)} kWh
                    </Typography>
                    <Slider
                      value={purchaseData.purchaseAmount}
                      onChange={handlePurchaseAmountChange}
                      min={0.1}
                      max={Math.min(batteryStats.totalStoredKwh, 50)}
                      step={0.1}
                      valueLabelDisplay="auto"
                      sx={{ mb: 2 }}
                    />
                  </Box>

                  {/* Price Display (Fixed from battery) */}
                  <TextField
                    fullWidth
                    label="Price per kWh ($)"
                    type="number"
                    value={batteryStats.energyPricePerKwh}
                    disabled
                    InputProps={{
                      startAdornment: <Bolt sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    helperText="Fixed price from community battery"
                  />

                  {/* Total Cost Display */}
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6">Total Cost:</Typography>
                      <Typography variant="h6" color="primary">
                        ${purchaseData.totalCost.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        New Balance:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(currentEnergyBalance + purchaseData.purchaseAmount).toFixed(1)} kWh
                      </Typography>
                    </Box>
                  </Paper>

                  {/* Purchase Button */}
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handlePurchaseFromBattery}
                    disabled={loading || purchaseData.purchaseAmount === 0 || batteryStats.totalStoredKwh === 0}
                    sx={{ py: 1.5 }}
                    startIcon={<ShoppingCart />}
                    color="secondary"
                  >
                    {loading ? 'Purchasing...' : 'Purchase from Battery'}
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
                      <Typography variant="body2">Available:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {batteryStats.totalStoredKwh.toFixed(1)} kWh
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Price:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ${batteryStats.energyPricePerKwh}/kWh
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Alert severity="success">
                Energy purchased from the community battery is delivered instantly to your account.
              </Alert>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Benefits
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Instant delivery
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Fixed pricing
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Reliable supply
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

export default BuyEnergy;