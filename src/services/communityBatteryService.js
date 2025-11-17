import api from "../api/api.manager";

const communityBatteryService = {
  /*
  ----------------------------------------------------------------
  GET BATTERY STATUS
  ----------------------------------------------------------------
  */
  async getBatteryStatus() {
    try {
      const response = await api.get("community-battery/status");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

async purchaseFromBattery(purchaseData) {
  try {
    const response = await api.post("community-battery/purchase", purchaseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
},

  /*
  ----------------------------------------------------------------
  GET ALL TRANSACTIONS
  ----------------------------------------------------------------
  */
  async getAllTransactions(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.type) queryParams.append('type', params.type);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.page) queryParams.append('page', params.page);
      
      const queryString = queryParams.toString();
      const url = `community-battery/transactions${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /*
  ----------------------------------------------------------------
  DEPOSIT ENERGY TO BATTERY
  ----------------------------------------------------------------
  */
  async depositEnergy(amountKwh) {
    try {
      const clientData = localStorage.getItem("client");
      if (!clientData) throw new Error("No client data found. Please login.");
      const client = JSON.parse(clientData);

      const data = {
        clientId: client._id,
        amountKwh: parseFloat(amountKwh)
      };

      const response = await api.post("community-battery/deposit", data);

      // Update client energy balance in localStorage if returned
      if (response.data?.data?.client?.energyBalance !== undefined) {
        client.energyBalance = response.data.data.client.energyBalance;
        localStorage.setItem("client", JSON.stringify(client));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /*
  ----------------------------------------------------------------
  RELEASE ENERGY FROM BATTERY
  ----------------------------------------------------------------
  */
  async releaseEnergy(amountKwh) {
    try {
      const clientData = localStorage.getItem("client");
      if (!clientData) throw new Error("No client data found. Please login.");
      const client = JSON.parse(clientData);

      const data = {
        clientId: client._id,
        amountKwh: parseFloat(amountKwh)
      };

      const response = await api.post("community-battery/release", data);

      // Update client energy balance in localStorage if returned
      if (response.data?.data?.client?.energyBalance !== undefined) {
        client.energyBalance = response.data.data.client.energyBalance;
        localStorage.setItem("client", JSON.stringify(client));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /*
  ----------------------------------------------------------------
  UPDATE ENERGY PRICE (Admin function)
  ----------------------------------------------------------------
  */
  async updateEnergyPrice(energyPricePerKwh) {
    try {
      const data = {
        energyPricePerKwh: parseFloat(energyPricePerKwh)
      };

      const response = await api.patch("community-battery/price", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /*
  ----------------------------------------------------------------
  GET MY BATTERY TRANSACTIONS
  ----------------------------------------------------------------
  */
  async getMyTransactions(params = {}) {
    try {
      const clientData = localStorage.getItem("client");
      if (!clientData) throw new Error("No client data found. Please login.");
      const client = JSON.parse(clientData);

      // Get all transactions and filter for current client
      const allTransactions = await this.getAllTransactions(params);
      
      if (allTransactions.data?.transactions) {
        const myTransactions = allTransactions.data.transactions.filter(
          transaction => transaction.client._id === client._id
        );

        return {
          ...allTransactions,
          data: {
            ...allTransactions.data,
            transactions: myTransactions,
            totalTransactions: myTransactions.length
          }
        };
      }

      return allTransactions;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /*
  ----------------------------------------------------------------
  GET BATTERY STATISTICS
  ----------------------------------------------------------------
  */
  async getBatteryStats() {
    try {
      const [statusResponse, transactionsResponse] = await Promise.all([
        this.getBatteryStatus(),
        this.getAllTransactions({ limit: 1000 }) // Get more transactions for stats
      ]);

      const battery = statusResponse.data?.battery;
      const transactions = transactionsResponse.data?.transactions || [];

      // Calculate statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayTransactions = transactions.filter(
        transaction => new Date(transaction.timestamp) >= today
      );

      const totalDepositsToday = todayTransactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amountKwh, 0);

      const totalReleasesToday = todayTransactions
        .filter(t => t.type === 'release')
        .reduce((sum, t) => sum + t.amountKwh, 0);

      const totalValueStored = battery.totalStoredKwh * battery.energyPricePerKwh;

      return {
        status: "success",
        data: {
          battery: battery,
          statistics: {
            totalTransactions: transactions.length,
            transactionsToday: todayTransactions.length,
            depositsToday: parseFloat(totalDepositsToday.toFixed(4)),
            releasesToday: parseFloat(totalReleasesToday.toFixed(4)),
            totalValueStored: parseFloat(totalValueStored.toFixed(4)),
            currentPrice: battery.energyPricePerKwh
          }
        }
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /*
  ----------------------------------------------------------------
  SIMULATE MARKET PRICE FLUCTUATION
  ----------------------------------------------------------------
  */
  async simulatePriceFluctuation() {
    try {
      const currentStatus = await this.getBatteryStatus();
      const currentPrice = currentStatus.data.battery.energyPricePerKwh;
      
      // Simple price fluctuation simulation (±10%)
      const fluctuation = (Math.random() - 0.5) * 0.2; // -10% to +10%
      const newPrice = currentPrice * (1 + fluctuation);
      
      // Ensure price doesn't go below minimum
      const minPrice = 0.05;
      const adjustedPrice = Math.max(newPrice, minPrice);
      
      return await this.updateEnergyPrice(parseFloat(adjustedPrice.toFixed(4)));
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /*
  ----------------------------------------------------------------
  BULK DEPOSIT (for testing)
  ----------------------------------------------------------------
  */
  async bulkDeposit(amountKwh, numberOfClients = 5) {
    try {
      // This would typically be an admin function
      // For now, we'll simulate multiple deposits from current client
      const results = [];
      
      for (let i = 0; i < numberOfClients; i++) {
        try {
          // Simulate different amounts for each "client"
          const simulatedAmount = amountKwh * (0.8 + Math.random() * 0.4);
          const result = await this.depositEnergy(simulatedAmount);
          results.push({
            success: true,
            amount: simulatedAmount,
            data: result
          });
        } catch (error) {
          results.push({
            success: false,
            amount: amountKwh,
            error: error.message
          });
        }
      }

      return {
        status: "success",
        message: `Bulk deposit completed for ${numberOfClients} simulated clients`,
        data: {
          totalAttempts: numberOfClients,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          results: results
        }
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default communityBatteryService;