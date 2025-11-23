import React, { useState, useEffect, useRef } from 'react';
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
  Divider
} from '@mui/material';
import {
  Home,
  Factory,
  Battery4Bar,
  TrendingUp,
  TrendingDown,
  Refresh,
  CheckCircle,
  ZoomIn,
  ZoomOut,
  FitScreen
} from '@mui/icons-material';

const Map = () => {
  // View controls
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Display controls
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [showEnergyFlow, setShowEnergyFlow] = useState(true);
  const [showProduction, setShowProduction] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  // Generate mock data for 200+ buildings
  const generateBuildings = () => {
    const buildings = [];
    const types = ['house', 'factory'];
    
    // Generate houses (180)
    for (let i = 0; i < 180; i++) {
      const x = Math.random() * 90 + 5;
      const y = Math.random() * 50 + 5;
      const production = Math.random() * 20;
      const consumption = Math.random() * 15;
      
      buildings.push({
        id: `house-${i}`,
        type: 'house',
        x,
        y,
        production,
        consumption,
        status: Math.random() > 0.05 ? 'active' : 'maintenance',
        panels: Math.floor(Math.random() * 8) + 2,
        family: `Family-${i}`
      });
    }
    
    // Generate factories (20)
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 90 + 5;
      const y = Math.random() * 50 + 5;
      const production = Math.random() * 200 + 50;
      const consumption = Math.random() * 250 + 100;
      
      buildings.push({
        id: `factory-${i}`,
        type: 'factory',
        x,
        y,
        production,
        consumption,
        status: Math.random() > 0.1 ? 'active' : 'maintenance',
        panels: Math.floor(Math.random() * 60) + 20,
        name: `Factory-${i}`
      });
    }
    
    // Add battery storage
    buildings.push({
      id: 'battery-1',
      type: 'battery',
      x: 50,
      y: 30,
      capacity: 2000,
      currentLevel: 1500,
      status: 'active'
    });
    
    return buildings;
  };

  const [buildings, setBuildings] = useState(generateBuildings());
  const [communityData, setCommunityData] = useState({
    totalProduction: 0,
    totalConsumption: 0,
    batteryLevel: 0,
    activeHouses: 0,
    totalHouses: 180,
    factories: 20,
    transactions: 0
  });

  // Calculate community stats
  useEffect(() => {
    const activeHouses = buildings.filter(b => b.type === 'house' && b.status === 'active').length;
    const totalProduction = buildings.reduce((sum, b) => sum + b.production, 0);
    const totalConsumption = buildings.reduce((sum, b) => sum + b.consumption, 0);
    const battery = buildings.find(b => b.type === 'battery');
    
    setCommunityData({
      totalProduction,
      totalConsumption,
      batteryLevel: battery ? (battery.currentLevel / battery.capacity) * 100 : 0,
      activeHouses,
      totalHouses: 180,
      factories: 20,
      transactions: Math.floor(totalProduction / 10)
    });
  }, [buildings]);

  // Animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationProgress(prev => (prev >= 100 ? 0 : prev + 2));
      
      // Simulate small changes in energy production/consumption
      setBuildings(prev => prev.map(b => {
        if (b.type === 'battery') {
          // Simulate battery charging/discharging
          const change = (Math.random() - 0.45) * 10;
          return {
            ...b,
            currentLevel: Math.max(0, Math.min(b.capacity, b.currentLevel + change))
          };
        }
        return {
          ...b,
          production: Math.max(0, b.production + (Math.random() - 0.4) * 0.5),
          consumption: Math.max(0, b.consumption + (Math.random() - 0.4) * 0.3)
        };
      }));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // View control handlers
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(3, Math.max(0.3, prev * delta)));
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left mouse button
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan(prev => ({
      x: prev.x + (e.clientX - dragStart.x) / zoom,
      y: prev.y + (e.clientY - dragStart.y) / zoom
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const zoomIn = () => setZoom(prev => Math.min(3, prev * 1.2));
  const zoomOut = () => setZoom(prev => Math.max(0.3, prev * 0.8));

  // Energy flow calculations
  const getEnergyBalance = (building) => {
    return building.production - building.consumption;
  };

  const getEnergyFlowColor = (balance) => {
    if (balance > 0) return '#4caf50'; // Green for surplus
    if (balance < 0) return '#f44336'; // Red for deficit
    return '#ff9800'; // Orange for balanced
  };

  const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  const getDashOffset = (distance) => {
    return animationProgress * (distance / 100);
  };

  const getBuildingIcon = (type, status) => {
    const iconProps = { fontSize: 'large' };
    if (type === 'house') return <Home {...iconProps} sx={{ color: status === 'active' ? '#4caf50' : '#ff9800' }} />;
    if (type === 'factory') return <Factory {...iconProps} sx={{ color: status === 'active' ? '#2196f3' : '#ff9800' }} />;
    if (type === 'battery') return <Battery4Bar {...iconProps} sx={{ color: '#ff9800' }} />;
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header and controls... (keep your existing header and controls code) */}

      <Grid container spacing={3}>
        {/* Stats Cards... (keep your existing stats cards code) */}

        {/* Map View */}
        <Grid item xs={12} lg={8}>
        
            
             
              <Box>
                <Tooltip title="Zoom In">
                  <IconButton onClick={zoomIn} size="small">
                    <ZoomIn />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Zoom Out">
                  <IconButton onClick={zoomOut} size="small">
                    <ZoomOut />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reset View">
                  <IconButton onClick={resetView} size="small">
                    <FitScreen />
                  </IconButton>
                </Tooltip>
              </Box>
            
            
            <Box 
              sx={{ 
                height: 'calc(100% - 60px)', 
                position: 'relative',
                cursor: isDragging ? 'grabbing' : 'grab',
                overflow: 'hidden'
              }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              ref={svgRef}
            >
              <svg
                width="100%"
                height="100%"
                viewBox={`${pan.x} ${pan.y} ${100/zoom} ${60/zoom}`}
                style={{ backgroundColor: '#e8f5e8' }}
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width={10/zoom} height={10/zoom} patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#ccc" strokeWidth={0.5/zoom} opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Roads */}
                <line x1="0" y1="30" x2="100" y2="30" stroke="#666" strokeWidth={1.5/zoom} strokeDasharray={`${5/zoom},${5/zoom}`} />
                <line x1="50" y1="0" x2="50" y2="60" stroke="#666" strokeWidth={1.5/zoom} strokeDasharray={`${5/zoom},${5/zoom}`} />
                
                {/* Energy flow lines */}
                {showEnergyFlow && buildings.map((building) => {
                  const battery = buildings.find(b => b.type === 'battery');
                  if (!battery) return null;
                  
                  const balance = getEnergyBalance(building);
                  const distance = calculateDistance(building.x, building.y, battery.x, battery.y);
                  const strokeColor = getEnergyFlowColor(balance);
                  const strokeWidth = Math.min(3, Math.max(1, Math.abs(balance) / (building.type === 'factory' ? 20 : 5))) / zoom;
                  
                  // Only show flows that are significant
                  if (Math.abs(balance) < 0.5) return null;
                  
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
                        strokeDasharray={`${5/zoom},${5/zoom}`}
                        strokeDashoffset={getDashOffset(distance)}
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          values={`${distance};0`}
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </line>
                    </g>
                  );
                })}
                
                {/* Battery to consumers (houses/factories with deficit) */}
                {showEnergyFlow && buildings.map((building) => {
                  if (building.type === 'battery') return null;
                  
                  const balance = getEnergyBalance(building);
                  const battery = buildings.find(b => b.type === 'battery');
                  if (!battery || balance >= 0) return null;
                  
                  const distance = calculateDistance(battery.x, battery.y, building.x, building.y);
                  const strokeColor = '#9c27b0'; // Purple for battery supply
                  const strokeWidth = Math.min(3, Math.max(1, Math.abs(balance) / 5)) / zoom;
                  
                  return (
                    <g key={`battery-flow-${building.id}`}>
                      {/* Base line (faint) */}
                      <line
                        x1={battery.x}
                        y1={battery.y}
                        x2={building.x}
                        y2={building.y}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        opacity="0.2"
                      />
                      
                      {/* Animated line */}
                      <line
                        x1={battery.x}
                        y1={battery.y}
                        x2={building.x}
                        y2={building.y}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        opacity="0.8"
                        strokeDasharray={`${5/zoom},${5/zoom}`}
                        strokeDashoffset={getDashOffset(distance)}
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          values={`${distance};0`}
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </line>
                    </g>
                  );
                })}
                
                {/* Buildings */}
                {buildings.map((building) => {
                  const isSelected = selectedBuilding?.id === building.id;
                  const size = building.type === 'factory' ? 4/zoom : 
                              building.type === 'battery' ? 5/zoom : 3/zoom;
                  
                  return (
                    <g 
                      key={building.id} 
                      onClick={() => setSelectedBuilding(building)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        cx={building.x}
                        cy={building.y}
                        r={size}
                        fill={
                          building.type === 'house' ? '#4caf50' : 
                          building.type === 'factory' ? '#2196f3' : '#ff9800'
                        }
                        stroke="#fff"
                        strokeWidth={isSelected ? 2/zoom : 1/zoom}
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
                        {building.type === 'house' ? 'H' : 
                         building.type === 'factory' ? 'F' : 'B'}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </Box>
          
        </Grid>

        {/* Building Details and Recent Transactions... (keep your existing code for these sections) */}
      </Grid>
    </Box>
  );
};

export default Map;