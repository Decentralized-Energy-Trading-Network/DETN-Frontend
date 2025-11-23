import api from "../api/api.manager";

// realistic per-interval production mapping (kWh per 30 min)
const PANEL_INTERVAL_PRODUCTION = {
  small: 0.02,
  medium: 0.04,
  large: 0.05,
};

const energyService = {
  async getClientEnergy(clientId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);
      if (params.limit) queryParams.append("limit", params.limit);
      const queryString = queryParams.toString();
      const url = `energy/client/${clientId}${
        queryString ? `?${queryString}` : ""
      }`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async addEnergy(data) {
    try {
      const response = await api.post("energy/add", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async addBulkEnergy() {
    try {
      const response = await api.post("energy/add-bulk");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getMyEnergy(params = {}) {
    try {
      const clientData = localStorage.getItem("client");
      if (!clientData) throw new Error("No client data found. Please login.");
      const client = JSON.parse(clientData);
      return await this.getClientEnergy(client._id, params);
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async addMyEnergy(manualProduction = null) {
    try {
      const clientData = localStorage.getItem("client");
      if (!clientData) throw new Error("No client data found. Please login.");
      const client = JSON.parse(clientData);

      let production = manualProduction;

      // If manual production is not provided, calculate based on panel size
      if (production === null) {
        const panelSize = client.solarPanel?.size || "medium";
        production = PANEL_INTERVAL_PRODUCTION[panelSize] || 0.048;
      }

      // Clamp production to a realistic maximum (1 kWh per 30 min)
      production = Math.min(production, 1);

      const data = { clientId: client._id, manualProduction: production };

      const response = await api.post("energy/add", data);

      if (response.data?.data?.client?.energyBalance !== undefined) {
        client.energyBalance = response.data.data.client.energyBalance;
        localStorage.setItem("client", JSON.stringify(client));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getTotalEnergyProduction(period = "today") {
    try {
      const response = await api.get(
        `energy/production/total?period=${period}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getEnergyTradeToday() {
    try {
      const response = await api.get("energy/trade/today");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getRealTimeEnergyFlow() {
    try {
      const response = await api.get("energy/flow/realtime");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getRecentTransactions(limit = 10) {
    try {
      const response = await api.get(`orders/transactions-orders/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all transactions with pagination
  async getAllTransactions(params = {}) {
    try {
      const response = await api.get("orders/transactions", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getLiveProduction() {
    try {
      const response = await api.get("energy/dashboard");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get transaction statistics
  async getTransactionStats() {
    try {
      const response = await api.get("orders/transactions/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default energyService;
