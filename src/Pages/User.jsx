import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  PersonAdd,
  Edit,
  Delete,
  Search,
  CheckCircle,
  Cancel,
  AdminPanelSettings,
  ElectricBolt,
  Home,
  Factory,
  Refresh,
} from "@mui/icons-material";
import clientService from "../services/client.services";

const UserManagement = () => {
  // State for users data
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modals
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Notification
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // New user form
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    walletAddress: "",
    userType: "home",
    location: "",
    solarPanel: { size: "medium" }
  });

  // Edit user form
  const [editUser, setEditUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    userType: "home",
    status: "active",
    location: "",
    solarPanel: { size: "medium" }
  });

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page + 1,
        limit: pagination.limit,
        search: searchTerm,
        userType: roleFilter === "all" ? "all" : 
                 roleFilter === "factory_admin" ? "factory" : "home",
        status: "all"
      };

      const response = await clientService.getAllUsers(params);
      if (response.status === "success") {
        const transformedUsers = clientService.transformUsersForUI(response.data.users);
        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showSnackbar("Error fetching users", "error");
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit]);

  // Filter users based on search and role (client-side as backup)
  useEffect(() => {
    let result = users;

    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(result);
    setPagination(prev => ({ ...prev, page: 0 }));
  }, [searchTerm, roleFilter, users]);

  const handleChangePage = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setPagination(prev => ({ 
      ...prev, 
      limit: newLimit,
      page: 0 
    }));
  };

  const handleAddUser = async () => {
    try {
      // Transform UI data to API format
      const userData = {
        firstName: newUser.firstName.split(' ')[0],
        lastName: newUser.firstName.split(' ').slice(1).join(' ') || '',
        email: newUser.email,
        password: newUser.password || `temp${Date.now()}`,
        walletAddress: newUser.walletAddress || `0x${Date.now().toString(16)}`,
        userType: newUser.userType === "factory_admin" ? "factory" : "home",
        location: newUser.location,
        solarPanel: newUser.solarPanel
      };

      const response = await clientService.createUser(userData);
      if (response.status === "success") {
        showSnackbar("User created successfully", "success");
        setOpenAddDialog(false);
        setNewUser({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          walletAddress: "",
          userType: "home",
          location: "",
          solarPanel: { size: "medium" }
        });
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error("Error creating user:", error);
      showSnackbar(error.message || "Error creating user", "error");
    }
  };

  const handleEditUser = async () => {
    try {
      const userData = {
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        email: editUser.email,
        userType: editUser.userType === "factory_admin" ? "factory" : "home",
        status: editUser.status,
        location: editUser.location,
        solarPanel: editUser.solarPanel
      };

      const response = await clientService.updateUser(selectedUser.id, userData);
      if (response.status === "success") {
        showSnackbar("User updated successfully", "success");
        setOpenEditDialog(false);
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showSnackbar(error.message || "Error updating user", "error");
    }
  };

  const handleDeleteUser = async () => {
    try {
      const response = await clientService.deleteUser(selectedUser.id);
      if (response.status === "success") {
        showSnackbar("User deleted successfully", "success");
        setOpenDeleteDialog(false);
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      showSnackbar(error.message || "Error deleting user", "error");
    }
  };

  const handleRefresh = () => {
    fetchUsers();
    showSnackbar("Users list refreshed", "info");
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const openEditDialogWithUser = (user) => {
    setSelectedUser(user);
    setEditUser({
      firstName: user.name.split(' ')[0],
      lastName: user.name.split(' ').slice(1).join(' ') || '',
      email: user.email,
      userType: user.role === "factory_admin" ? "factory" : "home",
      status: user.status,
      location: user.location || "",
      solarPanel: user.solarPanel || { size: "medium" }
    });
    setOpenEditDialog(true);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <AdminPanelSettings fontSize="small" />;
      case "factory_admin":
        return <Factory fontSize="small" />;
      default:
        return <Home fontSize="small" />;
    }
  };

  const getBuildingIcon = (type) => {
    switch (type) {
      case "factory":
        return <Factory fontSize="small" />;
      default:
        return <Home fontSize="small" />;
    }
  };

  const getStatusChip = (status) => {
    return status === "active" ? (
      <Chip
        icon={<CheckCircle fontSize="small" />}
        label="Active"
        color="success"
        size="small"
      />
    ) : (
      <Chip
        icon={<Cancel fontSize="small" />}
        label="Inactive"
        color="error"
        size="small"
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>

      {/* Controls Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search users..."
            InputProps={{
              startAdornment: <Search fontSize="small" sx={{ mr: 1 }} />,
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="admin">Administrator</MenuItem>
              <MenuItem value="factory_admin">Factory Admin</MenuItem>
              <MenuItem value="member">Member</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => setOpenAddDialog(true)}
            sx={{ ml: "auto" }}
          >
            Add User
          </Button>

          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Users Table */}
      <Paper sx={{ mb: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Building</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Active</TableCell>
                <TableCell>Wallet Address</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers
                  .slice(pagination.page * pagination.limit, pagination.page * pagination.limit + pagination.limit)
                  .map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar src={user.avatar} alt={user.name} />
                          <Box>
                            <Typography>{user.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getRoleIcon(user.role)}
                          label={user.role.replace("_", " ")}
                          size="small"
                          color={
                            user.role === "admin"
                              ? "primary"
                              : user.role === "factory_admin"
                              ? "secondary"
                              : "default"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {user.building ? (
                          <Chip
                            icon={getBuildingIcon(user.building.type)}
                            label={user.building.name}
                            size="small"
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{getStatusChip(user.status)}</TableCell>
                      <TableCell>
                        {new Date(user.lastActive).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {user.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 'No wallet'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => openEditDialogWithUser(user)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => {
                              setSelectedUser(user);
                              setOpenDeleteDialog(true);
                            }}
                          >
                            <Delete fontSize="small" color="error" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.limit}
          page={pagination.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add User Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Full Name"
              value={newUser.firstName}
              onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={newUser.userType}
                label="Role"
                onChange={(e) => setNewUser({ ...newUser, userType: e.target.value })}
              >
                <MenuItem value="home">Member</MenuItem>
                <MenuItem value="factory_admin">Factory Admin</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Location/Building"
              value={newUser.location}
              onChange={(e) => setNewUser({ ...newUser, location: e.target.value })}
              fullWidth
            />
            <TextField
              label="Wallet Address (Optional)"
              value={newUser.walletAddress}
              onChange={(e) => setNewUser({ ...newUser, walletAddress: e.target.value })}
              fullWidth
              placeholder="0x..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained">
            Add User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Avatar src={selectedUser.avatar} sx={{ width: 56, height: 56 }} />
                <Box>
                  <Typography variant="h6">{selectedUser.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedUser.email}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <TextField
                label="First Name"
                value={editUser.firstName}
                onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                fullWidth
              />
              <TextField
                label="Last Name"
                value={editUser.lastName}
                onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                fullWidth
              />
              <TextField
                label="Email"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editUser.userType}
                  label="Role"
                  onChange={(e) => setEditUser({ ...editUser, userType: e.target.value })}
                >
                  <MenuItem value="home">Member</MenuItem>
                  <MenuItem value="factory_admin">Factory Admin</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editUser.status}
                  label="Status"
                  onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="deactive">Inactive</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Location/Building"
                value={editUser.location}
                onChange={(e) => setEditUser({ ...editUser, location: e.target.value })}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditUser} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Typography>
              Are you sure you want to delete user{" "}
              <strong>{selectedUser.name}</strong>? This action cannot be
              undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} variant="contained" color="error">
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;