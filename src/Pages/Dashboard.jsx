import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Snackbar,
  IconButton,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import {
  SolarPower as SolarPowerIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalanceWallet as WalletIcon,
  FlashOn as FlashOnIcon,
  SwapHoriz as TradeIcon,
  BatteryChargingFull as BatteryIcon,
  Storage as StorageIcon,
  AttachMoney as MoneyIcon,
  Sync as SyncIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import communityBatteryService from "../services/communityBatteryService";
import energyService from "../services/energy.services";
import blockchainService from "../services/blockchain.services";

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State for all dashboard data
  const [batteryData, setBatteryData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Energy data states
  const [energyData, setEnergyData] = useState([]);
  const [totalProduction, setTotalProduction] = useState(0);
  const [energyTraded, setEnergyTraded] = useState(0);
  const [energyFlow, setEnergyFlow] = useState(null);
  const [communityStats, setCommunityStats] = useState([]);

  // Dialog states
  const [depositDialog, setDepositDialog] = useState(false);
  const [releaseDialog, setReleaseDialog] = useState(false);
  const [amount, setAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [liveProduction, setLiveProduction] = useState(null);
  const [clientsData, setClientsData] = useState([]);

  // Blockchain states
  const [walletConnected, setWalletConnected] = useState(false);
  const [distributionStatus, setDistributionStatus] = useState({
    isDistributing: false,
    lastDistribution: null,
    results: null,
  });
  const [blockchainInfo, setBlockchainInfo] = useState(null);

  const COLORS = ["#4CAF50", "#2196F3", "#FF9800"];

  // Initialize blockchain service on component mount
  useEffect(() => {
    initializeBlockchain();
  }, []);

  const initializeBlockchain = async () => {
    try {
      await blockchainService.initialize();
      setWalletConnected(true);
      setSuccess("Wallet connected successfully!");
      
      // Setup account change listener
      blockchainService.setupAccountListener(async (newAccount) => {
        console.log("Account changed to:", newAccount);
        const connected = await blockchainService.isConnected();
        setWalletConnected(connected);
      });
    } catch (err) {
      console.error("Blockchain initialization failed:", err);
      setError(err.message || "Failed to connect wallet");
      setWalletConnected(false);
    }
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [
        batteryStatus,
        batteryStats,
        batteryTransactions,
        productionData,
        tradeData,
        flowData,
        liveProductionData,
      ] = await Promise.all([
        communityBatteryService.getBatteryStatus(),
        communityBatteryService.getBatteryStats(),
        communityBatteryService.getAllTransactions({ limit: 10 }),
        energyService.getTotalEnergyProduction("today"),
        energyService.getEnergyTradeToday(),
        energyService.getRealTimeEnergyFlow(),
        energyService.getLiveProduction(),
      ]);

      setBatteryData(batteryStatus.data?.battery);
      setStats(batteryStats.data?.statistics);
      setTransactions(batteryTransactions.data?.transactions || []);
      setTotalProduction(productionData.data?.totalProduction || 0);
      setEnergyTraded(tradeData.data?.totalTraded || 0);
      setEnergyFlow(flowData.data);

      if (liveProductionData.status === "success") {
        setLiveProduction(liveProductionData.data);
        setClientsData(liveProductionData.data.clients);
        setTotalProduction(liveProductionData.data.totals.totalEnergyProduced);

        // Automatically distribute tokens if wallet is connected
        if (walletConnected) {
          await distributeTokensAutomatically(liveProductionData.data.clients);
        }
      }

      if (flowData.data?.hourlyFlow) {
        setEnergyData(flowData.data.hourlyFlow);
      }

      updateCommunityStats(
        liveProductionData.data?.totals.totalClients || 0,
        tradeData.data?.transactionCount || 0
      );
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Automatically distribute tokens based on production
  const distributeTokensAutomatically = async (clients) => {
    // Only distribute if there are clients with production
    const clientsWithProduction = clients.filter(
      (client) => client.dailyProductionKwh > 0
    );

    if (clientsWithProduction.length === 0) {
      console.log("No clients with production to distribute tokens to");
      return;
    }

    setDistributionStatus((prev) => ({ ...prev, isDistributing: true }));

    try {
      const result = await blockchainService.distributeTokensToClients(clients);

      setDistributionStatus({
        isDistributing: false,
        lastDistribution: new Date().toISOString(),
        results: result,
      });

      if (result.success && result.summary.successful > 0) {
        setSuccess(
          `✅ Distributed tokens to ${result.summary.successful} clients!`
        );
      } else if (result.summary.skipped === result.summary.total) {
        console.log("All clients skipped - no new production to distribute");
      }
    } catch (err) {
      console.error("Token distribution failed:", err);
      setError(`Token distribution failed: ${err.message}`);
      setDistributionStatus((prev) => ({ ...prev, isDistributing: false }));
    }
  };

  // Manual token distribution trigger
  const handleManualDistribution = async () => {
    if (!walletConnected) {
      setError("Please connect your wallet first");
      return;
    }

    if (clientsData.length === 0) {
      setError("No client data available for distribution");
      return;
    }

    await distributeTokensAutomatically(clientsData);
  };

  // Update community stats for pie chart
  const updateCommunityStats = (activeClients, transactionCount) => {
    const totalUsers = 200;
    const activeProducers = Math.min(activeClients, totalUsers);
    const energyConsumers = Math.min(
      transactionCount * 2,
      totalUsers - activeProducers
    );
    const inactive = totalUsers - activeProducers - energyConsumers;

    setCommunityStats([
      { name: "Active Producers", value: activeProducers },
      { name: "Energy Consumers", value: energyConsumers },
      { name: "Inactive", value: Math.max(0, inactive) },
    ]);
  };

  useEffect(() => {
    fetchDashboardData();

    // Refresh all data every 3 minutes
    const interval = setInterval(fetchDashboardData, 3 * 60 * 1000);

    return () => clearInterval(interval);
  }, [walletConnected]);

  const renderClientProduction = () => (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Live Client Energy Production
          </Typography>
          <Box display="flex" gap={1} alignItems="center">
            {distributionStatus.isDistributing && (
              <Chip
                label="Distributing Tokens..."
                color="primary"
                size="small"
                icon={<SyncIcon className="rotating" />}
              />
            )}
            {walletConnected && (
              <Tooltip title="Manually distribute tokens">
                <IconButton
                  size="small"
                  onClick={handleManualDistribution}
                  disabled={distributionStatus.isDistributing}
                  color="primary"
                >
                  <SyncIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Distribution Status Alert */}
        {distributionStatus.results && (
          <Alert
            severity={
              distributionStatus.results.success ? "success" : "error"
            }
            sx={{ mb: 2 }}
          >
            <Typography variant="body2">
              <strong>Last Distribution:</strong>{" "}
              {new Date(distributionStatus.lastDistribution).toLocaleString()}
            </Typography>
            {distributionStatus.results.summary && (
              <Typography variant="body2">
                ✅ Successful: {distributionStatus.results.summary.successful} |
                ⏭️ Skipped: {distributionStatus.results.summary.skipped}
              </Typography>
            )}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : clientsData.length === 0 ? (
          <Typography color="textSecondary" textAlign="center" py={3}>
            No production data available
          </Typography>
        ) : (
          <Box sx={{ maxHeight: 400, overflow: "auto" }}>
            {clientsData.map((client, index) => {
              const distributionResult = distributionStatus.results?.results?.find(
                (r) => r.clientId === client.clientId
              );

              return (
                <Box
                  key={client.clientId}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  py={2}
                  sx={{
                    borderBottom:
                      index < clientsData.length - 1
                        ? "1px solid #e0e0e0"
                        : "none",
                  }}
                >
                  <Box display="flex" alignItems="center" flex={1}>
                    <Avatar
                      sx={{
                        bgcolor:
                          client.userType === "factory"
                            ? theme.palette.secondary.main
                            : theme.palette.primary.main,
                        width: 40,
                        height: 40,
                        mr: 2,
                      }}
                    >
                      {client.userType === "factory" ? (
                        <FlashOnIcon />
                      ) : (
                        <SolarPowerIcon />
                      )}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body1" fontWeight="medium">
                        {client.name}
                        {distributionResult?.success && (
                          <CheckIcon
                            sx={{
                              ml: 1,
                              fontSize: 16,
                              color: "success.main",
                            }}
                          />
                        )}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {client.location || "No location"} •{" "}
                        {client.solarPanelSize} panel
                      </Typography>
                      {distributionResult?.success && (
                        <Typography
                          variant="caption"
                          color="success.main"
                          display="block"
                        >
                          +{distributionResult.amountSLR} SLR tokens distributed
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box textAlign="right" minWidth={120}>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {client.dailyProductionKwh.toFixed(2)} kWh
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Balance: {client.energyBalance.toFixed(2)} kWh
                    </Typography>
                    <Typography variant="caption" color="primary">
                      ≈ {(client.dailyProductionKwh * 100).toFixed(0)} SLR
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // Handle deposit energy
  const handleDeposit = async () => {
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setActionLoading(true);
      const response = await communityBatteryService.depositEnergy(
        parseFloat(amount)
      );
      setSuccess(`Successfully deposited ${amount} kWh to community battery!`);
      setDepositDialog(false);
      setAmount("");
      await fetchDashboardData();
    } catch (err) {
      setError(err.message || "Failed to deposit energy");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle release energy
  const handleRelease = async () => {
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setActionLoading(true);
      const response = await communityBatteryService.releaseEnergy(
        parseFloat(amount)
      );
      setSuccess(`Successfully released ${amount} kWh from community battery!`);
      setReleaseDialog(false);
      setAmount("");
      await fetchDashboardData();
    } catch (err) {
      setError(err.message || "Failed to release energy");
    } finally {
      setActionLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0";
    return num.toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });
  };

  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return "+0.0";
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${change.toFixed(1)}` : `${change.toFixed(1)}`;
  };

  const StatCard = ({
    title,
    value,
    change,
    icon,
    color,
    onClick,
    clickable = false,
  }) => (
    <Card
      sx={{
        height: "100%",
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        transition: "all 0.3s ease",
        cursor: clickable ? "pointer" : "default",
        "&:hover": {
          transform: clickable ? "translateY(-4px)" : "none",
          boxShadow: clickable ? `0 8px 25px ${color}25` : "none",
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            {change && (
              <Box display="flex" alignItems="center" mt={1}>
                {change.startsWith("+") ? (
                  <TrendingUpIcon
                    sx={{ color: "success.main", fontSize: 16, mr: 0.5 }}
                  />
                ) : (
                  <TrendingDownIcon
                    sx={{ color: "error.main", fontSize: 16, mr: 0.5 }}
                  />
                )}
                <Typography
                  variant="body2"
                  color={change.startsWith("+") ? "success.main" : "error.main"}
                >
                  {change}% vs last month
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>{icon}</Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const RecentTransactions = () => (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Recent Community Battery Transactions
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : transactions.length === 0 ? (
          <Typography color="textSecondary" textAlign="center" py={3}>
            No transactions yet
          </Typography>
        ) : (
          transactions.slice(0, 5).map((transaction, index) => (
            <Box
              key={transaction.transactionId || index}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              py={2}
              sx={{
                borderBottom:
                  index < Math.min(transactions.length, 5) - 1
                    ? "1px solid #e0e0e0"
                    : "none",
              }}
            >
              <Box display="flex" alignItems="center">
                <Avatar
                  sx={{
                    bgcolor:
                      transaction.type === "deposit"
                        ? theme.palette.success.light
                        : theme.palette.primary.light,
                    width: 40,
                    height: 40,
                    mr: 2,
                  }}
                >
                  {transaction.type === "deposit" ? (
                    <TrendingUpIcon />
                  ) : (
                    <TrendingDownIcon />
                  )}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {transaction.type === "deposit"
                      ? "Energy Deposit"
                      : "Energy Release"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {transaction.client?.firstName &&
                    transaction.client?.lastName
                      ? `${transaction.client.firstName} ${transaction.client.lastName}`
                      : "Anonymous User"}
                  </Typography>
                </Box>
              </Box>
              <Box textAlign="right">
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color={
                    transaction.type === "deposit"
                      ? "success.main"
                      : "primary.main"
                  }
                >
                  {transaction.type === "deposit" ? "+" : "-"}
                  {formatNumber(transaction.amountKwh)} kWh
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  $
                  {formatNumber(
                    transaction.totalAmount ||
                      transaction.totalEarnings ||
                      transaction.totalCost
                  )}
                </Typography>
              </Box>
            </Box>
          ))
        )}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 0 }}>
      <Box sx={{ p: 3, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
        {/* Header */}
        <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              fontWeight="bold"
            >
              Solar Energy Dashboard
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Community Overview - 200 Families Connected
            </Typography>
          </Box>
          <Box>
            {!walletConnected ? (
              <Button
                variant="contained"
                startIcon={<WalletIcon />}
                onClick={initializeBlockchain}
                color="warning"
              >
                Connect Wallet
              </Button>
            ) : (
              <Chip
                label="Wallet Connected"
                color="success"
                icon={<CheckIcon />}
              />
            )}
          </Box>
        </Box>

        {/* Blockchain Status Banner */}
        {walletConnected && distributionStatus.isDistributing && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <CircularProgress size={20} />
              <Typography>
                Distributing SLR tokens to clients based on energy production...
              </Typography>
            </Box>
          </Alert>
        )}

        {/* Error and Success Messages */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError("")}
        >
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess("")}
        >
          <Alert severity="success" onClose={() => setSuccess("")}>
            {success}
          </Alert>
        </Snackbar>

        {/* Key Metrics */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Energy Production"
              value={
                loading
                  ? "..."
                  : `${formatNumber(
                      liveProduction?.totals.totalEnergyProduced ||
                        totalProduction
                    )} kWh`
              }
              change={calculatePercentageChange(
                liveProduction?.totals.totalEnergyProduced || totalProduction,
                (liveProduction?.totals.totalEnergyProduced ||
                  totalProduction) * 0.85
              )}
              icon={<SolarPowerIcon />}
              color={theme.palette.warning.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Energy Traded Today"
              value={loading ? "..." : `${formatNumber(energyTraded)} kWh`}
              change={calculatePercentageChange(
                energyTraded,
                energyTraded * 0.92
              )}
              icon={<TradeIcon />}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Community Battery Storage"
              value={
                loading
                  ? "..."
                  : `${formatNumber(batteryData?.totalStoredKwh)} kWh`
              }
              change={stats ? `+${formatNumber(stats.depositsToday)}` : "+0"}
              icon={<BatteryIcon />}
              color={theme.palette.success.main}
              clickable={true}
              onClick={() => setDepositDialog(true)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Energy Price"
              value={
                loading ? "..." : `$${batteryData?.energyPricePerKwh || "0.00"}`
              }
              change="+2.1"
              icon={<MoneyIcon />}
              color={theme.palette.info.main}
              clickable={true}
              onClick={() => setReleaseDialog(true)}
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        

        {/* Main Charts Row */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <Card sx={{ height: 500 }}>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Real-time Energy Flow
                  </Typography>
                  <Box display="flex" gap={2}>
                    <Chip label="Production" color="warning" size="small" />
                    <Chip label="Consumption" color="error" size="small" />
                    <Chip label="Trading" color="primary" size="small" />
                  </Box>
                </Box>
                {loading ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height={400}
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={energyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <ChartTooltip />
                      <Area
                        type="monotone"
                        dataKey="production"
                        stackId="1"
                        stroke="#FF9800"
                        fill="#FF980030"
                      />
                      <Area
                        type="monotone"
                        dataKey="consumption"
                        stackId="2"
                        stroke="#F44336"
                        fill="#F4433630"
                      />
                      <Area
                        type="monotone"
                        dataKey="trading"
                        stackId="3"
                        stroke="#2196F3"
                        fill="#2196F330"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Card sx={{ height: 500 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Community Status
                </Typography>
                {loading ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height={400}
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <Pie
                        data={communityStats}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={true}
                      >
                        {communityStats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {renderClientProduction()}
        <RecentTransactions />

        {/* Deposit Dialog */}
        <Dialog
          open={depositDialog}
          onClose={() => setDepositDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Deposit Energy to Community Battery</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="textSecondary" mb={2}>
              Transfer your excess solar energy to the community battery
              storage. You'll earn credits at the current market rate.
            </Typography>
            <TextField
              autoFocus
              label="Amount (kWh)"
              type="number"
              fullWidth
              variant="outlined"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in kWh"
              sx={{ mt: 2 }}
            />
            {batteryData && (
              <Typography variant="body2" color="textSecondary" mt={2}>
                Current Price:{" "}
                <strong>${batteryData.energyPricePerKwh}/kWh</strong>
                {amount &&
                  ` • Estimated Earnings: $${(
                    parseFloat(amount) * batteryData.energyPricePerKwh
                  ).toFixed(2)}`}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDepositDialog(false)}>Cancel</Button>
            <Button
              onClick={handleDeposit}
              variant="contained"
              disabled={actionLoading || !amount}
              startIcon={actionLoading ? <CircularProgress size={16} /> : null}
            >
              {actionLoading ? "Depositing..." : "Deposit Energy"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Release Dialog */}
        <Dialog
          open={releaseDialog}
          onClose={() => setReleaseDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Release Energy from Community Battery</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="textSecondary" mb={2}>
              Withdraw energy from the community battery when you need extra
              power. This will be charged at the current market rate.
            </Typography>
            <TextField
              autoFocus
              label="Amount (kWh)"
              type="number"
              fullWidth
              variant="outlined"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in kWh"
              sx={{ mt: 2 }}
            />
            {batteryData && (
              <Typography variant="body2" color="textSecondary" mt={2}>
                Current Price:{" "}
                <strong>${batteryData.energyPricePerKwh}/kWh</strong>
                {amount &&
                  ` • Estimated Cost: ${(
                    parseFloat(amount) * batteryData.energyPricePerKwh
                  ).toFixed(2)}`}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReleaseDialog(false)}>Cancel</Button>
            <Button
              onClick={handleRelease}
              variant="contained"
              disabled={actionLoading || !amount}
              startIcon={actionLoading ? <CircularProgress size={16} /> : null}
            >
              {actionLoading ? "Releasing..." : "Release Energy"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add CSS for rotating animation */}
        <style>
          {`
            @keyframes rotate {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
            .rotating {
              animation: rotate 2s linear infinite;
            }
          `}
        </style>
      </Box>
    </Container>
  );
};

export default Dashboard;