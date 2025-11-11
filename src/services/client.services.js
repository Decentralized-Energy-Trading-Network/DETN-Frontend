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

  // In client.services.js - replace the getAggregate function with:

  




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
};

export default clientService;
