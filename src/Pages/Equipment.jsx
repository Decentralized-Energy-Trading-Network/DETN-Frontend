import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Paper,
} from "@mui/material";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend // Optional, if you want to add legend later
} from 'recharts';

const EquipmentStatus = () => {
  // Mock data - you can replace this with actual data from your backend
  const batteryData = {
    level: 85,
    capacity: "500 kWh",
    currentCharge: "425 kWh",
    status: "Optimal",
    temperature: "28°C",
    voltage: "480V",
    cycles: 1250,
    health: "Excellent",
  };

  const systemMetrics = [
    { label: "Battery Capacity", value: batteryData.capacity },
    { label: "Current Charge", value: batteryData.currentCharge },
    { label: "Temperature", value: batteryData.temperature },
    { label: "Voltage", value: batteryData.voltage },
    { label: "Charge Cycles", value: batteryData.cycles },
    { label: "Health Status", value: batteryData.status },
  ];

  const getBatteryColor = (level) => {
    if (level >= 70) return "success";
    if (level >= 30) return "warning";
    return "error";
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" component="h1" gutterBottom>
        Equipment Status
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Real-time monitoring of main battery system and equipment health
      </Typography>

      <Grid container spacing={3}>
        {/* Main Battery Status Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Main Battery System
              </Typography>

              {/* Battery Level */}
              <Box sx={{ mb: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body1">Battery Level</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {batteryData.level}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={batteryData.level}
                  color={getBatteryColor(batteryData.level)}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "action.hover",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 6,
                    },
                  }}
                />
              </Box>

              {/* System Metrics Grid */}
              <Grid container spacing={2}>
                {systemMetrics.map((metric, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        textAlign: "center",
                        borderWidth: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {metric.label}
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {metric.value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* System Status Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                System Overview
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Overall System Status
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color:
                      batteryData.health === "Excellent"
                        ? "success.main"
                        : batteryData.health === "Good"
                        ? "warning.main"
                        : "error.main",
                  }}
                >
                  {batteryData.health}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Active Houses
                </Typography>
                <Typography variant="h6">198/200</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Last Update
                </Typography>
                <Typography variant="body2">
                  {new Date().toLocaleTimeString()}
                </Typography>
              </Box>

              {/* Status Indicators */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Component Status
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {[
                    "Inverter",
                    "Charge Controller",
                    "Monitoring System",
                    "Safety Systems",
                  ].map((component) => (
                    <Box
                      key={component}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "success.main",
                        }}
                      />
                      <Typography variant="body2">{component}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Historical Data & Trends */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Battery Performance Trends
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last 7 days efficiency: 94.2% • Peak performance maintained
              </Typography>

              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={[
                    {
                      day: "Mon",
                      efficiency: 92,
                      chargeRate: 85,
                      dischargeRate: 78,
                      temperature: 25,
                    },
                    {
                      day: "Tue",
                      efficiency: 94,
                      chargeRate: 88,
                      dischargeRate: 82,
                      temperature: 26,
                    },
                    {
                      day: "Wed",
                      efficiency: 95,
                      chargeRate: 90,
                      dischargeRate: 85,
                      temperature: 27,
                    },
                    {
                      day: "Thu",
                      efficiency: 93,
                      chargeRate: 87,
                      dischargeRate: 80,
                      temperature: 25,
                    },
                    {
                      day: "Fri",
                      efficiency: 96,
                      chargeRate: 92,
                      dischargeRate: 88,
                      temperature: 28,
                    },
                    {
                      day: "Sat",
                      efficiency: 94,
                      chargeRate: 89,
                      dischargeRate: 83,
                      temperature: 26,
                    },
                    {
                      day: "Sun",
                      efficiency: 95,
                      chargeRate: 91,
                      dischargeRate: 86,
                      temperature: 27,
                    },
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="efficiencyGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="chargeGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="dischargeGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ffc658" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    domain={[70, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      const labels = {
                        efficiency: "Efficiency",
                        chargeRate: "Charge Rate",
                        dischargeRate: "Discharge Rate",
                        temperature: "Temperature",
                      };
                      return [
                        name === "temperature" ? `${value}°C` : `${value}%`,
                        labels[name],
                      ];
                    }}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#efficiencyGradient)"
                    name="Efficiency"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="chargeRate"
                    stroke="#82ca9d"
                    fillOpacity={1}
                    fill="url(#chargeGradient)"
                    name="Charge Rate"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="dischargeRate"
                    stroke="#ffc658"
                    fillOpacity={1}
                    fill="url(#dischargeGradient)"
                    name="Discharge Rate"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>

              {/* Performance metrics summary */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 2,
                  pt: 2,
                  borderTop: 1,
                  borderColor: "divider",
                }}
              >
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Avg Efficiency
                  </Typography>
                  <Typography variant="h6" color="#8884d8" fontWeight="bold">
                    94.1%
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Peak Charge
                  </Typography>
                  <Typography variant="h6" color="#82ca9d" fontWeight="bold">
                    92%
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Avg Discharge
                  </Typography>
                  <Typography variant="h6" color="#ffc658" fontWeight="bold">
                    83.1%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EquipmentStatus;
