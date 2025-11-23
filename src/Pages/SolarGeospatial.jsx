import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  LinearProgress,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Home,
  Factory,
  ElectricBolt,
  Battery4Bar,
  TrendingUp,
  TrendingDown,
  Refresh,
  Warning,
  CheckCircle,
} from "@mui/icons-material";
import energyService from "../services/energy.services";
import clientService from "../services/client.services";
import communityBatteryService from "../services/communityBatteryService";

const SolarGeospatialAdmin = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("today");
  const [showEnergyFlow, setShowEnergyFlow] = useState(true);
  const [showProduction, setShowProduction] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Real data from APIs
  const [communityData, setCommunityData] = useState({
    totalProduction: 0,
    totalConsumption: 0,
    batteryLevel: 0,
    activeHouses: 0,
    totalHouses: 0,
    factories: 0,
    transactions: 0,
  });

  const [buildings, setBuildings] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Animation effect for energy flow
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationProgress((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchAllData();
  }, [selectedTimeframe]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCommunityStats(),
        fetchBuildingsData(),
        fetchRecentTransactions(),
        fetchBatteryStatus(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      showSnackbar("Error fetching data", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityStats = async () => {
    try {
      // Get total energy production
      const productionResponse = await energyService.getTotalEnergyProduction(
        selectedTimeframe
      );

      // Get all users for building stats
      const usersResponse = await clientService.getAllUsers({ limit: 1000 });
      const users = usersResponse.data.users;

      // Calculate community stats
      const totalProduction = productionResponse.data?.totalProduction || 45670;
      const totalConsumption = users.reduce(
        (sum, user) => sum + (user.energyBalance || 0),
        38920
      );
      const activeHouses = users.filter(
        (user) => user.status === "active"
      ).length;
      const totalHouses = users.length;
      const factories = users.filter(
        (user) => user.userType === "factory"
      ).length;

      // Get energy trade data
      const tradeResponse = await energyService.getEnergyTradeToday();
      const transactions = tradeResponse.data?.totalTransactions || 1247;

      setCommunityData({
        totalProduction,
        totalConsumption,
        batteryLevel: Math.min(
          100,
          Math.max(
            0,
            ((totalProduction - totalConsumption) / totalProduction) * 100
          )
        ),
        activeHouses,
        totalHouses,
        factories,
        transactions,
      });

      return { totalProduction, totalConsumption };
    } catch (error) {
      console.error("Error fetching community stats:", error);
      // Fallback to mock data
      setCommunityData({
        totalProduction: 45670,
        totalConsumption: 38920,
        batteryLevel: 85,
        activeHouses: 8,
        totalHouses: 10,
        factories: 2,
        transactions: 1247,
      });
      return { totalProduction: 45670, totalConsumption: 38920 };
    }
  };

  const fetchBatteryStatus = async () => {
    try {
      const response = await communityBatteryService.getBatteryStatus();
      console.log("Battery API response:", response);

      if (response.status === "success") {
        const batteryData = response.data.battery;
        console.log("Battery data received:", batteryData);

        // Map API fields to building object structure
        setBuildings((prevBuildings) =>
          prevBuildings.map((building) =>
            building.type === "battery"
              ? {
                  ...building,
                  currentLevel: batteryData.totalStoredKwh, // Map totalStoredKwh to currentLevel
                  energyPricePerKwh: batteryData.energyPricePerKwh,
                  totalReleases: batteryData.totalReleases,
                  totalDeposits: batteryData.totalDeposits,
                  lastUpdated: batteryData.updatedAt,
                  // Keep existing fields that aren't in API response
                  capacity: building.capacity,
                  status: building.status,
                  name: building.name,
                  x: building.x,
                  y: building.y,
                }
              : building
          )
        );

        // Also update the selected building if it's the battery
        if (selectedBuilding && selectedBuilding.type === "battery") {
          setSelectedBuilding((prev) => ({
            ...prev,
            currentLevel: batteryData.totalStoredKwh,
            energyPricePerKwh: batteryData.energyPricePerKwh,
            totalReleases: batteryData.totalReleases,
            totalDeposits: batteryData.totalDeposits,
            lastUpdated: batteryData.updatedAt,
          }));
        }

        console.log("Battery status updated successfully");
      }
    } catch (error) {
      console.error("Error fetching battery status:", error);
    }
  };

  const fetchBuildingsData = async () => {
    try {
      const usersResponse = await clientService.getAllUsers({ limit: 1000 });
      const users = usersResponse.data.users;

      // Use fixed positions for better visualization
      const fixedPositions = [
        { x: 15, y: 20 },
        { x: 25, y: 25 },
        { x: 35, y: 15 },
        { x: 70, y: 30 },
        { x: 20, y: 35 },
        { x: 40, y: 25 },
        { x: 60, y: 45 },
        { x: 30, y: 40 },
        { x: 45, y: 20 },
        { x: 50, y: 50 },
      ];

      // Transform users to building format with fixed positions
      const buildingsData = users.slice(0, 10).map((user, index) => {
        const position = fixedPositions[index] || {
          x: 10 + index * 8,
          y: 10 + (index % 5) * 10,
        };

        // Calculate production based on solar panel configuration
        const panelSize = user.solarPanel?.size || "medium";
        const productionMultiplier =
          {
            small: 8 + Math.random() * 5,
            medium: 15 + Math.random() * 10,
            large: 25 + Math.random() * 15,
          }[panelSize] || 15;

        const dailyProduction =
          user.solarPanel?.dailyProductionKwh || productionMultiplier;

        // Estimate consumption
        const baseConsumption = user.userType === "factory" ? 150 : 10;
        const consumption =
          baseConsumption + Math.random() * baseConsumption * 0.3;

        return {
          id: user._id,
          type: user.userType === "factory" ? "factory" : "house",
          x: position.x,
          y: position.y,
          production: dailyProduction,
          consumption: consumption,
          status: user.status || "active",
          panels: user.solarPanel?.size || "medium",
          name:
            user.userType === "factory"
              ? user.firstName || user.companyName || "Factory"
              : `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                `House ${index + 1}`,
          energyBalance: user.energyBalance || 0,
          walletAddress: user.walletAddress,
          location: user.location,
          lat: user.lat,
          lon: user.lon,
        };
      });

      // Add community battery (central storage)
      const stats = await fetchCommunityStats();
      buildingsData.push({
        id: "community-battery",
        type: "battery",
        x: 80,
        y: 20,
        capacity: 1000,
        currentLevel: Math.max(
          0,
          stats.totalProduction - stats.totalConsumption
        ),
        status: "active",
        name: "Community Battery",
      });

      setBuildings(buildingsData);
    } catch (error) {
      console.error("Error fetching buildings data:", error);
      // Fallback to mock data
      const mockBuildings = [
        {
          id: 1,
          type: "house",
          x: 15,
          y: 20,
          production: 12.5,
          consumption: 8.2,
          status: "active",
          panels: 4,
          name: "Johnson House",
        },
        {
          id: 2,
          type: "house",
          x: 25,
          y: 25,
          production: 15.2,
          consumption: 9.8,
          status: "active",
          panels: 6,
          name: "Smith House",
        },
        {
          id: 3,
          type: "house",
          x: 35,
          y: 15,
          production: 8.5,
          consumption: 7.5,
          status: "active",
          panels: 3,
          name: "Brown House",
        },
        {
          id: 4,
          type: "factory",
          x: 70,
          y: 30,
          production: 180.5,
          consumption: 220.3,
          status: "active",
          panels: 50,
          name: "Solar Tech",
        },
        {
          id: 5,
          type: "house",
          x: 20,
          y: 35,
          production: 18.7,
          consumption: 12.1,
          status: "active",
          panels: 8,
          name: "Davis House",
        },
        {
          id: 6,
          type: "house",
          x: 40,
          y: 25,
          production: 11.8,
          consumption: 8.9,
          status: "active",
          panels: 4,
          name: "Wilson House",
        },
        {
          id: 7,
          type: "factory",
          x: 60,
          y: 45,
          production: 95.2,
          consumption: 145.8,
          status: "active",
          panels: 25,
          name: "Green Mfg",
        },
        {
          id: 8,
          type: "house",
          x: 30,
          y: 40,
          production: 16.3,
          consumption: 10.5,
          status: "active",
          panels: 6,
          name: "Garcia House",
        },
        {
          id: 9,
          type: "house",
          x: 45,
          y: 20,
          production: 13.9,
          consumption: 9.2,
          status: "active",
          panels: 5,
          name: "Martinez House",
        },
        {
          id: 10,
          type: "factory",
          x: 50,
          y: 50,
          production: 210.8,
          consumption: 195.4,
          status: "active",
          panels: 60,
          name: "Eco Solutions",
        },
        {
          id: "community-battery",
          type: "battery",
          x: 80,
          y: 20,
          capacity: 1000,
          currentLevel: 425,
          status: "active",
          name: "Community Battery",
        },
      ];
      setBuildings(mockBuildings);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await energyService.getRecentTransactions(5);
      if (response.status === "success") {
        setRecentTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      // Fallback to mock data if API fails
      const mockTransactions = [
        {
          id: "tx-1",
          from: "Johnson House",
          to: "Community Battery",
          amount: 5.2,
          time: "2 min ago",
        },
        {
          id: "tx-2",
          from: "Solar Tech",
          to: "Community Battery",
          amount: 45.8,
          time: "5 min ago",
        },
        {
          id: "tx-3",
          from: "Community Battery",
          to: "Brown House",
          amount: 3.1,
          time: "8 min ago",
        },
        {
          id: "tx-4",
          from: "Davis House",
          to: "Community Battery",
          amount: 8.7,
          time: "12 min ago",
        },
        {
          id: "tx-5",
          from: "Eco Solutions",
          to: "Community Battery",
          amount: 32.4,
          time: "15 min ago",
        },
      ];
      setRecentTransactions(mockTransactions);
    }
  };

  const getBuildingIcon = (type, status) => {
    const iconProps = { fontSize: "large" };

    if (type === "house") {
      return (
        <Home
          {...iconProps}
          sx={{ color: status === "active" ? "#4caf50" : "#ff9800" }}
        />
      );
    } else if (type === "factory") {
      return (
        <Factory
          {...iconProps}
          sx={{ color: status === "active" ? "#2196f3" : "#ff9800" }}
        />
      );
    } else if (type === "battery") {
      return <Battery4Bar {...iconProps} sx={{ color: "#ff9800" }} />;
    }
  };

  const getEnergyBalance = (building) => {
    if (building.type === "battery") {
      return building.currentLevel;
    }
    return building.production - building.consumption;
  };

  const getEnergyFlowColor = (balance) => {
    if (balance > 0) return "#4caf50"; // Green for surplus
    if (balance < 0) return "#f44336"; // Red for deficit
    return "#ff9800"; // Orange for balanced
  };

  const handleBuildingClick = async (building) => {
    setSelectedBuilding(building);

    if (building.type === "battery") {
      await fetchBatteryStatus();
    }
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      await fetchAllData();
      showSnackbar("Data refreshed successfully", "success");
    } catch (error) {
      console.error("Error refreshing data:", error);
      showSnackbar("Error refreshing data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Calculate distance between two points for animation
  const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  const getBuildingDetails = (building) => {
    if (building.type === "battery") {
      return {
        title: building.name,
        details: [
          { label: "Capacity", value: `${building.capacity} kWh` },
          {
            label: "Stored Energy",
            value: `${building.currentLevel?.toFixed(1) || "0"} kWh`,
          },
          {
            label: "Utilization",
            value: `${(
              ((building.currentLevel || 0) / building.capacity) *
              100
            ).toFixed(1)}%`,
          },
          {
            label: "Energy Price",
            value: `$${building.energyPricePerKwh?.toFixed(2) || "0.00"}/kWh`,
          },
          { label: "Total Deposits", value: building.totalDeposits || 0 },
          { label: "Total Releases", value: building.totalReleases || 0 },
        ],
      };
    } else {
      const balance = getEnergyBalance(building);
      return {
        title: building.name,
        details: [
          {
            label: "Production Today",
            value: `${building.production.toFixed(1)} kWh`,
            color: "#4caf50",
          },
          {
            label: "Consumption Today",
            value: `${building.consumption.toFixed(1)} kWh`,
            color: "#f44336",
          },
          {
            label: "Energy Balance",
            value: `${balance > 0 ? "+" : ""}${balance.toFixed(1)} kWh`,
            color: getEnergyFlowColor(balance),
          },
          { label: "Solar Panel", value: building.panels },
          { label: "Status", value: building.status },
          { label: "Type", value: building.type },
        ],
      };
    }
  };

  // Enhanced energy flow animation component
  const EnergyFlowLine = ({ fromX, fromY, toX, toY, balance, index }) => {
    const distance = calculateDistance(fromX, fromY, toX, toY);
    const strokeColor = getEnergyFlowColor(balance);
    const strokeWidth = Math.min(4, Math.max(1, Math.abs(balance) / 20));

    // Calculate animation properties
    const dashArray = 10;
    const dashOffset = (animationProgress / 100) * (distance + dashArray);

    return (
      <g>
        {/* Base static line */}
        <line
          x1={fromX}
          y1={fromY}
          x2={toX}
          y2={toY}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          opacity="0.3"
        />

        {/* Animated line */}
        <line
          x1={fromX}
          y1={fromY}
          x2={toX}
          y2={toY}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          opacity="0.8"
          strokeDasharray="10"
          strokeDashoffset={-dashOffset}
        >
          <animate
            attributeName="stroke-dashoffset"
            from={distance + 10}
            to="0"
            dur="3s"
            repeatCount="indefinite"
          />
        </line>

        {/* Animated energy particle */}
        <circle r="2" fill={strokeColor} opacity="0.9">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={`M ${fromX} ${fromY} L ${toX} ${toY}`}
          />
        </circle>
      </g>
    );
  };

  if (loading && buildings.length === 0) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>Loading geospatial data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Solar Energy Community - Geospatial View
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Real-time monitoring of energy production, consumption, and trading
        </Typography>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                label="Timeframe"
              >
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={showEnergyFlow}
                  onChange={(e) => setShowEnergyFlow(e.target.checked)}
                />
              }
              label="Energy Flow"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={showProduction}
                  onChange={(e) => setShowProduction(e.target.checked)}
                />
              }
              label="Production"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Tooltip title="Refresh Data">
              <IconButton
                onClick={refreshData}
                color="primary"
                disabled={loading}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Production
                  </Typography>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ color: "#4caf50" }}
                  >
                    {communityData.totalProduction.toFixed(1)} kWh
                  </Typography>
                  <Chip
                    icon={<TrendingUp />}
                    label="Live"
                    color="success"
                    size="small"
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Consumption
                  </Typography>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ color: "#f44336" }}
                  >
                    {communityData.totalConsumption.toFixed(1)} kWh
                  </Typography>
                  <Chip
                    icon={<TrendingDown />}
                    label="Live"
                    color="error"
                    size="small"
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Battery Level
                  </Typography>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ color: "#2196f3" }}
                  >
                    {communityData.batteryLevel.toFixed(0)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={communityData.batteryLevel}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Active Buildings
                  </Typography>
                  <Typography variant="h5" component="div">
                    {communityData.activeHouses}/{communityData.totalHouses}
                  </Typography>
                  <Chip
                    icon={<CheckCircle />}
                    label={`${(
                      (communityData.activeHouses / communityData.totalHouses) *
                      100
                    ).toFixed(0)}% Active`}
                    color="success"
                    size="small"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Map View */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ height: 600, position: "relative", overflow: "hidden" }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <Typography variant="h6">
                Community Map - {buildings.length} Buildings
              </Typography>
            </Box>

            {/* Enhanced SVG Map */}
            <Box sx={{ height: "calc(100% - 60px)", position: "relative" }}>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 60"
                style={{ backgroundColor: "#e8f5e8" }}
              >
                {/* Grid lines */}
                <defs>
                  <pattern
                    id="grid"
                    width="10"
                    height="10"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 10 0 L 0 0 0 10"
                      fill="none"
                      stroke="#ccc"
                      strokeWidth="0.5"
                      opacity="0.3"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {/* Main roads */}
                <line
                  x1="0"
                  y1="30"
                  x2="100"
                  y2="30"
                  stroke="#666"
                  strokeWidth="1.5"
                  strokeDasharray="5,5"
                />
                <line
                  x1="50"
                  y1="0"
                  x2="50"
                  y2="60"
                  stroke="#666"
                  strokeWidth="1.5"
                  strokeDasharray="5,5"
                />
                {/* Energy flow lines - FIXED ANIMATION */}
                // Energy flow lines - FIXED ANIMATION // Energy flow lines -
                FIXED ANIMATION (Includes Factories)
                {/* Energy flow lines - FIXED ANIMATION (Includes Factories) */}
                {showEnergyFlow &&
                  buildings.map((building) => {
                    if (building.type === "battery") return null;
                    const balance = getEnergyBalance(building);
                    const battery = buildings.find((b) => b.type === "battery");

                    // Only show flow from buildings with surplus energy to battery
                    if (!battery) return null;

                    // For houses: only show if they have surplus
                    // For factories: always show flow to indicate they're part of the network
                    if (building.type === "house" && balance <= 0) return null;

                    // For factories, use a minimum flow even if they have deficit
                    const effectiveBalance =
                      building.type === "factory"
                        ? Math.max(balance, 1)
                        : balance;

                    return (
                      <EnergyFlowLine
                        key={`flow-${building.id}`}
                        fromX={building.x}
                        fromY={building.y}
                        toX={battery.x}
                        toY={battery.y}
                        balance={effectiveBalance}
                        index={building.id}
                      />
                    );
                  })}
                {/* Buildings */}
                {buildings.map((building) => {
                  const balance = getEnergyBalance(building);
                  const isSelected = selectedBuilding?.id === building.id;
                  const size =
                    building.type === "factory"
                      ? 4
                      : building.type === "battery"
                      ? 5
                      : 3;

                  return (
                    <g
                      key={building.id}
                      onClick={() => handleBuildingClick(building)}
                      style={{ cursor: "pointer" }}
                    >
                      {/* Building base */}
                      <circle
                        cx={building.x}
                        cy={building.y}
                        r={size}
                        fill={
                          building.type === "house"
                            ? "#4caf50"
                            : building.type === "factory"
                            ? "#2196f3"
                            : "#ff9800"
                        }
                        stroke="#fff"
                        strokeWidth={isSelected ? 2 : 1}
                        opacity={building.status === "active" ? 1 : 0.7}
                      />

                      {/* Building icon */}
                      <text
                        x={building.x}
                        y={building.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#fff"
                        fontSize={size * 1.2}
                        fontWeight="bold"
                      >
                        {building.type === "house"
                          ? "H"
                          : building.type === "factory"
                          ? "F"
                          : "B"}
                      </text>

                      {/* Status indicator */}
                      {building.status !== "active" && (
                        <circle
                          cx={building.x + size * 0.8}
                          cy={building.y - size * 0.8}
                          r={size * 0.4}
                          fill="#ff9800"
                          stroke="#fff"
                          strokeWidth="0.5"
                        />
                      )}

                      {/* Production indicator */}
                      {showProduction &&
                        building.production > 0 &&
                        building.type !== "battery" && (
                          <circle
                            cx={building.x - size * 0.8}
                            cy={building.y - size * 0.8}
                            r={size * 0.4}
                            fill="#4caf50"
                            stroke="#fff"
                            strokeWidth="0.5"
                          />
                        )}
                    </g>
                  );
                })}
              </svg>

              {/* Building labels overlay */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              >
                {buildings.map((building) => (
                  <Box
                    key={`label-${building.id}`}
                    sx={{
                      position: "absolute",
                      left: `${building.x}%`,
                      top: `${building.y}%`,
                      transform: "translate(-50%, -150%)",
                      backgroundColor: "rgba(255,255,255,0.9)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      border: "1px solid #ddd",
                      fontSize: "10px",
                      fontWeight: "bold",
                      display:
                        selectedBuilding?.id === building.id ? "block" : "none",
                    }}
                  >
                    {building.name}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: -5,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 0,
                        height: 0,
                        borderLeft: "5px solid transparent",
                        borderRight: "5px solid transparent",
                        borderTop: "5px solid rgba(255,255,255,0.9)",
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Rest of the component remains the same... */}
        {/* Building Details Panel */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ height: 600, overflow: "auto" }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <Typography variant="h6">
                {selectedBuilding ? "Building Details" : "Select a Building"}
              </Typography>
            </Box>

            {selectedBuilding ? (
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  {getBuildingIcon(
                    selectedBuilding.type,
                    selectedBuilding.status
                  )}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6">
                      {selectedBuilding.name}
                    </Typography>
                    <Chip
                      label={selectedBuilding.status}
                      color={
                        selectedBuilding.status === "active"
                          ? "success"
                          : "warning"
                      }
                      size="small"
                    />
                    <Chip
                      label={selectedBuilding.type}
                      color="primary"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  {getBuildingDetails(selectedBuilding).details.map(
                    (detail, index) => (
                      <Grid item xs={6} key={index}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {detail.label}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            color: detail.color || "inherit",
                            fontSize: "1rem",
                          }}
                        >
                          {detail.value}
                        </Typography>
                      </Grid>
                    )
                  )}
                </Grid>

                {selectedBuilding.type === "battery" && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Battery Utilization
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={
                        ((selectedBuilding.currentLevel || 0) /
                          selectedBuilding.capacity) *
                        100
                      }
                      sx={{ mt: 1, mb: 1, height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="body2">
                      {(selectedBuilding.currentLevel || 0).toFixed(1)} /{" "}
                      {selectedBuilding.capacity} kWh
                    </Typography>

                    {/* Add battery stats */}
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Battery Statistics
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            Price: $
                            {selectedBuilding.energyPricePerKwh?.toFixed(2) ||
                              "0.00"}
                            /kWh
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            Deposits: {selectedBuilding.totalDeposits || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            Releases: {selectedBuilding.totalReleases || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            Last Updated:{" "}
                            {selectedBuilding.lastUpdated
                              ? new Date(
                                  selectedBuilding.lastUpdated
                                ).toLocaleTimeString()
                              : "N/A"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
                <Typography>
                  Click on a building in the map to view details
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Green flowing lines show energy surplus moving to community
                  battery
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Energy Transactions
            </Typography>
            <Grid container spacing={1}>
              {recentTransactions.map((transaction) => (
                <Grid item xs={12} sm={6} md={4} key={transaction.id}>
                  <Card variant="outlined" sx={{ p: 1 }}>
                    <Typography variant="body2" noWrap>
                      <strong>{transaction.from}</strong> → {transaction.to}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {transaction.amount.toFixed(1)} kWh • {transaction.time}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SolarGeospatialAdmin;
