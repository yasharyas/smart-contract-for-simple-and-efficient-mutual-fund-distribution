
# Mutual Fund Distribution DApp

This project demonstrates a decentralized application (DApp) for managing a mutual fund distribution system on the Ethereum blockchain. It consists of smart contracts for fund token management and mutual fund distribution, along with a React-based frontend for user interaction.

---

## Overview

The Mutual Fund Distribution DApp allows users to:

- Purchase shares in a mutual fund using **FundToken**
- Receive distributions based on their share percentage
- Track token and share balances
- For fund administrators: manage distributions and update settings

---

## Technology Stack

### Smart Contracts
- Solidity 0.8.x
- Hardhat development environment
- OpenZeppelin Contracts (for ERC20 token and Ownable functionality)
- Hardhat Ignition for deployment

### Frontend
- React 19.x
- Vite
- Ethers.js for blockchain interaction
- CSS for styling

---

## Smart Contracts

The project includes the following main contracts:

1. **FundToken (ERC20)**: A standard ERC20 token that represents the fund's underlying asset.
2. **MutualFundDistribution**: Manages share purchases, customer tracking, and periodic distributions.

---

## Getting Started

### Prerequisites
- Node.js and npm
- MetaMask or compatible Ethereum wallet

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd blocklab09
   ```

2. Install backend dependencies:

   ```bash
   npm install
   ```

3. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

---

## Development

### Run a local blockchain node

```bash
npx hardhat node
```

### Deploy contracts

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Start the frontend

```bash
cd frontend
npm run dev
```

---

## Usage

1. **Connect Wallet**: Click the "Connect Wallet" button to connect with MetaMask.
2. **Purchase Shares**: Enter the amount and click "Purchase" to buy fund shares.
3. **Claim Rewards**: View your share balance and claim any available rewards.
4. **Admin Functions** (for fund owner only):
   - Update distribution interval
   - Distribute funds manually
   - View list of customers

---

## Contract Addresses

The application is configured to use the following contract addresses:

- **FundToken**: `0xa531f4d3fbb617b2c5cCE9255Eb81f63EB19aC9b`
- **MutualFundDistribution**: `0xcb62d6458b44b47a2984f59C49B21A70cefF120`

---

## Project Structure

```
smart-contract-for-simple-and-efficient-mutual-fund-distribution/
├── contracts/                  # Solidity smart contracts
│   ├── FundToken.sol          # ERC20 token contract
│   ├── MutualFundDistribution.sol # Mutual fund management contract
│   └── Lock.sol               # Example contract
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── abis/              # Contract ABIs
│   │   └── App.jsx           # Main application component
│   └── public/
├── scripts/
│   └── deploy.js              # Deployment scripts
├── test/
│   └── Lock.js                # Contract tests
└── hardhat.config.js          # Hardhat configuration
```

---

## Testing

Run the test suite:

```bash
npx hardhat test
```

---

## Deployment

To deploy to a testnet or mainnet:

1. Update the network settings in `hardhat.config.js`
2. Run the deployment script with the appropriate network flag
3. Verify contracts on Etherscan using the commands output by the deploy script
