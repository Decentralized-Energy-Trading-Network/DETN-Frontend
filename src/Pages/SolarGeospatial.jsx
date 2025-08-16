import React, { useState, useEffect } from 'react';
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
  Badge,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Home,
  Factory,
  ElectricBolt,
  Battery4Bar,
  TrendingUp,
  TrendingDown,
  Refresh,
  FilterList,
  Visibility,
  VisibilityOff,
  Warning,
  CheckCircle
} from '@mui/icons-material';

const SolarGeospatialAdmin = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [showEnergyFlow, setShowEnergyFlow] = useState(true);
  const [showProduction, setShowProduction] = useState(true);
  const [showConsumption, setShowConsumption] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Mock data for community
  const [communityData, setCommunityData] = useState({
    totalProduction: 45670, // kWh
    totalConsumption: 38920, // kWh
    batteryLevel: 85, // %
    activeHouses: 198,
    totalHouses: 200,
    factories: 3,
    transactions: 1247
  });

  // Mock buildings data with better positions
  const [buildings, setBuildings] = useState([
    { id: 1, type: 'house', x: 15, y: 20, production: 12.5, consumption: 8.2, status: 'active', panels: 4, family: 'Johnson' },
    { id: 2, type: 'house', x: 25, y: 25, production: 15.2, consumption: 9.8, status: 'active', panels: 6, family: 'Smith' },
    { id: 3, type: 'house', x: 35, y: 15, production: 0, consumption: 7.5, status: 'maintenance', panels: 3, family: 'Brown' },
    { id: 4, type: 'factory', x: 70, y: 30, production: 180.5, consumption: 220.3, status: 'active', panels: 50, name: 'Solar Tech' },
    { id: 5, type: 'house', x: 20, y: 35, production: 18.7, consumption: 12.1, status: 'active', panels: 8, family: 'Davis' },
    { id: 6, type: 'house', x: 40, y: 25, production: 11.8, consumption: 8.9, status: 'active', panels: 4, family: 'Wilson' },
    { id: 7, type: 'factory', x: 60, y: 45, production: 95.2, consumption: 145.8, status: 'active', panels: 25, name: 'Green Mfg' },
    { id: 8, type: 'house', x: 30, y: 40, production: 16.3, consumption: 10.5, status: 'active', panels: 6, family: 'Garcia' },
    { id: 9, type: 'house', x: 45, y: 20, production: 13.9, consumption: 9.2, status: 'active', panels: 5, family: 'Martinez' },
    { id: 10, type: 'factory', x: 50, y: 50, production: 210.8, consumption: 195.4, status: 'active', panels: 60, name: 'Eco Solutions' },
    { id: 11, type: 'battery', x: 80, y: 20, capacity: 500, currentLevel: 425, status: 'charging' }
  ]);

  // Animation effect for energy flow
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationProgress((prev) => (prev >= 100 ? 0 : prev + 5));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const getBuildingIcon = (type, status) => {
    const iconProps = { fontSize: 'large' };
    
    if (type === 'house') {
      return <Home {...iconProps} sx={{ color: status === 'active' ? '#4caf50' : '#ff9800' }} />;
    } else if (type === 'factory') {
      return <Factory {...iconProps} sx={{ color: status === 'active' ? '#2196f3' : '#ff9800' }} />;
    } else if (type === 'battery') {
      return <Battery4Bar {...iconProps} sx={{ color: status === 'charging' ? '#4caf50' : '#ff5722' }} />;
    }
  };

  const getEnergyBalance = (building) => {
    const balance = building.production - building.consumption;
    return balance;
  };

  const getEnergyFlowColor = (balance) => {
    if (balance > 0) return '#4caf50'; // Green for surplus
    if (balance < 0) return '#f44336'; // Red for deficit
    return '#ff9800'; // Orange for balanced
  };

  const handleBuildingClick = (building) => {
    setSelectedBuilding(building);
  };

  const refreshData = () => {
    // Simulate data refresh
    setCommunityData(prev => ({
      ...prev,
      totalProduction: prev.totalProduction + Math.random() * 100 - 50,
      totalConsumption: prev.totalConsumption + Math.random() * 80 - 40,
      batteryLevel: Math.min(100, Math.max(0, prev.batteryLevel + Math.random() * 10 - 5)),
      transactions: prev.transactions + Math.floor(Math.random() * 5)
    }));
  };

  // Calculate animated dash offset for energy flow lines
  const getDashOffset = (distance) => {
    return animationProgress * (distance / 100);
  };

  // Calculate distance between two points for animation
  const calculateDistance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
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
              <IconButton onClick={refreshData} color="primary">
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
                  <Typography variant="h5" component="div" sx={{ color: '#4caf50' }}>
                    {communityData.totalProduction.toFixed(1)} kWh
                  </Typography>
                  <Chip
                    icon={<TrendingUp />}
                    label="+12.5%"
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
                  <Typography variant="h5" component="div" sx={{ color: '#f44336' }}>
                    {communityData.totalConsumption.toFixed(1)} kWh
                  </Typography>
                  <Chip
                    icon={<TrendingDown />}
                    label="-3.2%"
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
                  <Typography variant="h5" component="div" sx={{ color: '#2196f3' }}>
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
                    Active Houses
                  </Typography>
                  <Typography variant="h5" component="div">
                    {communityData.activeHouses}/{communityData.totalHouses}
                  </Typography>
                  <Chip
                    icon={<CheckCircle />}
                    label="99% Uptime"
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
          <Paper sx={{ height: 600, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Community Map</Typography>
            </Box>
            
            {/* Enhanced SVG Map */}
            <Box sx={{ height: 'calc(100% - 60px)', position: 'relative' }}>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 60"
                style={{ backgroundColor: '#e8f5e8' }}
              >
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#ccc" strokeWidth="0.5" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Main roads */}
                <line x1="0" y1="30" x2="100" y2="30" stroke="#666" strokeWidth="1.5" strokeDasharray="5,5" />
                <line x1="50" y1="0" x2="50" y2="60" stroke="#666" strokeWidth="1.5" strokeDasharray="5,5" />
                
                {/* Energy flow lines - animated */}
                {showEnergyFlow && buildings.map((building) => {
                  if (building.type === 'battery') return null;
                  const balance = getEnergyBalance(building);
                  const battery = buildings.find(b => b.type === 'battery');
                  if (!battery || balance === 0) return null;
                  
                  const distance = calculateDistance(building.x, building.y, battery.x, battery.y);
                  const strokeColor = getEnergyFlowColor(balance);
                  const strokeWidth = Math.min(3, Math.max(1, Math.abs(balance) / 5));
                  
                  return (
                    <g key={`flow-${building.id}`}>
                      {/* Base line (faint) */}
                      <line
                        x1={building.x}
                        y1={building.y}
                        x2={battery.x}
                        y2={battery.y}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        opacity="0.2"
                      />
                      
                      {/* Animated line */}
                      <line
                        x1={building.x}
                        y1={building.y}
                        x2={battery.x}
                        y2={battery.y}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        opacity="0.8"
                        strokeDasharray="5,5"
                        strokeDashoffset={getDashOffset(distance)}
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          values={`${distance};0`}
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </line>
                      
                      {/* Arrow head */}
                      {animationProgress > 90 && (
                        <polygon
                          points={`${battery.x-1},${battery.y-2} ${battery.x+1},${battery.y} ${battery.x-1},${battery.y+2}`}
                          fill={strokeColor}
                          opacity="0.8"
                        />
                      )}
                    </g>
                  );
                })}
                
                {/* Buildings with better visualization */}
                {buildings.map((building) => {
                  const balance = getEnergyBalance(building);
                  const isSelected = selectedBuilding?.id === building.id;
                  const size = building.type === 'factory' ? 4 : building.type === 'battery' ? 5 : 3;
                  
                  return (
                    <g key={building.id} onClick={() => handleBuildingClick(building)} style={{ cursor: 'pointer' }}>
                      {/* Building base */}
                      <circle
                        cx={building.x}
                        cy={building.y}
                        r={size}
                        fill={
                          building.type === 'house' ? '#4caf50' : 
                          building.type === 'factory' ? '#2196f3' : '#ff9800'
                        }
                        stroke="#fff"
                        strokeWidth={isSelected ? 2 : 1}
                        opacity={building.status === 'active' ? 1 : 0.7}
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
                        {building.type === 'house' ? 'H' : building.type === 'factory' ? 'F' : 'B'}
                      </text>
                      
                      {/* Status indicator */}
                      {building.status !== 'active' && (
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
                      {showProduction && building.production > 0 && (
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
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                {buildings.map((building) => (
                  <Box
                    key={`label-${building.id}`}
                    sx={{
                      position: 'absolute',
                      left: `${building.x}%`,
                      top: `${building.y}%`,
                      transform: 'translate(-50%, -150%)',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      border: '1px solid #ddd',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      display: selectedBuilding?.id === building.id ? 'block' : 'none'
                    }}
                  >
                    {building.type === 'house' ? building.family : building.name}
                    <Box 
                      sx={{
                        position: 'absolute',
                        bottom: -5,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderTop: '5px solid rgba(255,255,255,0.9)'
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Building Details */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ height: 600, overflow: 'auto' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">
                {selectedBuilding ? 'Building Details' : 'Select a Building'}
              </Typography>
            </Box>
            
            {selectedBuilding ? (
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getBuildingIcon(selectedBuilding.type, selectedBuilding.status)}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6">
                      {selectedBuilding.type === 'house' ? selectedBuilding.family : selectedBuilding.name}
                    </Typography>
                    <Chip
                      label={selectedBuilding.status}
                      color={selectedBuilding.status === 'active' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Production Today
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#4caf50' }}>
                      {selectedBuilding.production} kWh
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Consumption Today
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#f44336' }}>
                      {selectedBuilding.consumption} kWh
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Energy Balance
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ color: getEnergyFlowColor(getEnergyBalance(selectedBuilding)) }}
                    >
                      {getEnergyBalance(selectedBuilding) > 0 ? '+' : ''}{getEnergyBalance(selectedBuilding).toFixed(1)} kWh
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {selectedBuilding.type === 'battery' ? 'Capacity' : 'Solar Panels'}
                    </Typography>
                    <Typography variant="h6">
                      {selectedBuilding.panels || selectedBuilding.capacity || 'N/A'}
                      {selectedBuilding.type === 'battery' ? ' kWh' : ''}
                    </Typography>
                  </Grid>
                </Grid>
                
                {selectedBuilding.type === 'battery' && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Battery Level
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(selectedBuilding.currentLevel / selectedBuilding.capacity) * 100}
                      sx={{ mt: 1, mb: 1, height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="body2">
                      {selectedBuilding.currentLevel} / {selectedBuilding.capacity} kWh
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                <Typography>Click on a building in the map to view details</Typography>
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
              {[
                { from: 'Johnson House', to: 'Community Battery', amount: 5.2, time: '2 min ago' },
                { from: 'Solar Tech', to: 'Community Battery', amount: 45.8, time: '5 min ago' },
                { from: 'Community Battery', to: 'Brown House', amount: 3.1, time: '8 min ago' },
                { from: 'Davis House', to: 'Community Battery', amount: 8.7, time: '12 min ago' },
                { from: 'Eco Solutions', to: 'Community Battery', amount: 32.4, time: '15 min ago' }
              ].map((transaction, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined" sx={{ p: 1 }}>
                    <Typography variant="body2" noWrap>
                      <strong>{transaction.from}</strong> → {transaction.to}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {transaction.amount} kWh • {transaction.time}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SolarGeospatialAdmin;