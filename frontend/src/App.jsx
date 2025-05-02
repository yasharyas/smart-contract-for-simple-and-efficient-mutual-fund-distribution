import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css'
import FundTokenABI from './abis/FundToken.json'
import MutualFundDistributionABI from './abis/MutualFundDistribution.json'

function App() {
  // Contract addresses from deployment
  const fundTokenAddress = "0xa531f4d3fbb617b2C5cCE9255Eb81f63EB19aC9b";
  const mutualFundAddress = "0xcb62d645Bd46b47a7a2984f59C49B21A70cEf120";
  
  // State variables
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [fundToken, setFundToken] = useState(null);
  const [mutualFund, setMutualFund] = useState(null);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [shareBalance, setShareBalance] = useState('0');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [totalShares, setTotalShares] = useState('0');
  const [distributionInterval, setDistributionInterval] = useState('0');
  const [lastDistributionTime, setLastDistributionTime] = useState('0');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [newDistributionInterval, setNewDistributionInterval] = useState('');

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setNotification('Please install MetaMask to use this DApp');
        return;
      }
      
      setLoading(true);
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      setAccount(account);
      
      // Create Web3 provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      
      // Create contract instances
      const signer = await provider.getSigner();
      const fundToken = new ethers.Contract(fundTokenAddress, FundTokenABI.abi, signer);
      const mutualFund = new ethers.Contract(mutualFundAddress, MutualFundDistributionABI.abi, signer);
      
      setFundToken(fundToken);
      setMutualFund(mutualFund);
      
      // Check if connected account is owner
      const owner = await mutualFund.owner();
      setIsOwner(owner.toLowerCase() === account.toLowerCase());
      
      // Load account data
      await loadAccountData(fundToken, mutualFund, account);
      
      // Setup event listeners for MetaMask
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0]);
        loadAccountData(fundToken, mutualFund, accounts[0]);
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      setNotification('Error connecting to wallet: ' + error.message);
      setLoading(false);
    }
  };

  // Load account data
  const loadAccountData = async (fundToken, mutualFund, account) => {
    try {
      setLoading(true);
      
      // Get token balance
      const balance = await fundToken.balanceOf(account);
      setTokenBalance(ethers.formatEther(balance));
      
      // Get share balance
      const shares = await mutualFund.shares(account);
      setShareBalance(ethers.formatEther(shares));
      
      // Get total shares
      const totalShares = await mutualFund.getTotalShares();
      setTotalShares(ethers.formatEther(totalShares));
      
      // Get distribution interval
      const interval = await mutualFund.distributionInterval();
      setDistributionInterval(interval.toString());
      
      // Get last distribution time
      const lastTime = await mutualFund.lastDistributionTime();
      setLastDistributionTime(lastTime.toString());
      
      // Get customers if owner
      const owner = await mutualFund.owner();
      if (owner.toLowerCase() === account.toLowerCase()) {
        const customerList = await mutualFund.getCustomers();
        setCustomers(customerList);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading account data:", error);
      setNotification('Error loading account data: ' + error.message);
      setLoading(false);
    }
  };

  // Purchase shares
  const purchaseShares = async () => {
    if (!mutualFund || !fundToken || !account) {
      setNotification('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setNotification('Approving token transfer...');
      
      const amountInWei = ethers.parseEther(purchaseAmount);
      
      // Approve tokens for mutual fund contract
      const approveTx = await fundToken.approve(mutualFundAddress, amountInWei);
      await approveTx.wait();
      
      setNotification('Purchasing shares...');
      
      // Purchase shares
      const purchaseTx = await mutualFund.purchaseShares(amountInWei);
      await purchaseTx.wait();
      
      setNotification(`Successfully purchased ${purchaseAmount} shares!`);
      setPurchaseAmount('');
      
      // Refresh data
      await loadAccountData(fundToken, mutualFund, account);
      
      setLoading(false);
    } catch (error) {
      console.error("Error purchasing shares:", error);
      setNotification('Error purchasing shares: ' + error.message);
      setLoading(false);
    }
  };

  // Claim rewards
  const claimRewards = async () => {
    if (!mutualFund || !account) {
      setNotification('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setNotification('Claiming rewards...');
      
      const claimTx = await mutualFund.claimRewards();
      await claimTx.wait();
      
      setNotification('Successfully claimed rewards!');
      
      // Refresh data
      await loadAccountData(fundToken, mutualFund, account);
      
      setLoading(false);
    } catch (error) {
      console.error("Error claiming rewards:", error);
      setNotification('Error claiming rewards: ' + error.message);
      setLoading(false);
    }
  };

  // Distribute funds (owner only)
  const distributeFunds = async () => {
    if (!mutualFund || !isOwner) {
      setNotification('Only owner can distribute funds');
      return;
    }

    try {
      setLoading(true);
      setNotification('Distributing funds...');
      
      const distributeTx = await mutualFund.distributeFunds();
      await distributeTx.wait();
      
      setNotification('Successfully distributed funds!');
      
      // Refresh data
      await loadAccountData(fundToken, mutualFund, account);
      
      setLoading(false);
    } catch (error) {
      console.error("Error distributing funds:", error);
      setNotification('Error distributing funds: ' + error.message);
      setLoading(false);
    }
  };
// Update distribution interval (owner only) in minutes
const updateDistributionInterval = async () => {
  if (!mutualFund || !isOwner) {
    setNotification('Only owner can update distribution interval');
    return;
  }

  try {
    setLoading(true);
    setNotification('Updating distribution interval...');
    
    // Convert minutes to seconds (make sure to properly convert to integer)
    const intervalInSeconds = Math.floor(parseFloat(newDistributionInterval) * 60);
    
    // Ensure the interval is positive
    if (intervalInSeconds <= 0) {
      setNotification('Interval must be positive');
      setLoading(false);
      return;
    }
    
    const updateTx = await mutualFund.setDistributionInterval(intervalInSeconds);
    await updateTx.wait();
    
    setNotification(`Successfully updated distribution interval to ${newDistributionInterval} minutes!`);
    setNewDistributionInterval('');
    
    // Refresh data
    await loadAccountData(fundToken, mutualFund, account);
    
    setLoading(false);
  } catch (error) {
    console.error("Error updating distribution interval:", error);
    setNotification('Error updating distribution interval: ' + error.message);
    setLoading(false);
  }
};

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === '0') return 'Not set';
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  // Calculate time until next distribution
const getNextDistribution = () => {
  if (lastDistributionTime === '0' || distributionInterval === '0') return 'Not available';
  
  const nextTime = Number(lastDistributionTime) + Number(distributionInterval);
  const now = Math.floor(Date.now() / 1000);
  
  if (nextTime <= now) return 'Ready for distribution';
  
  const remainingSeconds = nextTime - now;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  
  return `${minutes}m ${seconds}s`;
};

  return (
    <div className="app-container">
      <header>
        <h1>Mutual Fund Distribution DApp</h1>
        {!account ? (
          <button onClick={connectWallet} disabled={loading}>
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div className="account-info">
            <p>Connected: {account.substring(0, 6)}...{account.substring(38)}</p>
            <p>Token Balance: {tokenBalance} FUND</p>
            <p>Share Balance: {shareBalance}</p>
          </div>
        )}
      </header>
      
      {notification && (
        <div className="notification">
          <p>{notification}</p>
          <button onClick={() => setNotification('')}>Dismiss</button>
        </div>
      )}
      
      {account && (
        <div className="content">
          <div className="card">
            <h2>Purchase Shares</h2>
            <div className="form-group">
              <input
                type="number"
                placeholder="Amount"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                disabled={loading}
              />
              <button onClick={purchaseShares} disabled={loading || !purchaseAmount}>
                {loading ? 'Processing...' : 'Purchase'}
              </button>
            </div>
          </div>
          
          <div className="card">
            <h2>Claim Rewards</h2>
            <p>Your Shares: {shareBalance}</p>
            <p>Total Shares: {totalShares}</p>
            <button onClick={claimRewards} disabled={loading || shareBalance === '0'}>
              {loading ? 'Processing...' : 'Claim Rewards'}
            </button>
          </div>
          
          {isOwner && (
  <div className="card owner-section">
    <h2>Owner Controls</h2>
    <p>Total Shares: {totalShares}</p>
    <p>Distribution Interval: {Math.round(distributionInterval / 60 * 100) / 100} Minuets</p>
    <p>Last Distribution: {formatDate(lastDistributionTime)}</p>
    <p>Next Distribution: {getNextDistribution()}</p>
    
    {/* Distribution Interval Update Form */}
<div className="form-group distribution-interval-form">
  <h3>Update Distribution Interval</h3>
  <div className="input-with-label">
    <input
      type="number"
      placeholder="New interval"
      value={newDistributionInterval}
      onChange={(e) => setNewDistributionInterval(e.target.value)}
      disabled={loading}
      min="1"
      step="1"
    />
    <span>minutes</span>
  </div>
  <button 
    onClick={updateDistributionInterval} 
    disabled={loading || !newDistributionInterval || parseFloat(newDistributionInterval) <= 0}
  >
    {loading ? 'Processing...' : 'Update Interval'}
  </button>
</div>
    
    {/* Distribution Button */}
    <button onClick={distributeFunds} disabled={loading} className="distribute-btn">
      {loading ? 'Processing...' : 'Distribute Funds'}
    </button>
    
    <h3>Customers ({customers.length})</h3>
    <div className="customer-list">
      {customers.map((customer, index) => (
        <div key={index} className="customer-item">
          <p>{customer.substring(0, 8)}...{customer.substring(36)}</p>
        </div>
      ))}
    </div>
  </div>
)}
        </div>
      )}
    </div>
  );
}

export default App;