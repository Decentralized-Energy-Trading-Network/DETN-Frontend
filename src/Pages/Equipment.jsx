import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Paper
} from '@mui/material';

const EquipmentStatus = () => {
  // Mock data - you can replace this with actual data from your backend
  const batteryData = {
    level: 85,
    capacity: '500 kWh',
    currentCharge: '425 kWh',
    status: 'Optimal',
    temperature: '28°C',
    voltage: '480V',
    cycles: 1250,
    health: 'Excellent'
  };

  const systemMetrics = [
    { label: 'Battery Capacity', value: batteryData.capacity },
    { label: 'Current Charge', value: batteryData.currentCharge },
    { label: 'Temperature', value: batteryData.temperature },
    { label: 'Voltage', value: batteryData.voltage },
    { label: 'Charge Cycles', value: batteryData.cycles },
    { label: 'Health Status', value: batteryData.status }
  ];

  const getBatteryColor = (level) => {
    if (level >= 70) return 'success';
    if (level >= 30) return 'warning';
    return 'error';
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
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
                    backgroundColor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 6,
                    }
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
                        textAlign: 'center',
                        borderWidth: 1
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
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
                    color: batteryData.health === 'Excellent' ? 'success.main' : 
                          batteryData.health === 'Good' ? 'warning.main' : 'error.main'
                  }}
                >
                  {batteryData.health}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Active Houses
                </Typography>
                <Typography variant="h6">
                  198/200
                </Typography>
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {['Inverter', 'Charge Controller', 'Monitoring System', 'Safety Systems'].map((component) => (
                    <Box key={component} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'success.main'
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
              {/* Placeholder for charts - you can add charts here later */}
              <Box 
                sx={{ 
                  height: 200, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mt: 2
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Battery Performance Chart - Integrate with charting library
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EquipmentStatus;