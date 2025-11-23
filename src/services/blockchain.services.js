// frontend/src/services/blockchainService.js
import { ethers } from 'ethers';
import { SLRTokenABI, SLRTokenAddress } from '../contracts/SLRTokenABI';

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.distributorAddress = '0xe5f8a2119c05fda1b42d2ae970e7c0bfc4a98908';
    this.lastDistributedProduction = {}; // Track last distributed amounts per client
    this.KWH_TO_SLR_RATE = 100; // 1 kWh = 100 SLR tokens
  }

  /**
   * Initialize Web3 connection with MetaMask
   */
  async initialize() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      // Check if connected address is the distributor address
      const connectedAddress = await this.signer.getAddress();
      if (connectedAddress.toLowerCase() !== this.distributorAddress.toLowerCase()) {
        throw new Error(
          `Please connect with the distributor wallet: ${this.distributorAddress}\n` +
          `Currently connected: ${connectedAddress}`
        );
      }

      // Initialize contract
      this.contract = new ethers.Contract(
        SLRTokenAddress,
        SLRTokenABI,
        this.signer
      );

      console.log('✅ Blockchain service initialized successfully');
      console.log('Connected address:', connectedAddress);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  /**
   * Check if wallet is connected and is the distributor wallet
   */
  async isConnected() {
    try {
      if (!this.signer) return false;
      
      const address = await this.signer.getAddress();
      return address.toLowerCase() === this.distributorAddress.toLowerCase();
    } catch {
      return false;
    }
  }

  /**
   * Get SLR token balance for an address
   */
  async getTokenBalance(address) {
    try {
      if (!this.contract) await this.initialize();
      
      const balance = await this.contract.balanceOf(address);
      // Convert from Wei to tokens (assuming 18 decimals)
      return ethers.formatUnits(balance, 18);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      throw error;
    }
  }

  /**
   * Calculate tokens to distribute based on production
   */
  calculateTokenAmount(productionKwh) {
    // 1 kWh = 100 SLR tokens
    const tokenAmount = productionKwh * this.KWH_TO_SLR_RATE;
    // Convert to Wei (18 decimals)
    return ethers.parseUnits(tokenAmount.toString(), 18);
  }

  /**
   * Send SLR tokens to a recipient using safeTransfer
   */
  async sendTokens(recipientAddress, amountKwh) {
    try {
      if (!this.contract) await this.initialize();

      // Validate recipient address
      if (!ethers.isAddress(recipientAddress)) {
        throw new Error(`Invalid recipient address: ${recipientAddress}`);
      }

      // Calculate token amount
      const tokenAmount = this.calculateTokenAmount(amountKwh);
      
      console.log(`Sending ${amountKwh} kWh (${amountKwh * this.KWH_TO_SLR_RATE} SLR) to ${recipientAddress}`);

      // Use safeTransfer function
      const tx = await this.contract.safeTransfer(recipientAddress, tokenAmount);
      
      console.log('Transaction submitted:', tx.hash);
      console.log('Waiting for confirmation...');

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      console.log('✅ Transaction confirmed:', receipt.hash);

      return {
        success: true,
        txHash: receipt.hash,
        recipient: recipientAddress,
        amountKwh: amountKwh,
        amountSLR: amountKwh * this.KWH_TO_SLR_RATE,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Token transfer failed:', error);
      
      // Parse error message
      let errorMessage = 'Token transfer failed';
      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient ETH for gas fees';
      } else if (error.message.includes('insufficient allowance')) {
        errorMessage = 'Insufficient token allowance';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
        recipient: recipientAddress
      };
    }
  }

  /**
   * Distribute tokens to multiple clients based on production data
   * Only sends tokens for NEW production since last distribution
   */
  async distributeTokensToClients(clientsData) {
    if (!clientsData || clientsData.length === 0) {
      return {
        success: true,
        message: 'No clients to distribute tokens to',
        results: []
      };
    }

    try {
      // Ensure connection
      const connected = await this.isConnected();
      if (!connected) {
        await this.initialize();
      }

      const results = [];
      const distributionLog = [];

      for (const client of clientsData) {
        const { clientId, walletAddress, dailyProductionKwh, name } = client;

        // Skip if no wallet address or invalid address
        if (!walletAddress || !ethers.isAddress(walletAddress)) {
          console.warn(`⚠️ Skipping ${name}: Invalid wallet address`);
          results.push({
            clientId,
            name,
            skipped: true,
            reason: 'Invalid wallet address'
          });
          continue;
        }

        // Get last distributed amount for this client
        const lastDistributed = this.lastDistributedProduction[clientId] || 0;
        
        // Calculate new production (incremental)
        const newProduction = dailyProductionKwh - lastDistributed;

        // Skip if no new production or production decreased (shouldn't happen but safety check)
        if (newProduction <= 0) {
          console.log(`ℹ️ Skipping ${name}: No new production (${newProduction} kWh)`);
          results.push({
            clientId,
            name,
            skipped: true,
            reason: 'No new production',
            lastDistributed,
            currentProduction: dailyProductionKwh
          });
          continue;
        }

        // Skip if production is too small (less than 0.01 kWh = 1 SLR token)
        if (newProduction < 0.01) {
          console.log(`ℹ️ Skipping ${name}: Production too small (${newProduction} kWh)`);
          results.push({
            clientId,
            name,
            skipped: true,
            reason: 'Production below minimum threshold',
            newProduction
          });
          continue;
        }

        // Send tokens for new production
        console.log(`\n💰 Distributing to ${name}:`);
        console.log(`   New Production: ${newProduction} kWh`);
        console.log(`   Tokens: ${newProduction * this.KWH_TO_SLR_RATE} SLR`);

        const result = await this.sendTokens(walletAddress, newProduction);

        if (result.success) {
          // Update last distributed amount
          this.lastDistributedProduction[clientId] = dailyProductionKwh;
          
          distributionLog.push({
            clientId,
            name,
            walletAddress,
            newProduction,
            tokensSent: newProduction * this.KWH_TO_SLR_RATE,
            txHash: result.txHash,
            timestamp: new Date().toISOString()
          });
        }

        results.push({
          clientId,
          name,
          walletAddress,
          newProduction,
          totalProduction: dailyProductionKwh,
          ...result
        });

        // Add delay between transactions to avoid nonce issues
        if (clientsData.indexOf(client) < clientsData.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Log distribution summary
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success && !r.skipped).length;
      const skipped = results.filter(r => r.skipped).length;

      console.log('\n📊 Distribution Summary:');
      console.log(`   ✅ Successful: ${successful}`);
      console.log(`   ❌ Failed: ${failed}`);
      console.log(`   ⏭️ Skipped: ${skipped}`);

      return {
        success: true,
        summary: {
          total: clientsData.length,
          successful,
          failed,
          skipped
        },
        results,
        distributionLog
      };
    } catch (error) {
      console.error('Batch distribution failed:', error);
      return {
        success: false,
        error: error.message,
        results: []
      };
    }
  }

  /**
   * Reset distribution tracking (useful for testing or daily reset)
   */
  resetDistributionTracking() {
    this.lastDistributedProduction = {};
    console.log('Distribution tracking reset');
  }

  /**
   * Get distribution history for a client
   */
  getClientDistributionHistory(clientId) {
    return {
      clientId,
      lastDistributed: this.lastDistributedProduction[clientId] || 0
    };
  }

  /**
   * Listen for account changes
   */
  setupAccountListener(callback) {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length === 0) {
          console.log('MetaMask disconnected');
          this.provider = null;
          this.signer = null;
          this.contract = null;
        } else {
          console.log('Account changed:', accounts[0]);
          try {
            await this.initialize();
            if (callback) callback(accounts[0]);
          } catch (error) {
            console.error('Failed to reinitialize after account change:', error);
          }
        }
      });
    }
  }
}

// Export singleton instance
const blockchainService = new BlockchainService();
export default blockchainService;