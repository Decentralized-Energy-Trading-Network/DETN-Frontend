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
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  Sell,
  ShoppingCart,
  AccountBalanceWallet,
  History,
  Logout,
  AccountBalance,
  Warning,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ethers } from "ethers";
import energyService from "../services/energy.services";
import { showToast } from "../utils/toast";
import { updateEnergyBalance } from "../store/auth";

// Import your token ABI and address
import { SLRTokenABI, SLRTokenAddress } from "../contracts/SLRTokenABI";

const drawerWidth = 240;

// Polygon Network Configuration
const POLYGON_NETWORKS = {
  mainnet: {
    chainId: 137,
    chainIdHex: "0x89",
    name: "Polygon Mainnet",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
  },
};

// Set which network you're using (change this to 'mainnet' or 'amoy')
const CURRENT_NETWORK = POLYGON_NETWORKS.mainnet; // Using Polygon Mainnet

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
  const userName = useSelector((state) => state.auth?.user?.firstName);
  

  // Token balance state
  const [tokenBalance, setTokenBalance] = useState("0");
  const [tokenInfo, setTokenInfo] = useState({});
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [networkError, setNetworkError] = useState(null);
  const [connectedNetwork, setConnectedNetwork] = useState(null);

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

  // Check if connected to correct network
  const checkNetwork = async (provider) => {
    try {
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);

      setConnectedNetwork({
        chainId: currentChainId,
        name:
          currentChainId === CURRENT_NETWORK.chainId
            ? CURRENT_NETWORK.name
            : `Chain ID: ${currentChainId}`,
      });

      if (currentChainId !== CURRENT_NETWORK.chainId) {
        setNetworkError(
          `Wrong network! Please switch to ${CURRENT_NETWORK.name}`
        );
        return false;
      }

      setNetworkError(null);
      return true;
    } catch (error) {
      console.error("Error checking network:", error);
      return false;
    }
  };

  // Switch to correct network
  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CURRENT_NETWORK.chainIdHex }],
      });
      setNetworkError(null);
      return true;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: CURRENT_NETWORK.chainIdHex,
                chainName: CURRENT_NETWORK.name,
                nativeCurrency: CURRENT_NETWORK.nativeCurrency,
                rpcUrls: [CURRENT_NETWORK.rpcUrl],
                blockExplorerUrls: [CURRENT_NETWORK.blockExplorer],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error("Error adding network:", addError);
          showToast.error("Failed to add network to MetaMask");
          return false;
        }
      }
      console.error("Error switching network:", switchError);
      showToast.error("Failed to switch network");
      return false;
    }
  };

  // Fetch token balance
  const fetchTokenBalance = async () => {
    if (!walletAddress) {
      console.log("No wallet address found");
      return;
    }

    setIsLoadingToken(true);
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        console.log("MetaMask not installed");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);

      // Check if on correct network
      const isCorrectNetwork = await checkNetwork(provider);
      if (!isCorrectNetwork) {
        console.log("Not on correct network");
        setIsLoadingToken(false);
        return;
      }

      console.log("Fetching token balance...");
      console.log("Contract Address:", SLRTokenAddress);
      console.log("Wallet Address:", walletAddress);

      // Check if contract exists
      const code = await provider.getCode(SLRTokenAddress);
      if (code === "0x") {
        console.error("No contract found at address:", SLRTokenAddress);
        showToast.error(
          `No contract deployed at ${SLRTokenAddress} on ${CURRENT_NETWORK.name}`
        );
        setIsLoadingToken(false);
        return;
      }

      const tokenContract = new ethers.Contract(
        SLRTokenAddress,
        SLRTokenABI,
        provider
      );

      // Get token info first to verify contract is working
      try {
        const name = await tokenContract.name();
        const symbol = await tokenContract.symbol();
        const decimals = await tokenContract.decimals();

        console.log("Token Info:", { name, symbol, decimals });

        // Now get balance
        const balance = await tokenContract.balanceOf(walletAddress);
        const formattedBalance = ethers.formatUnits(balance, decimals);

        setTokenBalance(formattedBalance);
        setTokenInfo({ name, symbol, decimals });

        console.log(`Token Balance: ${formattedBalance} ${symbol}`);
      } catch (contractError) {
        console.error("Contract interaction error:", contractError);
        showToast.error(
          "Failed to read token contract. Please verify the contract address."
        );
      }
    } catch (error) {
      console.error("Error fetching token balance:", error);

      if (error.code === "CALL_EXCEPTION") {
        showToast.error(
          "Contract call failed. Verify contract address and network."
        );
      } else {
        showToast.error(
          "Failed to fetch token balance. Check console for details."
        );
      }
    } finally {
      setIsLoadingToken(false);
    }
  };

  // Connect to MetaMask and get token balance
  const connectMetaMask = async () => {
    try {
      if (!window.ethereum) {
        showToast.error("Please install MetaMask!");
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const provider = new ethers.BrowserProvider(window.ethereum);

      // Check network first
      const isCorrectNetwork = await checkNetwork(provider);
      if (!isCorrectNetwork) {
        const switched = await switchNetwork();
        if (!switched) return;
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      console.log("Connected MetaMask address:", address);
      console.log("App wallet address:", walletAddress);

      // Warn if addresses don't match
      if (
        walletAddress &&
        address.toLowerCase() !== walletAddress.toLowerCase()
      ) {
        showToast.warning(
          `MetaMask address (${address.slice(0, 6)}...${address.slice(
            -4
          )}) differs from registered address`
        );
      }

      // Fetch token balance for the connected address
      await fetchTokenBalance();

      showToast.success("MetaMask connected successfully!");
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      showToast.error("Failed to connect MetaMask: " + error.message);
    }
  };

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
    }
  };

  // Generate energy (called every 10 minutes)
  const generateEnergy = async () => {
    if (!user || isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await energyService.addMyEnergy();

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
    console.log("Expected network:", CURRENT_NETWORK.name);
    console.log("Token contract address:", SLRTokenAddress);

    // Initial data load
    const initialize = async () => {
      if (user) {
        console.log("Initializing energy system for user:", user);
        await fetchEnergyData();

        // Fetch token balance if wallet address exists
        if (walletAddress) {
          console.log("Fetching token balance for wallet:", walletAddress);
          await fetchTokenBalance();
        }
      }
    };

    initialize();

    if (user) {
      // Generate energy every 30 seconds (for testing - change to 180000 for 3 minutes)
      energyGenerationInterval = setInterval(generateEnergy, 30000);

      // Refresh energy data display every 2 minutes
      dataRefreshInterval = setInterval(fetchEnergyData, 120000);

      console.log("Energy generation intervals set up");
    }

    return () => {
      console.log("Cleaning up energy generation intervals");
      clearInterval(energyGenerationInterval);
      clearInterval(dataRefreshInterval);
    };
  }, [user, walletAddress]);

  // Listen for account and network changes in MetaMask
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          console.log("MetaMask account changed:", accounts[0]);
          fetchTokenBalance();
        } else {
          setTokenBalance("0");
          showToast.info("MetaMask disconnected");
        }
      };

      const handleChainChanged = (chainId) => {
        console.log("Network changed to:", chainId);
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
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

        {/* Token Balance in Sidebar */}
        <ListItem sx={{ borderRadius: 1, mt: 2, mb: 1 }}>
          <ListItemIcon>
            <AccountBalance />
          </ListItemIcon>
          <Box>
            <Typography variant="body2" color="text.secondary">
              SLR Balance
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {isLoadingToken
                ? "Loading..."
                : `${parseFloat(tokenBalance).toFixed(2)} ${
                    tokenInfo.symbol || "SLR"
                  }`}
            </Typography>
            {connectedNetwork && (
              <Typography variant="caption" color="text.secondary">
                {connectedNetwork.name}
              </Typography>
            )}
          </Box>
        </ListItem>

        <ListItem button onClick={handleLogout} sx={{ borderRadius: 1, mt: 1 }}>
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
      {/* Network Error Snackbar */}
      <Snackbar
        open={!!networkError}
        autoHideDuration={null}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="warning"
          icon={<Warning />}
          action={
            <Button color="inherit" size="small" onClick={switchNetwork}>
              SWITCH NETWORK
            </Button>
          }
          sx={{ width: "100%" }}
        >
          {networkError}
        </Alert>
      </Snackbar>

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
            Welcome Back {userName} 
          </Typography>

          {/* Energy Balance */}
          <Button
            color="inherit"
            onClick={() => navigate("/clients/wallet")}
            sx={{ mr: 2 }}
          >
            {`Energy: ${energyBalance.toFixed(2)} kWh`}
          </Button>

          {/* Token Balance */}
          <Chip
            icon={<AccountBalanceWallet />}
            label={
              isLoadingToken
                ? "Loading SLR..."
                : networkError
                ? "Wrong Network"
                : `${parseFloat(tokenBalance).toFixed(2)} ${
                    tokenInfo.symbol || "SLR"
                  }`
            }
            onClick={connectMetaMask}
            variant="outlined"
            color={networkError ? "error" : "default"}
            sx={{
              color: "white",
              borderColor: networkError ? "error.main" : "white",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
            clickable
          />
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
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default ClientLayout;