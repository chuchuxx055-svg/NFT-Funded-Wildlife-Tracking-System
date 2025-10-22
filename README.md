# 🐾 NFT-Funded Wildlife Tracking System

Welcome to an innovative Web3 solution for wildlife conservation! This project uses NFTs to fund GPS tracking collars for endangered animals, ensuring transparent donation trails on the Stacks blockchain. By minting and selling unique NFTs representing sponsored animals, donors can track fund usage in real-time, receive updates on animal movements, and contribute to anti-poaching efforts—all powered by Clarity smart contracts.

## ✨ Features

🌍 Solve real-world wildlife conservation challenges like poaching and habitat loss through crowdfunded tracking tech  
💰 Sell NFTs to raise funds for collars, with 100% transparent allocation and spending trails  
📍 Store and query immutable animal tracking data fed via oracles  
🔒 Verify donor contributions and fund usage instantly  
🎁 Reward long-term donors with exclusive perks or airdrops  
🚫 Prevent fraud with multi-signature governance for fund releases  
📈 Generate reports on conservation impact for donors and NGOs  

## 🛠 How It Works

This project leverages 8 Clarity smart contracts to create a decentralized ecosystem for funding, tracking, and verifying wildlife conservation efforts. Funds from NFT sales are locked in escrow and released only upon verifiable milestones (e.g., collar deployment). Oracles feed real-world GPS data to the blockchain, allowing donors to query animal status.

**For Donors/Sponsors**  
- Browse available animals/collars via the registry  
- Mint an NFT by calling the NFT mint function with a donation amount  
- Track your donation's journey through the transparent ledger  
- Receive automated updates or rewards based on animal tracking milestones  

**For Conservation Organizations**  
- Register new animals/collars and request funding  
- Submit oracle-verified proof of collar deployment and data  
- Use governance to propose and approve fund releases  

**For Verifiers/Auditors**  
- Query donation trails, fund balances, and tracking data  
- Verify ownership of NFTs and associated conservation impact  

### 🔗 Smart Contracts Overview  
The system is modular, with 8 interconnected Clarity contracts for security and scalability:  

1. **NFTContract.clar**: Handles minting, transferring, and metadata for animal-themed NFTs (e.g., unique traits based on species).  
2. **DonationEscrow.clar**: Manages locked funds from NFT sales, releasing them in tranches upon verified milestones.  
3. **AnimalRegistry.clar**: Registers endangered animals/collars with details like species, location, and funding goals.  
4. **OracleFeed.clar**: Integrates external oracles to push GPS tracking data and deployment proofs to the blockchain.  
5. **GovernanceDAO.clar**: Enables multi-sig voting for fund approvals, proposal creation, and community decisions.  
6. **TransparencyLedger.clar**: Logs all transactions, allocations, and verifications for immutable audit trails.  
7. **RewardDistributor.clar**: Distributes perks like airdrops or badges to NFT holders based on donation tiers or animal survival metrics.  
8. **VerificationOracle.clar**: Provides functions to verify donor ownership, fund usage, and data integrity against hashes.  
