import api from '../api/api.manager';

const orderService = {

  async createOrder(orderData) {
    try {
      const response = await api.post('orders', orderData);
      return response.data;
    } catch (error) {
      throw error?.response?.data || error;
    }
  },

  // Get open orders
  async getOpenOrders() {
    try {
      const response = await api.get('orders/open');
      return response.data;
    } catch (error) {
      throw error?.response?.data || error;
    }
  },

  // Buy order
  // payload: { clientId }
  async buyOrder(orderId, payload) {
    try {
      const response = await api.post(`orders/${orderId}/buy`, payload);
      return response.data;
    } catch (error) {
      throw error?.response?.data || error;
    }
  },

  // Cancel order
  // payload: { clientId }
  async cancelOrder(orderId, payload) {
    try {
      const response = await api.post(`orders/${orderId}/cancel`, payload);
      return response.data;
    } catch (error) {
      throw error?.response?.data || error;
    }
  },

  async transactionHistory(clientId, params = {}) {
  try {
    const response = await api.get(`orders/transactions/${clientId}`, {
      params: {
        type: params.type || 'all', // 'all', 'bought', 'sold'
        status: params.status, // 'open', 'completed', 'cancelled'
        page: params.page || 1,
        limit: params.limit || 50,
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc'
      }
    });
    return response;
  } catch (error) {
    throw error?.response?.data || error;
  }
},

async transactionDetails(transactionId) {
  try {
    const response = await api.get(`orders/transactions/${transactionId}`);
    return response;
  } catch (error) {
    throw error?.response?.data || error;
  }
},

async getEarnedAndSpentStats(clientId) {
  try {
    const response = await api.post(`orders/getEarnedAndSpentStats`, {clientId: clientId});
    return response.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
},

 
  async getMyOrders(options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.role) params.append('role', options.role);
      if (options.status) params.append('status', options.status);
      if (options.clientId) params.append('clientId', options.clientId);
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await api.get(`orders/my-orders${query}`);
      return response.data;
    } catch (error) {
      throw error?.response?.data || error;
    }
  }
};

export default orderService;