// Layout/Clients/ClientLayout.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Button,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  Sell,
  ShoppingCart,
  AccountBalanceWallet,
  History,
  Logout,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import energyService from "../services/energy.services";
import { showToast } from "../utils/toast";
import { updateEnergyBalance } from "../store/auth";

const drawerWidth = 240;

const ClientLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth?.user?._id);
  const walletAddress = useSelector((state) => state.auth?.user?.walletAddress);
  const energyBalance = useSelector(
    (state) => state.auth?.user?.energyBalance || 0
  );

  const [energyData, setEnergyData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Hardcoded price per KWh (USD)
  const PRICE_PER_KWH = 4;

  const energyWorth = energyBalance * PRICE_PER_KWH;
  const formattedWorth = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(energyWorth);

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/clients/marketplace" },
    { text: "Sell Energy", icon: <Sell />, path: "/clients/sell" },
    { text: "Buy Energy", icon: <ShoppingCart />, path: "/clients/buy" },
    { text: "Wallet", icon: <AccountBalanceWallet />, path: "/clients/wallet" },
    {
      text: "Transaction History",
      icon: <History />,
      path: "/clients/transactions",
    },
  ];

  // Fetch energy data for the client
  const fetchEnergyData = async () => {
    if (!user) {
      console.log("No user found, skipping energy data fetch");
      return;
    }

    try {
      console.log("Fetching energy data for user:", user);
      const response = await energyService.getMyEnergy(user, { limit: 30 });
      console.log("Energy API response:", response);

      if (response.status === "success") {
        setEnergyData(response.data);
      }
    } catch (error) {
      console.error("Error fetching energy data:", error);
      // Don't show toast for fetch errors to avoid annoying users
    }
  };

  // Generate energy (called every 10 minutes)
  const generateEnergy = async () => {
    if (!user || isGenerating) return;

    setIsGenerating(true);
    try {
      // Generate energy for this interval
      const response = await energyService.addMyEnergy(); // no manualProduction needed

      if (response.status === "success") {
        const newEnergyBalance = response.data?.client?.energyBalance;
        const addedProduction =
          response.data?.energyRecord?.dailyProductionKwh || 0;

        if (newEnergyBalance !== undefined) {
          dispatch(updateEnergyBalance(newEnergyBalance));
        }

        const formattedProduction =
          addedProduction >= 1
            ? addedProduction.toFixed(2)
            : addedProduction.toFixed(6);

        showToast.success(`⚡ ${response?.data?.producedKwh} kWh generated!`);
        await fetchEnergyData();
      } else {
        showToast.error("Failed to generate energy");
      }
    } catch (error) {
      console.error("Energy generation error:", error);
      showToast.error(error?.message || "Failed to generate energy");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    let energyGenerationInterval;
    let dataRefreshInterval;

    console.log("ClientLayout mounted, user:", user);

    // Initial data load (fetch only, don't generate energy yet)
    const initialize = async () => {
      if (user) {
        console.log("Initializing energy system for user:", user);
        await fetchEnergyData(); // fetch only
      }
    };

    initialize();

    if (user) {
      // Generate energy every 3 minutes (180000 ms)
      energyGenerationInterval = setInterval(generateEnergy, 30000);

      // Refresh energy data display every 2 minutes (120000 ms)
      dataRefreshInterval = setInterval(fetchEnergyData, 120000);

      console.log("Energy generation intervals set up");
    }

    return () => {
      console.log("Cleaning up energy generation intervals");
      clearInterval(energyGenerationInterval);
      clearInterval(dataRefreshInterval);
    };
  }, [user]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    // Clear any stored auth data
    localStorage.removeItem("client");
    localStorage.removeItem("token");
    navigate("/clients/signin");
  };

  const drawer = (
    <Box>
      <Toolbar sx={{ bgcolor: "primary.main", color: "white" }}>
        <Typography variant="h6" noWrap>
          Solar Marketplace
        </Typography>
      </Toolbar>
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              "&.Mui-selected": {
                bgcolor: "primary.light",
                color: "white",
                "&:hover": {
                  bgcolor: "primary.main",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem button onClick={handleLogout} sx={{ borderRadius: 1, mt: 2 }}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Welcome to Solar Energy Marketplace
          </Typography>

          <Button color="inherit" onClick={() => navigate("/clients/wallet")}>
            {`Balance: ${energyBalance.toFixed(2)} kWh — ${formattedWorth}`}
          </Button>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Toolbar /> {/* This pushes content below app bar */}
        {children}
      </Box>
    </Box>
  );
};

export default ClientLayout;
