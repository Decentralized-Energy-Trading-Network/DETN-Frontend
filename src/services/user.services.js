import api from '../api/api.manager';

const userService = {

  async login(credentials) {
    try {
      const response = await api.post('user/login', credentials);
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  async register(userData) {
    try {
      const response = await api.post('user/register', userData);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  logout() {
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  },

  isAuthenticated() {
    const user = this.getCurrentUser();
    return !!user && !!user.token;
  }

};

export default userService;

//damn