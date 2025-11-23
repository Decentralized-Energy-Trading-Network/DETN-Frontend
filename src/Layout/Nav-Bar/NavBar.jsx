// Layout/Admin/NavBar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ethers } from "ethers";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Button,
  Tooltip,
  Badge,
  Collapse,
  CircularProgress,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

// Icons - Import ALL icons used in the component
import DashboardIcon from "@mui/icons-material/Dashboard";
import SolarPowerIcon from "@mui/icons-material/SolarPower";
import MapIcon from "@mui/icons-material/Map";
import GroupIcon from "@mui/icons-material/Group";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

// Add ALL the missing icons
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import GroupsIcon from "@mui/icons-material/Groups";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

// Import your token configuration - use the same as client layout
import { SLRTokenABI, SLRTokenAddress } from "../../contracts/SLRTokenABI";
import { showToast } from "../../utils/toast";

// Polygon Network Configuration - same as client layout
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

const CURRENT_NETWORK = POLYGON_NETWORKS.mainnet;

// Custom styled components
const drawerWidth = 260;

const OpenedDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    width: drawerWidth,
    "& .MuiDrawer-paper": {
      width: drawerWidth,
      backgroundColor: theme.palette.primary.dark,
      color: theme.palette.common.white,
      transition: theme.transitions.create(["width"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
  }),
  ...(!open && {
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
    "& .MuiDrawer-paper": {
      backgroundColor: theme.palette.primary.dark,
      color: theme.palette.common.white,
      transition: theme.transitions.create(["width"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
      overflowX: "hidden",
    },
  }),
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const EnergyBalance = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(2),
  borderRadius: theme.spacing(2),
  background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
  color: theme.palette.common.white,
  textAlign: "center",
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2),
  justifyContent: "space-between",
}));

const Logo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const TokenBalanceSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1),
}));

const Sidebar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});
  
  // Token balance state
  const [tokenBalance, setTokenBalance] = useState("0");
  const [tokenInfo, setTokenInfo] = useState({});
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [networkError, setNetworkError] = useState(null);
  const [connectedNetwork, setConnectedNetwork] = useState(null);

  // Check if connected to correct network - same as client layout
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

  // Fetch wallet address from localStorage or Redux
  useEffect(() => {
    const fetchWalletAddress = () => {
      try {
        // Try to get from localStorage (same as client layout)
        const clientData = localStorage.getItem("client");
        if (clientData) {
          const client = JSON.parse(clientData);
          if (client.walletAddress) {
            setWalletAddress(client.walletAddress);
            return client.walletAddress;
          }
        }

        // Try to get from admin data
        const adminData = localStorage.getItem("admin");
        if (adminData) {
          const admin = JSON.parse(adminData);
          if (admin.walletAddress) {
            setWalletAddress(admin.walletAddress);
            return admin.walletAddress;
          }
        }

        // Try to get from user data
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          if (user.walletAddress) {
            setWalletAddress(user.walletAddress);
            return user.walletAddress;
          }
        }

        console.log("No wallet address found in storage");
        return null;
      } catch (error) {
        console.error("Error fetching wallet address:", error);
        return null;
      }
    };

    const address = fetchWalletAddress();
    if (address) {
      fetchTokenBalance(address);
    }
  }, []);

  const fetchTokenBalance = async (address = walletAddress) => {
    if (!address) {
      console.log("No wallet address found");
      return;
    }

    setIsLoadingToken(true);
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        console.log("MetaMask not installed");
        setIsLoadingToken(false);
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
      console.log("Wallet Address:", address);

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
        const balance = await tokenContract.balanceOf(address);
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

  // Refresh token balance
  const handleRefreshBalance = () => {
    fetchTokenBalance();
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
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      console.log("Connected MetaMask address:", address);
      
      // Update wallet address state
      setWalletAddress(address);
      
      // Fetch token balance for the connected address
      await fetchTokenBalance(address);

      showToast.success("MetaMask connected successfully!");
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      showToast.error("Failed to connect MetaMask: " + error.message);
    }
  };

  const handleMenuToggle = (menuText) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuText]: !prev[menuText],
    }));
  };

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  // Menu items with nested structure
  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/dashboard",
    },
    {
      text: "Energy Production",
      icon: <SolarPowerIcon />,
      hasSubMenu: true,
      subMenuItems: [
        {
          text: "Real-time Monitoring",
          icon: <MonitorHeartIcon />,
          path: "/production/monitor",
        },
        {
          text: "Equipment Status",
          icon: <PrecisionManufacturingIcon />,
          path: "/production/equipment",
        },
      ],
    },
    {
      text: "Community",
      icon: <GroupsIcon />,
      hasSubMenu: true,
      subMenuItems: [
        {
          text: "User Management",
          icon: <GroupIcon />,
          path: "/community/users",
        },
        {
          text: "Geospatial View",
          icon: <MapIcon />,
          path: "/community/map",
        },
      ],
    },
    {
      text: "Marketplace",
      icon: <LocalAtmIcon />,
      hasSubMenu: true,
      subMenuItems: [
        {
          text: "Overview",
          icon: <DashboardIcon />,
          path: "/marketplace/overview",
        },
        {
          text: "Order Book",
          icon: <FormatListBulletedIcon />,
          path: "/marketplace/orders",
        },
        {
          text: "Transaction History",
          icon: <ReceiptLongIcon />,
          path: "/marketplace/transactions",
        },
        {
          text: "Price Management",
          icon: <AttachMoneyIcon />,
          path: "/marketplace/pricing",
        },
      ],
    },
  ];

  // Helper to check if a path is active
  const isActive = (path) => {
    if (path === "/dashboard" && location.pathname === "/") return true;
    return location.pathname.startsWith(path);
  };

  return (
    <OpenedDrawer variant="permanent" open={open}>
      <SidebarHeader>
        <Logo>
          {open && (
            <Typography
              variant="h7"
              component="div"
              sx={{ flexGrow: 1, fontWeight: "bold" }}
            >
              Solar Network Admin

            </Typography>
          )}
        </Logo>
        <IconButton onClick={handleDrawerToggle} sx={{ color: "white" }}>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </SidebarHeader>

      <Divider sx={{ backgroundColor: "rgba(255,255,255,0.12)" }} />

      {open && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            variant="dot"
          >
            <Avatar
              alt="Admin Profile"
              src="https://i.pravatar.cc/150?img=12"
              sx={{ width: 64, height: 64 }}
            />
          </StyledBadge>
        </Box>
      )}

      {open && (
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="subtitle1">Admin</Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Decentralized Solar Energy System
          </Typography>
        </Box>
      )}

      {open && (
        <EnergyBalance>
          <Typography variant="body2">Current Energy Balance</Typography>
          <Typography variant="h6">152.8 kWh</Typography>
          
          {/* Token Balance Section */}
          <Box sx={{ mt: 2, p: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="caption">Token Balance</Typography>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <IconButton 
                  size="small" 
                  onClick={handleRefreshBalance}
                  disabled={isLoadingToken}
                  sx={{ color: 'white', p: 0.5 }}
                >
                  <AccountBalanceWalletIcon fontSize="small" />
                </IconButton>
                {!walletAddress && (
                  <IconButton 
                    size="small" 
                    onClick={connectMetaMask}
                    sx={{ color: 'white', p: 0.5 }}
                  >
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>
            
            {isLoadingToken ? (
              <TokenBalanceSection>
                <CircularProgress size={16} sx={{ color: 'white' }} />
                <Typography variant="body2">Loading...</Typography>
              </TokenBalanceSection>
            ) : (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: '1.1rem' }}>
                  {parseFloat(tokenBalance).toFixed(2)} {tokenInfo.symbol || 'SLR'}
                </Typography>
                {walletAddress ? (
                  <Typography variant="caption" sx={{ opacity: 0.8, wordBreak: 'break-all' }}>
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </Typography>
                ) : (
                  <Button 
                    size="small" 
                    onClick={connectMetaMask}
                    sx={{ color: 'white', textTransform: 'none', p: 0, mt: 0.5 }}
                  >
                    Connect MetaMask
                  </Button>
                )}
              </Box>
            )}
            {networkError && (
              <Typography variant="caption" sx={{ color: 'warning.main', mt: 0.5, display: 'block' }}>
                {networkError}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Box>
              <Typography variant="caption">Value</Typography>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                ${(parseFloat(tokenBalance) * 0.35).toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </EnergyBalance>
      )}

      {/* Rest of your sidebar code remains the same */}
      <Divider sx={{ backgroundColor: "rgba(255,255,255,0.12)" }} />

      <List component="nav" sx={{ pt: 0 }}>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            {item.hasSubMenu ? (
              <>
                <ListItem disablePadding sx={{ display: "block" }}>
                  <ListItemButton
                    onClick={() => handleMenuToggle(item.text)}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                      position: "relative",
                      "&:before": isActive(item.path)
                        ? {
                            content: '""',
                            position: "absolute",
                            left: 0,
                            top: "25%",
                            height: "50%",
                            width: 3,
                            backgroundColor: theme.palette.secondary.main,
                            borderRadius: "0 4px 4px 0",
                          }
                        : {},
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 2 : "auto",
                        justifyContent: "center",
                        color: "white",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {open && (
                      <>
                        <ListItemText primary={item.text} />
                        {expandedMenus[item.text] ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )}
                      </>
                    )}
                  </ListItemButton>
                </ListItem>
                <Collapse
                  in={expandedMenus[item.text] && open}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {item.subMenuItems.map((subItem) => (
                      <ListItemButton
                        key={subItem.text}
                        onClick={() => navigate(subItem.path)}
                        sx={{
                          pl: 4,
                          backgroundColor: isActive(subItem.path)
                            ? "rgba(255, 255, 255, 0.08)"
                            : "transparent",
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: 2,
                            justifyContent: "center",
                            color: "white",
                          }}
                        >
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText primary={subItem.text} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <ListItem disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                    backgroundColor: isActive(item.path)
                      ? "rgba(255, 255, 255, 0.08)"
                      : "transparent",
                    position: "relative",
                    "&:before": isActive(item.path)
                      ? {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: "25%",
                          height: "50%",
                          width: 3,
                          backgroundColor: theme.palette.secondary.main,
                          borderRadius: "0 4px 4px 0",
                        }
                      : {},
                  }}
                >
                  <Tooltip title={!open ? item.text : ""} placement="right">
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 2 : "auto",
                        justifyContent: "center",
                        color: "white",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                  </Tooltip>
                  {open && <ListItemText primary={item.text} />}
                </ListItemButton>
              </ListItem>
            )}
          </React.Fragment>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Divider sx={{ backgroundColor: "rgba(255,255,255,0.12)" }} />

      <List>
        <ListItem disablePadding sx={{ display: "block" }}>
          <ListItemButton
            onClick={() => navigate("/notifications")}
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
            }}
          >
            <Tooltip title={!open ? "Notifications" : ""} placement="right">
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : "auto",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </ListItemIcon>
            </Tooltip>
            {open && <ListItemText primary="Notifications" />}
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ display: "block" }}>
          <ListItemButton
            onClick={() => navigate("/help")}
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
            }}
          >
            <Tooltip title={!open ? "Help" : ""} placement="right">
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : "auto",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <HelpOutlineIcon />
              </ListItemIcon>
            </Tooltip>
            {open && <ListItemText primary="Help & Support" />}
          </ListItemButton>
        </ListItem>
      </List>

      <Box sx={{ p: open ? 2 : 0.5, textAlign: "center" }}>
        {open ? (
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            SolarSwap v1.2.0 © 2025
          </Typography>
        ) : (
          <Typography
            variant="caption"
            sx={{
              opacity: 0.7,
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
            }}
          >
            v1.2.0
          </Typography>
        )}
      </Box>
    </OpenedDrawer>
  );
};

export default Sidebar;