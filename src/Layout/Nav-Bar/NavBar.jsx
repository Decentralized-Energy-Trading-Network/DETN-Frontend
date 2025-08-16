import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Tooltip,
  Badge,
  Collapse,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

// Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import SolarPowerIcon from "@mui/icons-material/SolarPower";
import MapIcon from "@mui/icons-material/Map";
import GroupIcon from "@mui/icons-material/Group";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SwapHorizontalCircleIcon from "@mui/icons-material/SwapHorizontalCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import HistoryIcon from "@mui/icons-material/History";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import GroupsIcon from "@mui/icons-material/Groups";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import GavelIcon from "@mui/icons-material/Gavel";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CodeIcon from "@mui/icons-material/Code";
import ApiIcon from "@mui/icons-material/Api";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

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

const Sidebar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [marketOpen, setMarketOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = React.useState({});

  const handleMenuToggle = (menuText) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuText]: !prev[menuText], // Toggle only the clicked menu
    }));
  };

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMarketToggle = () => {
    setMarketOpen(!marketOpen);
  };

  const handleAnalyticsToggle = () => {
    setAnalyticsOpen(!analyticsOpen);
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
        {
          text: "Battery Storage",
          icon: <BatteryFullIcon />,
          path: "/community/storage",
        },
      ],
    },
    {
      text: "Marketplace",
      icon: <LocalAtmIcon />,
      hasSubMenu: true,
      subMenuItems: [
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
        {
          text: "Disputes",
          icon: <GavelIcon />,
          path: "/marketplace/disputes",
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
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, fontWeight: "bold" }}
            >
              SolarSwap
            </Typography>
          )}
          <ElectricBoltIcon sx={{ color: "#ffc107" }} />
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
              alt="User Profile"
              src="/api/placeholder/150/150"
              sx={{ width: 64, height: 64 }}
            />
          </StyledBadge>
        </Box>
      )}

      {open && (
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="subtitle1">Alex Johnson</Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Solar Producer
          </Typography>
        </Box>
      )}

      {open && (
        <EnergyBalance>
          <Typography variant="body2">Current Energy Balance</Typography>
          <Typography variant="h6">152.8 kWh</Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Box>
              <Typography variant="caption">Tokens</Typography>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                350 SCT
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption">Value</Typography>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                $125.40
              </Typography>
            </Box>
          </Box>
        </EnergyBalance>
      )}

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
