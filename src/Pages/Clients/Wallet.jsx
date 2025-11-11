// Pages/Clients/Wallet.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
} from "@mui/material";
import { AccountBalanceWallet, Payment, History } from "@mui/icons-material";
import energyService from "../../services/energy.services";
import { useSelector } from "react-redux";
import orderService from "../../services/order.Services";

const Wallet = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [marketStats, setMarketStats] = useState({
    totalProduction: 0,
    averageProduction: 0,
    totalRecords: 0,
  });
  const user = useSelector((state) => state.auth?.user?._id);
  const [userStats, setUserStats] = useState({
    availableEnergy: 0, // kWh
    walletBalance: 0,
    activeOrders: 0,
    totalEarnings: 0,
  });
  const [energyData, setEnergyData] = useState({
    totalSpent: 0,
    totalEarned: 0,
  });
  const PRICE_PER_KWH = 4;

  const energyWorth = userStats.availableEnergy * PRICE_PER_KWH;

  // Fetch energy data from API
  const fetchEnergyStats = async () => {
    if (!user) return;

    try {
      const response = await energyService.getClientEnergy(user, { limit: 30 });
      if (response.status === "success") {
        const { client } = response.data;
        setUserStats((prev) => ({
          ...prev,
          availableEnergy: client.energyBalance || 0,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch client energy stats:", error);
    }
  };

  const fetchSpentandEarned = async () => {
    const response = await orderService.getEarnedAndSpentStats(user);
    console.log("Transaction response:", response);
    setEnergyData({
      totalSpent: response.data.totalSpent * PRICE_PER_KWH || 0,
      totalEarned: response.data.totalEarned * PRICE_PER_KWH || 0,
    })

  }

  useEffect(() => {
    fetchEnergyStats();
    fetchSpentandEarned();
  }, [user]);

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        My Wallet
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Balance
              </Typography>
              <Typography variant="h3" color="primary" sx={{ mb: 3 }}>
                {`$${energyWorth.toFixed(2)}`}
              </Typography>

              <Stack direction={isMobile ? "column" : "row"} spacing={2}>
                <Button variant="contained" startIcon={<Payment />}>
                  Add Funds
                </Button>
                <Button variant="outlined" startIcon={<History />}>
                  Transaction History
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography>Total Earned</Typography>
                  <Typography>${energyData?.totalEarned}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography>Total Spent</Typography>
                  <Typography>${energyData?.totalSpent}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Wallet;
