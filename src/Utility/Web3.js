// utils/web3.js
export const isMetaMaskInstalled = () => {
  return typeof window.ethereum !== 'undefined';
};

export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    return accounts[0];
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('User rejected wallet connection');
    }
    throw error;
  }
};

export const signMessage = async (message, address) => {
  try {
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address],
    });
    return signature;
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('User rejected signature');
    }
    throw error;
  }
};

export const formatAddress = (address) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};