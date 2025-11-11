// Pages/Clients/BuyEnergy.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'; // Add useDispatch
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
  Divider
} from '@mui/material';
import {
  Search,
  FilterList,
  Bolt,
  Person
} from '@mui/icons-material';
import orderService from '../../services/order.Services';
import { showToast } from '../../utils/toast';
import { updateEnergyBalance } from '../../store/auth'; // Import the action

const BuyEnergy = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchTerm, setSearchTerm] = useState('');
  const [energyListings, setEnergyListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = useSelector((state) => state.auth?.user?._id);
  const currentEnergyBalance = useSelector((state) => state.auth?.user?.energyBalance || 0);
  const dispatch = useDispatch(); // Initialize dispatch

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

  useEffect(() => {
    fetchOpenOrders();
    const id = setInterval(fetchOpenOrders, 300000); // 5 minutes
    return () => clearInterval(id);
  }, []);

  const handlePurchase = async (listing) => {
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

  // Fixed seller label function
  const renderSellerLabel = (listing) => {
    if (listing.seller && typeof listing.seller === 'object') {
      // Extract name from seller object
      const firstName = listing.seller.firstName || '';
      const lastName = listing.seller.lastName || '';
      const name = `${firstName} ${lastName}`.trim();
      
      // If no name, use wallet address or fallback
      if (name) return name;
      if (listing.seller.walletAddress) {
        return `Seller ${listing.seller.walletAddress.slice(-6)}`;
      }
    }
    
    // Fallbacks
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

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Buy Energy
      </Typography>

      {/* Current Balance Display */}
      <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Your Current Energy Balance:
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {currentEnergyBalance} kWh
            </Typography>
          </Box>
        </CardContent>
      </Card>

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
          <Grid item xs={12}><Typography sx={{ p: 2 }} color="text.secondary">No available listings</Typography></Grid>
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
                          onClick={() => handlePurchase(listing)}
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
    </Box>
  );
};

export default BuyEnergy;