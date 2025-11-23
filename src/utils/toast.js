import { toast } from 'react-toastify';

const toastThemes = {
  success: {
    style: {
      background: '#4caf50',
      borderRadius: '8px',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
      fontWeight: 500,
      padding: '16px',
    },
    icon: '🎉',
  },
  error: {
    style: {
      background: '#f44336',
      borderRadius: '8px',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
      fontWeight: 500,
      padding: '16px',
    },
    icon: '❌',
  },
  warning: {
    style: {
      background: '#ff9800',
      borderRadius: '8px',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
      fontWeight: 500,
      padding: '16px',
    },
    icon: '⚠️',
  },
  info: {
    style: {
      background: '#2196f3',
      borderRadius: '8px',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
      fontWeight: 500,
      padding: '16px',
    },
    icon: 'ℹ️',
  },
};

export const showToast = {
  success: (message) => {
    toast.success(message, toastThemes.success);
  },
  error: (message) => {
    toast.error(message, toastThemes.error);
  },
  warning: (message) => {
    toast.warning(message, toastThemes.warning);
  },
  info: (message) => {
    toast.info(message, toastThemes.info);
  },
};