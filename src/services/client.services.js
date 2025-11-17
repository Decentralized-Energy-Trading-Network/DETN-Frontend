import api from "../api/api.manager";

const clientService = {
  // Register client with email/password
  async register(clientData) {
    try {
      const response = await api.post("clients/register", clientData);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Login client with email/password
  async login(credentials) {
    try {
      const response = await api.post("clients/login", credentials);
      if (response.data.data) {
        localStorage.setItem("client", JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Get nonce for wallet authentication
  async getNonce(walletAddress) {
    try {
      const response = await api.get(`clients/nonce/${walletAddress}`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Login with wallet signature
  async walletLogin(walletData) {
    try {
      const response = await api.post("clients/wallet-login", walletData);
      if (response.data.data) {
        localStorage.setItem("client", JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Get client profile
  async getClientProfile() {
    try {
      const response = await api.get("clients/profile");
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Update energy balance
  async updateEnergyBalance(walletAddress, amount) {
    try {
      const response = await api.put("clients/energy-balance", {
        walletAddress,
        amount
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // ==================== USER MANAGEMENT APIS ====================

  // Get all users with pagination and filtering
  async getAllUsers(params = {}) {
    try {
      const response = await api.get("clients/users", { params });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await api.get(`clients/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Create new user (Admin)
  async createUser(userData) {
    try {
      const response = await api.post("clients/users", userData);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Update user
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`clients/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Delete user (soft delete)
  async deleteUser(userId) {
    try {
      const response = await api.delete(`clients/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Get user statistics
  async getUserStats() {
    try {
      const response = await api.get("clients/users/stats");
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Update user password (admin function)
  async updateUserPassword(userId, password) {
    try {
      const response = await api.put(`clients/users/${userId}/password`, {
        password
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Bulk update user status
  async bulkUpdateUserStatus(userIds, status) {
    try {
      const response = await api.put("clients/users/bulk/status", {
        userIds,
        status
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Get user activity
  async getUserActivity(userId) {
    try {
      const response = await api.get(`clients/users/${userId}/activity`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // ==================== UTILITY METHODS ====================

  // Get current client from localStorage
  getCurrentClient() {
    const clientStr = localStorage.getItem("client");
    return clientStr ? JSON.parse(clientStr) : null;
  },

  // Logout client
  logout() {
    localStorage.removeItem("client");
  },

  // Check if client is authenticated
  isAuthenticated() {
    return !!localStorage.getItem("client");
  },

  // Check if current user is admin (you might want to add admin role to your model)
  isAdmin() {
    const client = this.getCurrentClient();
    // You'll need to add role field to your Client model or use userType
    return client && (client.role === 'admin' || client.userType === 'factory');
  },

  // Transform API data to UI format
  transformUserForUI(dbUser) {
    return {
      id: dbUser._id,
      name: `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() || 'Unnamed User',
      email: dbUser.email || 'No email',
      role: dbUser.userType === 'factory' ? 'factory_admin' : 'member',
      status: dbUser.status,
      lastActive: dbUser.updatedAt || dbUser.createdAt,
      avatar: '/avatars/default.jpg',
      building: {
        type: dbUser.userType,
        name: dbUser.location || `${dbUser.userType} User`
      },
      // Additional fields for UI
      walletAddress: dbUser.walletAddress,
      energyBalance: dbUser.energyBalance,
      solarPanel: dbUser.solarPanel,
      location: dbUser.location,
      lat: dbUser.lat,
      lon: dbUser.lon,
      createdAt: dbUser.createdAt,
      userType: dbUser.userType
    };
  },

  // Transform multiple users
  transformUsersForUI(dbUsers) {
    return dbUsers.map(user => this.transformUserForUI(user));
  }
};

export default clientService;