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

const EnergyProductionDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [realTimeData, setRealTimeData] = useState({
    currentProduction: 2.4,
    dailyProduction: 18.7,
    efficiency: 94.2,
    activeHomes: 186,
    weatherCondition: 'sunny'
  });
  const [isAnimating, setIsAnimating] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Sample data for charts
  const hourlyData = [
    { time: '06:00', production: 0.2, consumption: 0.8 },
    { time: '08:00', production: 1.5, consumption: 1.2 },
    { time: '10:00', production: 3.2, consumption: 1.5 },
    { time: '12:00', production: 4.8, consumption: 2.1 },
    { time: '14:00', production: 4.2, consumption: 1.9 },
    { time: '16:00', production: 3.1, consumption: 2.3 },
    { time: '18:00', production: 1.8, consumption: 3.2 },
    { time: '20:00', production: 0.3, consumption: 2.8 }
  ];

  const weeklyData = [
    { day: 'Mon', production: 45.2, storage: 12.3 },
    { day: 'Tue', production: 52.1, storage: 18.7 },
    { day: 'Wed', production: 38.9, storage: 8.2 },
    { day: 'Thu', production: 61.4, storage: 25.1 },
    { day: 'Fri', production: 55.8, storage: 21.4 },
    { day: 'Sat', production: 48.3, storage: 15.9 },
    { day: 'Sun', production: 59.2, storage: 23.6 }
  ];

  const panelStatusData = [
    { name: 'Active', value: 186, color: '#4caf50' },
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

  const alerts = [
    { id: 1, type: 'warning', title: 'Panel #156 Efficiency Drop', message: 'Efficiency dropped to 78%', time: '2 min ago' },
    { id: 2, type: 'info', title: 'Weather Update', message: 'Clouds expected this afternoon', time: '15 min ago' },
    { id: 3, type: 'success', title: 'New Record', message: 'Daily production record broken!', time: '1 hour ago' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (autoRefresh) {
        setRealTimeData(prev => ({
          ...prev,
          currentProduction: prev.currentProduction + (Math.random() - 0.5) * 0.2,
          efficiency: Math.max(85, Math.min(100, prev.efficiency + (Math.random() - 0.5) * 2))
        }));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

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
                Real-time monitoring of 200 family solar network
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
                onClick={() => setIsAnimating(!isAnimating)}
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
                          {realTimeData.currentProduction.toFixed(1)} MW
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <ElectricBoltIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={75} 
                      sx={{ 
                        mt: 2,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '& .MuiLinearProgress-bar': { bgcolor: 'white' }
                      }} 
                    />
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
                          {realTimeData.dailyProduction} MWh
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <SolarPowerIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <TrendingUpIcon sx={{ mr: 1, fontSize: 18 }} />
                      <Typography variant="body2">+12% from yesterday</Typography>
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',  height: 100 }}>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          System Efficiency
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {realTimeData.efficiency.toFixed(1)}%
                        </Typography>
                      </Box>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress
                          variant="determinate"
                          value={realTimeData.efficiency}
                          size={56}
                          thickness={4}
                          sx={{ color: 'white' }}
                        />
                        <Box sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <SpeedIcon sx={{ color: 'white' }} />
                        </Box>
                      </Box>
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
                          Active Homes
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {realTimeData.activeHomes}/200
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <HomeIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Box>
                    <Chip 
                      label="93% Online" 
                      size="small" 
                      sx={{ 
                        mt: 1, 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        fontWeight: 600
                      }} 
                    />
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
              <Tab label="System Status" icon={<EnergySavingsLeafIcon />} iconPosition="start" />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {tabValue === 0 && (
            <Fade in timeout={600}>
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <Card sx={{ mb: 3 }}>
                    <CardContent sx={{height:500}}v>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Hourly Production vs Consumption
                      </Typography>
                      <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={hourlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="time" stroke="#666" />
                          <YAxis stroke="#666" />
                          <RechartsTooltip 
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
                          <defs>
                            <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#4caf50" stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ff5722" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#ff5722" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} lg={4}>
                  <Card sx={{ mb: 3 }}>
                    <CardContent sx={{height:500}}>
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
                    <CardContent sx={{height:500}}>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Weekly Production & Storage Trends
                      </Typography>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="day" stroke="#666" />
                          <YAxis stroke="#666" />
                          <RechartsTooltip 
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
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} lg={4}>
                  <Card>
                    <CardContent sx={{height:500}}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Top Producers Today
                      </Typography>
                      <List>
                        {topProducers.map((producer, index) => (
                          <Grow key={producer.id} in timeout={400 + index * 100}>
                            <ListItem sx={{ px: 0 }}>
                              <ListItemAvatar>
                                <Avatar sx={{ 
                                  bgcolor: index === 0 ? '#ffd700' : '#e0e0e0',
                                  color: index === 0 ? '#000' : '#666'
                                }}>
                                  #{index + 1}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={producer.name}
                                secondary={
                                  <Box>
                                    <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                                      {producer.production} kWh
                                    </Typography>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={producer.efficiency} 
                                      sx={{ mt: 1, height: 6, borderRadius: 3 }}
                                    />
                                  </Box>
                                }
                              />
                            </ListItem>
                          </Grow>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Fade>
          )}

          {tabValue === 2 && (
            <Fade in timeout={600}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent sx={{height:500}}>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Panel Status Distribution
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={panelStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={100}
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
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent sx={{height:500}}>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        System Health Metrics
                      </Typography>
                      <Stack spacing={3}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Network Connectivity</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>98.5%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={98.5} sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                        
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Data Accuracy</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>99.2%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={99.2} sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                        
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">System Uptime</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>99.8%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={99.8} sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                        
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Blockchain Sync</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>96.7%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={96.7} sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                      </Stack>
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