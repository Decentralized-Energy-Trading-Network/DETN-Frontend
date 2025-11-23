// services/tokenDistribution.service.js
const { ethers } = require('ethers');
require('dotenv').config();

// Import your token ABI
const SLRTokenABI = require('../contracts/SLRTokenABI.json');

class TokenDistributionService {
  constructor() {
    // Polygon Mainnet RPC
    this.provider = new ethers.JsonRpcProvider(
      process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com'
    );

    // Treasury wallet (central address that holds all tokens)
    this.treasuryWallet = new ethers.Wallet(
      process.env.TREASURY_PRIVATE_KEY,
      this.provider
    );

    // Token contract instance
    this.tokenContract = new ethers.Contract(
      process.env.SLR_TOKEN_ADDRESS,
      SLRTokenABI,
      this.treasuryWallet
    );

    // Conversion rate: 1 kWh = 100 SLR tokens
    this.TOKENS_PER_KWH = 100;

    console.log('✅ Token Distribution Service initialized');
    console.log('Treasury Address:', this.treasuryWallet.address);
    console.log('Token Contract:', process.env.SLR_TOKEN_ADDRESS);
  }

  /**
   * Convert kWh to SLR tokens
   * @param {number} kwh - Amount of energy in kWh
   * @returns {bigint} Token amount in smallest unit (with decimals)
   */
  kwhToTokens(kwh) {
    const tokenAmount = kwh * this.TOKENS_PER_KWH;
    // Convert to token's smallest unit (assuming 18 decimals)
    return ethers.parseUnits(tokenAmount.toString(), 18);
  }

  /**
   * Distribute tokens to user for energy generation
   * @param {string} userWalletAddress - User's wallet address
   * @param {number} energyKwh - Amount of energy generated in kWh
   * @returns {Object} Transaction details
   */
  async distributeTokensForEnergy(userWalletAddress, energyKwh) {
    try {
      console.log(`\n🔄 Starting token distribution...`);
      console.log(`User: ${userWalletAddress}`);
      console.log(`Energy: ${energyKwh} kWh`);

      // Validate wallet address
      if (!ethers.isAddress(userWalletAddress)) {
        throw new Error('Invalid wallet address');
      }

      // Calculate token amount
      const tokenAmount = this.kwhToTokens(energyKwh);
      const tokenAmountFormatted = ethers.formatUnits(tokenAmount, 18);

      console.log(`Tokens to send: ${tokenAmountFormatted} SLR`);

      // Check treasury balance
      const treasuryBalance = await this.tokenContract.balanceOf(
        this.treasuryWallet.address
      );
      const treasuryBalanceFormatted = ethers.formatUnits(treasuryBalance, 18);

      console.log(`Treasury balance: ${treasuryBalanceFormatted} SLR`);

      if (treasuryBalance < tokenAmount) {
        throw new Error(
          `Insufficient treasury balance. Need ${tokenAmountFormatted} SLR, have ${treasuryBalanceFormatted} SLR`
        );
      }

      // Get current gas price
      const feeData = await this.provider.getFeeData();
      
      // Send tokens to user
      console.log('📤 Sending transaction...');
      const tx = await this.tokenContract.transfer(
        userWalletAddress,
        tokenAmount,
        {
          gasLimit: 100000, // Set a reasonable gas limit
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        }
      );

      console.log(`Transaction hash: ${tx.hash}`);
      console.log('⏳ Waiting for confirmation...');

      // Wait for transaction confirmation
      const receipt = await tx.wait(2); // Wait for 2 confirmations

      console.log('✅ Transaction confirmed!');
      console.log(`Block number: ${receipt.blockNumber}`);
      console.log(`Gas used: ${receipt.gasUsed.toString()}`);

      // Return transaction details
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        tokenAmount: tokenAmountFormatted,
        energyKwh,
        recipient: userWalletAddress,
        timestamp: new Date().toISOString(),
        polygonScanUrl: `https://polygonscan.com/tx/${tx.hash}`,
      };
    } catch (error) {
      console.error('❌ Token distribution failed:', error);

      // Parse error messages
      let errorMessage = error.message;
      
      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Treasury wallet has insufficient MATIC for gas fees';
      } else if (error.code === 'NONCE_EXPIRED') {
        errorMessage = 'Transaction nonce expired. Please retry.';
      } else if (error.reason) {
        errorMessage = error.reason;
      }

      return {
        success: false,
        error: errorMessage,
        userWalletAddress,
        energyKwh,
      };
    }
  }

  /**
   * Get treasury balance
   * @returns {Object} Treasury balance information
   */
  async getTreasuryBalance() {
    try {
      const balance = await this.tokenContract.balanceOf(
        this.treasuryWallet.address
      );
      const balanceFormatted = ethers.formatUnits(balance, 18);

      const maticBalance = await this.provider.getBalance(
        this.treasuryWallet.address
      );
      const maticBalanceFormatted = ethers.formatEther(maticBalance);

      return {
        success: true,
        slrBalance: balanceFormatted,
        maticBalance: maticBalanceFormatted,
        treasuryAddress: this.treasuryWallet.address,
      };
    } catch (error) {
      console.error('Error fetching treasury balance:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Batch distribute tokens to multiple users (for efficiency)
   * @param {Array} distributions - Array of {address, kwh} objects
   * @returns {Array} Results for each distribution
   */
  async batchDistribute(distributions) {
    const results = [];

    for (const dist of distributions) {
      const result = await this.distributeTokensForEnergy(
        dist.address,
        dist.kwh
      );
      results.push(result);

      // Add delay between transactions to avoid nonce issues
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return results;
  }

  /**
   * Estimate gas cost for a distribution
   * @param {string} userWalletAddress - User's wallet address
   * @param {number} energyKwh - Amount of energy in kWh
   * @returns {Object} Gas estimation
   */
  async estimateDistributionCost(userWalletAddress, energyKwh) {
    try {
      const tokenAmount = this.kwhToTokens(energyKwh);
      
      // Estimate gas
      const gasEstimate = await this.tokenContract.transfer.estimateGas(
        userWalletAddress,
        tokenAmount
      );

      const feeData = await this.provider.getFeeData();
      const gasCostWei = gasEstimate * feeData.maxFeePerGas;
      const gasCostMatic = ethers.formatEther(gasCostWei);

      return {
        success: true,
        gasEstimate: gasEstimate.toString(),
        gasCostMatic,
        gasCostUsd: parseFloat(gasCostMatic) * 0.5, // Approximate MATIC price
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Export singleton instance
module.exports = new TokenDistributionService();