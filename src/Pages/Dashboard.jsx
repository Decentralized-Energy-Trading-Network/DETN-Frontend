import React, { useState } from 'react';
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
} from '@mui/material';
import {
  SolarPower as SolarPowerIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Group as GroupIcon,
  AccountBalanceWallet as WalletIcon,
  FlashOn as EnergyIcon,
  SwapHoriz as TradeIcon,
} from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Sample data
  const energyData = [
    { time: '06:00', production: 0, consumption: 12, trading: 0 },
    { time: '08:00', production: 45, consumption: 18, trading: 15 },
    { time: '10:00', production: 78, consumption: 22, trading: 35 },
    { time: '12:00', production: 95, consumption: 28, trading: 45 },
    { time: '14:00', production: 88, consumption: 25, trading: 38 },
    { time: '16:00', production: 65, consumption: 30, trading: 25 },
    { time: '18:00', production: 25, consumption: 45, trading: 8 },
    { time: '20:00', production: 0, consumption: 38, trading: 0 },
  ];

  const communityStats = [
    { name: 'Active Producers', value: 45 },
    { name: 'Energy Consumers', value: 32 },
    { name: 'Inactive', value: 23 },
  ];

  const COLORS = ['#4CAF50', '#2196F3', '#FF9800'];

  const StatCard = ({ title, value, change, icon, color }) => (
    <Card 
      sx={{ 
        height: '100%', 
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${color}25`
        }
      }}
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
                {change.startsWith('+') ? (
                  <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                )}
                <Typography 
                  variant="body2" 
                  color={change.startsWith('+') ? 'success.main' : 'error.main'}
                >
                  {change}% vs last month
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    
    <Container maxWidth="xl" sx={{ py: 0 }}>
      <Box sx={{ p: 3, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Solar Energy Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Community Overview - 200 Families Connected
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Energy Production"
            value="2,847 kWh"
            change="+12.5"
            icon={<SolarPowerIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Energy Traded Today"
            value="1,234 kWh"
            change="+8.2"
            icon={<TradeIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Community Revenue"
            value="$5,847"
            change="+15.3"
            icon={<WalletIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value="187/200"
            change="+2.1"
            icon={<GroupIcon />}
            color={theme.palette.info.main}
          />
        </Grid>
      </Grid>

      {/* Main Charts Row */}
      <Grid container spacing={3} >
        {/* Energy Flow Chart */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ height: 500 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Real-time Energy Flow
                </Typography>
                <Box display="flex" gap={2}>
                  <Chip label="Production" color="warning" size="small" />
                  <Chip label="Consumption" color="error" size="small" />
                  <Chip label="Trading" color="primary" size="small" />
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={energyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="production" stackId="1" stroke="#FF9800" fill="#FF980030" />
                  <Area type="monotone" dataKey="consumption" stackId="2" stroke="#F44336" fill="#F4433630" />
                  <Area type="monotone" dataKey="trading" stackId="3" stroke="#2196F3" fill="#2196F330" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Community Distribution */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ height: 500 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Community Status
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={communityStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {communityStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;