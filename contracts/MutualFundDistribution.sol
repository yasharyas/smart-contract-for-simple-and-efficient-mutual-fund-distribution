// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MutualFundDistribution is Ownable {
    IERC20 public fundToken; // Address of the mutual fund token
    uint256 public distributionInterval; // Interval in seconds for distribution
    uint256 public lastDistributionTime;
    
    // Storage variables
    mapping(address => uint256) public shares; // Customer address => shares held
    mapping(address => uint256) public lastClaimTime; // Customer address => last claim time
    address[] private customerList; // List of customers who have shares
    mapping(address => bool) private isCustomer; // Track if address is already in customerList
    
    // Events for tracking
    event Distribution(uint256 amount);
    event SharePurchase(address indexed customer, uint256 amount);
    event Claimed(address indexed customer, uint256 amount);
    
    constructor(address _fundToken, uint256 _distributionInterval) Ownable(msg.sender) {
        require(_fundToken != address(0), "Invalid token address");
        require(_distributionInterval > 0, "Interval must be positive");
        
        fundToken = IERC20(_fundToken);
        distributionInterval = _distributionInterval;
        lastDistributionTime = block.timestamp;
    }
    
    // Rest of your contract remains unchanged
    /**
     * @dev Allows customers to purchase shares using ERC20 tokens
     * @param _amount The amount of shares to purchase (in token units)
     */
    function purchaseShares(uint256 _amount) public {
        require(_amount > 0, "Amount must be positive");
        
        // Transfer tokens from customer to contract
        require(fundToken.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");
        
        // If first purchase, add to customer list
        if (!isCustomer[msg.sender]) {
            customerList.push(msg.sender);
            isCustomer[msg.sender] = true;
        }
        
        // Update shares - Replace SafeMath with standard addition
        shares[msg.sender] = shares[msg.sender] + _amount;
        
        // Initialize claim time if not set
        if (lastClaimTime[msg.sender] == 0) {
            lastClaimTime[msg.sender] = block.timestamp;
        }
        
        emit SharePurchase(msg.sender, _amount);
    }
    
    /**
     * @dev Distributes funds proportionally to all shareholders (owner only)
     */
    function distributeFunds() public onlyOwner {
        // Replace SafeMath with standard addition
        require(block.timestamp >= lastDistributionTime + distributionInterval, 
                "Distribution interval not reached");
        
        uint256 totalShares = getTotalShares();
        require(totalShares > 0, "No shares held");
        
        uint256 contractBalance = fundToken.balanceOf(address(this));
        require(contractBalance > 0, "No funds to distribute");
        
        // Process all customers
        for (uint256 i = 0; i < customerList.length; i++) {
            address customer = customerList[i];
            
            if (shares[customer] > 0) {
                uint256 customerShares = shares[customer];
                // Replace SafeMath with standard multiplication and division
                uint256 distributionAmount = (contractBalance * customerShares) / totalShares;
                
                if (distributionAmount > 0) {
                    require(fundToken.transfer(customer, distributionAmount), 
                            "Customer token transfer failed");
                    lastClaimTime[customer] = block.timestamp;
                }
            }
        }
        
        lastDistributionTime = block.timestamp;
        emit Distribution(contractBalance);
    }
    
    /**
     * @dev Allows individual claim of rewards after distribution interval
     */
    function claimRewards() public {
        require(shares[msg.sender] > 0, "No shares held");
        // Replace SafeMath with standard addition
        require(block.timestamp >= lastClaimTime[msg.sender] + distributionInterval, 
                "Claim interval not reached");
                
        uint256 totalShares = getTotalShares();
        require(totalShares > 0, "No total shares in system");
        
        uint256 contractBalance = fundToken.balanceOf(address(this));
        require(contractBalance > 0, "No funds to distribute");
        
        uint256 customerShares = shares[msg.sender];
        // Replace SafeMath with standard multiplication and division
        uint256 distributionAmount = (contractBalance * customerShares) / totalShares;
        
        require(distributionAmount > 0, "No rewards to claim");
        require(fundToken.transfer(msg.sender, distributionAmount), 
                "Customer token transfer failed");
                
        lastClaimTime[msg.sender] = block.timestamp;
        emit Claimed(msg.sender, distributionAmount);
    }
    
    /**
     * @dev Calculates the total number of shares in the system
     * @return Total number of shares
     */
    function getTotalShares() public view returns (uint256) {
        uint256 totalShares = 0;
        
        for (uint256 i = 0; i < customerList.length; i++) {
            // Replace SafeMath with standard addition
            totalShares = totalShares + shares[customerList[i]];
        }
        
        return totalShares;
    }
    
    /**
     * @dev Gets the list of all customers who have shares
     * @return Array of customer addresses
     */
    function getCustomers() public view returns (address[] memory) {
        return customerList;
    }
    
    /**
     * @dev Allows owner to change the distribution interval
     * @param _interval New interval in seconds
     */
    function setDistributionInterval(uint256 _interval) public onlyOwner {
        require(_interval > 0, "Interval must be positive");
        distributionInterval = _interval;
    }
    
    /**
     * @dev Allows owner to change the fund token
     * @param _tokenAddress Address of the new token
     */
    function setFundToken(address _tokenAddress) public onlyOwner {
        require(_tokenAddress != address(0), "Invalid token address");
        fundToken = IERC20(_tokenAddress);
    }
    
    /**
     * @dev Withdraw any ETH accidentally sent to the contract
     */
    function withdrawETH() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}