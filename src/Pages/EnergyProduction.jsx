import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  CircularProgress,
  IconButton,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
  Tooltip,
  Fade,
  Grow,
  Slide,
  Paper,
  Stack
} from '@mui/material';
import {
  SolarPower as SolarPowerIcon,
  BatteryFull as BatteryFullIcon,
  TrendingUp as TrendingUpIcon,
  ElectricBolt as ElectricBoltIcon,
  Home as HomeIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
  WbSunny as WbSunnyIcon,
  Cloud as CloudIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  EnergySavingsLeaf as EnergySavingsLeafIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import energyService from '../services/energy.services';
import communityBatteryService from '../services/communityBatteryService';

const EnergyProductionDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [realTimeData, setRealTimeData] = useState({
    currentProduction: 0,
    dailyProduction: 0,
    efficiency: 0,
    activeHomes: 0,
    weatherCondition: 'sunny'
  });
  const [isAnimating, setIsAnimating] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(true);
  const [energyFlow, setEnergyFlow] = useState([]);
  const [productionData, setProductionData] = useState(null);
  const [tradeData, setTradeData] = useState(null);
  const [batteryData, setBatteryData] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        productionResponse,
        tradeResponse,
        flowResponse,
        batteryStatusResponse,
        batteryTransactionsResponse
      ] = await Promise.all([
        energyService.getTotalEnergyProduction('today'),
        energyService.getEnergyTradeToday(),
        energyService.getRealTimeEnergyFlow(),
        communityBatteryService.getBatteryStatus(),
        communityBatteryService.getAllTransactions({ limit: 5 })
      ]);

      const production = productionResponse.data;
      const trade = tradeResponse.data;
      const flow = flowResponse.data;
      const batteryStatus = batteryStatusResponse.data?.battery;
      const batteryTransactions = batteryTransactionsResponse.data?.transactions || [];

      // Update real-time data
      setRealTimeData({
        currentProduction: flow?.current?.production || 0,
        dailyProduction: production?.totalProduction || 0,
        efficiency: 94.2, // You can calculate this from your data
        activeHomes: production?.activeClients || 0,
        weatherCondition: 'sunny'
      });

      // Set energy flow data
      if (flow?.hourlyFlow) {
        setEnergyFlow(flow.hourlyFlow);
      }

      setProductionData(production);
      setTradeData(trade);
      setBatteryData(batteryStatus);
      setTransactions(batteryTransactions);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Sample data for charts (fallback when API data is not available)
  const hourlyData = energyFlow.length > 0 ? energyFlow : [
    { time: '06:00', production: 0.2, consumption: 0.8, trading: 0 },
    { time: '08:00', production: 1.5, consumption: 1.2, trading: 0.3 },
    { time: '10:00', production: 3.2, consumption: 1.5, trading: 1.2 },
    { time: '12:00', production: 4.8, consumption: 2.1, trading: 2.1 },
    { time: '14:00', production: 4.2, consumption: 1.9, trading: 1.8 },
    { time: '16:00', production: 3.1, consumption: 2.3, trading: 1.1 },
    { time: '18:00', production: 1.8, consumption: 3.2, trading: 0.5 },
    { time: '20:00', production: 0.3, consumption: 2.8, trading: 0 }
  ];

  const weeklyData = [
    { day: 'Mon', production: 45.2, storage: batteryData?.totalStoredKwh || 12.3 },
    { day: 'Tue', production: 52.1, storage: (batteryData?.totalStoredKwh || 0) + 6.4 },
    { day: 'Wed', production: 38.9, storage: (batteryData?.totalStoredKwh || 0) - 4.2 },
    { day: 'Thu', production: 61.4, storage: (batteryData?.totalStoredKwh || 0) + 12.9 },
    { day: 'Fri', production: 55.8, storage: (batteryData?.totalStoredKwh || 0) + 8.3 },
    { day: 'Sat', production: 48.3, storage: (batteryData?.totalStoredKwh || 0) + 3.6 },
    { day: 'Sun', production: 59.2, storage: (batteryData?.totalStoredKwh || 0) + 10.1 }
  ];

  const panelStatusData = [
    { name: 'Active', value: productionData?.activeClients || 186, color: '#4caf50' },
    { name: 'Maintenance', value: 8, color: '#ff9800' },
    { name: 'Offline', value: 6, color: '#f44336' }
  ];

  const topProducers = [
    { id: 1, name: 'Family #042', production: 12.4, efficiency: 98 },
    { id: 2, name: 'Family #138', production: 11.8, efficiency: 96 },
    { id: 3, name: 'Family #075', production: 11.2, efficiency: 95 },
    { id: 4, name: 'Family #201', production: 10.9, efficiency: 94 },
    { id: 5, name: 'Family #089', production: 10.6, efficiency: 93 }
  ];

  // Generate alerts from real data
  const generateAlerts = () => {
    const alerts = [];
    
    if (productionData && productionData.todayProduction < (productionData.totalProduction * 0.7)) {
      alerts.push({
        id: 1,
        type: 'warning',
        title: 'Low Production Today',
        message: `Today's production is ${productionData.todayProduction} kWh`,
        time: 'Recent'
      });
    }
    
    if (batteryData && batteryData.totalStoredKwh < 10) {
      alerts.push({
        id: 2,
        type: 'warning',
        title: 'Low Battery Storage',
        message: `Battery at ${batteryData.totalStoredKwh} kWh`,
        time: 'Recent'
      });
    }
    
    if (tradeData && tradeData.totalTraded > 50) {
      alerts.push({
        id: 3,
        type: 'success',
        title: 'High Trading Activity',
        message: `${tradeData.totalTraded} kWh traded today`,
        time: 'Recent'
      });
    }
    
    // Add default alerts if no real alerts
    if (alerts.length === 0) {
      alerts.push(
        {
          id: 1,
          type: 'info',
          title: 'System Normal',
          message: 'All systems operating optimally',
          time: 'Just now'
        },
        {
          id: 2,
          type: 'success',
          title: 'Good Production',
          message: `Daily production: ${productionData?.todayProduction || 0} kWh`,
          time: 'Today'
        }
      );
    }
    
    return alerts;
  };

  const alerts = generateAlerts();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getWeatherIcon = (condition) => {
    return condition === 'sunny' ? <WbSunnyIcon sx={{ color: '#ffa726' }} /> : <CloudIcon sx={{ color: '#90a4ae' }} />;
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'success': return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      default: return <ElectricBoltIcon sx={{ color: '#2196f3' }} />;
    }
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString('en-US', { 
      maximumFractionDigits: 1,
      minimumFractionDigits: 1 
    });
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Fade in timeout={800}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 1 }}>
                Energy Production Control Center
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', display: 'flex', alignItems: 'center', gap: 1 }}>
                {getWeatherIcon(realTimeData.weatherCondition)}
                Real-time monitoring of {productionData?.activeClients || 200} family solar network
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    color="primary"
                  />
                }
                label="Auto Refresh"
              />
              <IconButton
                onClick={fetchDashboardData}
                disabled={loading}
                sx={{ bgcolor: '#1976d2', color: 'white', '&:hover': { bgcolor: '#1565c0' } }}
              >
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Key Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Grow in timeout={600}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <CardContent sx={{height:150}}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          Current Production
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {loading ? '...' : `${formatNumber(realTimeData.currentProduction)} kW`}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                          {energyFlow?.current?.timestamp ? new Date(energyFlow.current.timestamp).toLocaleTimeString() : 'Live'}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <ElectricBoltIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>

            <Grid item xs={12} md={3}>
              <Grow in timeout={800}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white'
                }}>
                  <CardContent sx={{height:150}}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          Daily Production
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {loading ? '...' : `${formatNumber(realTimeData.dailyProduction)} kWh`}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <SolarPowerIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <TrendingUpIcon sx={{ mr: 1, fontSize: 18 }} />
                      <Typography variant="body2">
                        {productionData?.percentageChange ? `${productionData.percentageChange > 0 ? '+' : ''}${formatNumber(productionData.percentageChange)}% from yesterday` : '+12% from yesterday'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>

            <Grid item xs={12} md={3}>
              <Grow in timeout={1000}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white'
                }}>
                  <CardContent sx={{height:150}}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 100 }}>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          Battery Storage
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {loading ? '...' : `${formatNumber(batteryData?.totalStoredKwh || 0)} kWh`}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                          ${formatNumber(batteryData?.energyPricePerKwh || 0)}/kWh
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <BatteryFullIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>

            <Grid item xs={12} md={3}>
              <Grow in timeout={1200}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  color: 'white'
                }}>
                  <CardContent sx={{height:150}}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          Energy Traded Today
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {loading ? '...' : `${formatNumber(tradeData?.totalTraded || 0)} kWh`}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                          {tradeData?.transactionCount || 0} transactions
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <TrendingUpIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          </Grid>

          {/* Tabs for different views */}
          <Paper sx={{ mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTab-root': { fontWeight: 600 }
              }}
            >
              <Tab label="Real-time Monitoring" icon={<SpeedIcon />} iconPosition="start" />
              <Tab label="Production Analytics" icon={<TimelineIcon />} iconPosition="start" />
              <Tab label="Trading Activity" icon={<EnergySavingsLeafIcon />} iconPosition="start" />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {tabValue === 0 && (
            <Fade in timeout={600}>
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Real-time Energy Flow
                      </Typography>
                      {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
                          <CircularProgress />
                        </Box>
                      ) : (
                        <ResponsiveContainer width="100%" height={350}>
                          <AreaChart data={hourlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="time" stroke="#666" />
                            <YAxis stroke="#666" />
                            <RechartsTooltip 
                              formatter={(value, name) => {
                                const labels = {
                                  production: 'Production',
                                  consumption: 'Consumption',
                                  trading: 'Trading'
                                };
                                return [`${value} kW`, labels[name] || name];
                              }}
                              contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: '1px solid #e0e0e0',
                                borderRadius: 8
                              }} 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="production" 
                              stackId="1"
                              stroke="#4caf50" 
                              fill="url(#productionGradient)" 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="consumption" 
                              stackId="2"
                              stroke="#ff5722" 
                              fill="url(#consumptionGradient)" 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="trading" 
                              stackId="3"
                              stroke="#2196f3" 
                              fill="url(#tradingGradient)" 
                            />
                            <defs>
                              <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#4caf50" stopOpacity={0.1}/>
                              </linearGradient>
                              <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ff5722" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#ff5722" stopOpacity={0.1}/>
                              </linearGradient>
                              <linearGradient id="tradingGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#2196f3" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} lg={4}>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        System Alerts
                      </Typography>
                      <List>
                        {alerts.map((alert, index) => (
                          <Slide 
                            key={alert.id} 
                            direction="left" 
                            in 
                            timeout={300 + index * 200}
                          >
                            <ListItem sx={{ px: 0 }}>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'transparent' }}>
                                  {getAlertIcon(alert.type)}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={alert.title}
                                secondary={
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      {alert.message}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {alert.time}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          </Slide>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Fade>
          )}

          {tabValue === 1 && (
            <Fade in timeout={600}>
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Production & Storage Trends
                      </Typography>
                      {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
                          <CircularProgress />
                        </Box>
                      ) : (
                        <ResponsiveContainer width="100%" height={350}>
                          <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="day" stroke="#666" />
                            <YAxis stroke="#666" />
                            <RechartsTooltip 
                              formatter={(value, name) => {
                                const labels = {
                                  production: 'Production',
                                  storage: 'Battery Storage'
                                };
                                return [`${value} kWh`, labels[name] || name];
                              }}
                              contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: '1px solid #e0e0e0',
                                borderRadius: 8
                              }} 
                            />
                            <Bar dataKey="production" fill="#2196f3" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="storage" fill="#ff9800" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} lg={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        System Status
                      </Typography>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={panelStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {panelStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total Families: {productionData?.activeClients || 200}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Avg Production: {formatNumber(productionData?.averagePerClient || 0)} kWh/family
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Fade>
          )}

          {tabValue === 2 && (
            <Fade in timeout={600}>
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Trading Activity
                      </Typography>
                      {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
                          <CircularProgress />
                        </Box>
                      ) : tradeData?.hourlyFlow ? (
                        <ResponsiveContainer width="100%" height={350}>
                          <AreaChart data={tradeData.hourlyFlow}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="time" stroke="#666" />
                            <YAxis stroke="#666" />
                            <RechartsTooltip 
                              formatter={(value, name) => {
                                const labels = {
                                  deposits: 'Deposits',
                                  releases: 'Releases',
                                  netFlow: 'Net Flow'
                                };
                                return [`${value} kWh`, labels[name] || name];
                              }}
                              contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: '1px solid #e0e0e0',
                                borderRadius: 8
                              }} 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="deposits" 
                              stackId="1"
                              stroke="#4caf50" 
                              fill="#4caf50"
                              fillOpacity={0.6}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="releases" 
                              stackId="2"
                              stroke="#ff5722" 
                              fill="#ff5722"
                              fillOpacity={0.6}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
                          <Typography color="text.secondary">No trading data available</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} lg={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Recent Transactions
                      </Typography>
                      <List>
                        {transactions.length > 0 ? (
                          transactions.map((transaction, index) => (
                            <Grow key={transaction.id || index} in timeout={400 + index * 100}>
                              <ListItem sx={{ px: 0 }}>
                                <ListItemAvatar>
                                  <Avatar sx={{ 
                                    bgcolor: transaction.type === 'deposit' ? '#4caf50' : '#2196f3'
                                  }}>
                                    {transaction.type === 'deposit' ? '+' : '-'}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={`${transaction.amountKwh} kWh`}
                                  secondary={
                                    <Box>
                                      <Typography variant="body2" color="text.secondary">
                                        {transaction.client?.firstName ? `${transaction.client.firstName} ${transaction.client.lastName}` : 'Anonymous User'}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {new Date(transaction.timestamp).toLocaleTimeString()}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </ListItem>
                            </Grow>
                          ))
                        ) : (
                          <Typography color="text.secondary" textAlign="center" py={3}>
                            No recent transactions
                          </Typography>
                        )}
                      </List>
                      {tradeData && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Total Traded: {formatNumber(tradeData.totalTraded)} kWh
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Market Price: ${formatNumber(tradeData.currentPrice)}/kWh
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Fade>
          )}
        </Box>
      </Fade>
    </Box>
  );
};

export default EnergyProductionDashboard;