import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  Grid,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  Paper,
  Badge,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  EnergySavingsLeaf as EnergyIcon,
  AccountBalanceWallet as WalletIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'energy',
      title: 'Energy Sale Completed',
      message: 'Your 25.3 kWh energy sale to John Smith has been completed successfully.',
      time: '10 minutes ago',
      read: false,
      important: true
    },
    {
      id: 2,
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tomorrow from 2:00 AM to 4:00 AM.',
      time: '1 hour ago',
      read: false,
      important: false
    },
    {
      id: 3,
      type: 'market',
      title: 'Price Alert',
      message: 'Energy prices have increased by 5%. Consider selling your excess energy.',
      time: '2 hours ago',
      read: true,
      important: true
    },
    {
      id: 4,
      type: 'transaction',
      title: 'New Purchase Order',
      message: 'Sarah Miller wants to buy 18.7 kWh from you at $0.127/kWh.',
      time: '3 hours ago',
      read: true,
      important: false
    },
    {
      id: 5,
      type: 'warning',
      title: 'Low Battery Warning',
      message: 'Your home battery level has dropped below 20%. Consider purchasing energy.',
      time: '5 hours ago',
      read: true,
      important: true
    },
    {
      id: 6,
      type: 'success',
      title: 'Auto-Sell Activated',
      message: 'Your auto-sell settings have sold 15.2 kWh to the community pool.',
      time: '1 day ago',
      read: true,
      important: false
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    energyAlerts: true,
    priceAlerts: true,
    systemAlerts: true,
    transactionAlerts: true
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const handleMenuClick = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
    handleMenuClose();
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
    handleMenuClose();
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'energy':
        return <EnergyIcon color="primary" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'success':
        return <SuccessIcon color="success" />;
      case 'market':
        return <WalletIcon color="info" />;
      default:
        return <InfoIcon color="action" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'energy':
        return 'primary';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'market':
        return 'info';
      default:
        return 'default';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'important') return notification.important;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Notifications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Stay updated with your energy trading activities and system alerts
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<MarkReadIcon />}
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All as Read
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={clearAll}
            disabled={notifications.length === 0}
          >
            Clear All
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Notifications List */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              {/* Filter Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {['all', 'unread', 'important', 'energy', 'market', 'warning'].map((filterType) => (
                      <Chip
                        key={filterType}
                        label={filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                        variant={filter === filterType ? 'filled' : 'outlined'}
                        onClick={() => setFilter(filterType)}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* Notifications List */}
              <List sx={{ p: 0 }}>
                {filteredNotifications.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      You're all caught up!
                    </Typography>
                  </Box>
                ) : (
                  filteredNotifications.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          backgroundColor: notification.read ? 'transparent' : 'action.hover',
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            aria-label="actions"
                            onClick={(e) => handleMenuClick(e, notification)}
                          >
                            <MoreIcon />
                          </IconButton>
                        }
                      >
                        <ListItemAvatar>
                          <Badge
                            color="error"
                            variant="dot"
                            invisible={notification.read}
                          >
                            <Avatar sx={{ bgcolor: 'background.paper' }}>
                              {getNotificationIcon(notification.type)}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="subtitle1" component="span">
                                {notification.title}
                              </Typography>
                              {notification.important && (
                                <Chip label="Important" color="error" size="small" />
                              )}
                              <Chip
                                label={notification.type}
                                color={getNotificationColor(notification.type)}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                                {notification.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {notification.time}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      {index < filteredNotifications.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Manage how you receive notifications
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.pushNotifications}
                      onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                    />
                  }
                  label="Push Notifications"
                />
                <Divider />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.energyAlerts}
                      onChange={(e) => setSettings({ ...settings, energyAlerts: e.target.checked })}
                    />
                  }
                  label="Energy Trading Alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.priceAlerts}
                      onChange={(e) => setSettings({ ...settings, priceAlerts: e.target.checked })}
                    />
                  }
                  label="Price Change Alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.systemAlerts}
                      onChange={(e) => setSettings({ ...settings, systemAlerts: e.target.checked })}
                    />
                  }
                  label="System Status Alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.transactionAlerts}
                      onChange={(e) => setSettings({ ...settings, transactionAlerts: e.target.checked })}
                    />
                  }
                  label="Transaction Alerts"
                />
              </Box>

              <Button variant="contained" fullWidth sx={{ mt: 3 }}>
                Save Settings
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Notifications</Typography>
                  <Typography variant="body2" fontWeight="bold">{notifications.length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Unread</Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {unreadCount}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Important</Typography>
                  <Typography variant="body2" fontWeight="bold" color="error">
                    {notifications.filter(n => n.important).length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Today</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {notifications.filter(n => n.time.includes('minutes ago') || n.time.includes('hour')).length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.read && (
          <MenuItem onClick={() => markAsRead(selectedNotification.id)}>
            <ListItemIcon>
              <MarkReadIcon fontSize="small" />
            </ListItemIcon>
            Mark as Read
          </MenuItem>
        )}
        <MenuItem onClick={() => deleteNotification(selectedNotification?.id)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Notifications;