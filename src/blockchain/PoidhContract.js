import { Contract, parseEther, formatEther } from 'ethers';
import { getNetworkConfig, getExplorerUrl } from './networks.js';

const POIDH_ABI = [
  'event BountyCreated(uint256 indexed bountyId, address indexed issuer, uint256 amount, string name)',
  'event ClaimCreated(uint256 indexed bountyId, uint256 indexed claimId, address indexed claimer)',
  'event ClaimAccepted(uint256 indexed bountyId, uint256 indexed claimId)',
  'function createBounty(string name, string description, string imageURI, uint256 amount) payable returns (uint256)',
  'function createClaim(uint256 bountyId, string description, string imageURI) returns (uint256)',
  'function acceptClaim(uint256 bountyId, uint256 claimId)',
  'function getBounty(uint256 bountyId) view returns (tuple(address issuer, string name, string description, uint256 amount, uint256 deadline, bool completed, uint256 claimCount))',
  'function getClaim(uint256 bountyId, uint256 claimId) view returns (tuple(address claimer, string description, string imageURI, uint256 createdAt, bool accepted))',
  'function getBountyClaimCount(uint256 bountyId) view returns (uint256)'
];

export class PoidhContract {
  constructor(wallet, network) {
    this.wallet = wallet;
    this.network = network;
    this.networkConfig = getNetworkConfig(network);

    this.contract = new Contract(
      this.networkConfig.poidhContract,
      POIDH_ABI,
      wallet
    );
  }

  async createBounty(bountyData) {
    const { name, description, imageURI, rewardETH } = bountyData;

    const amountWei = parseEther(rewardETH.toString());

    const tx = await this.contract.createBounty(
      name,
      description,
      imageURI || '',
      amountWei,
      { value: amountWei, gasLimit: 500000 }
    );

    const receipt = await tx.wait();

    const eventLog = receipt.logs.find((log) => {
      try {
        return this.contract.interface.parseLog(log).name === 'BountyCreated';
      } catch {
        return false;
      }
    });

    if (!eventLog) {
      throw new Error('BountyCreated event not found in transaction');
    }

    const parsed = this.contract.interface.parseLog(eventLog);
    const bountyId = parsed.args.bountyId.toString();

    return {
      bountyId,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      explorerUrl: getExplorerUrl(receipt.hash, this.network)
    };
  }

  async monitorClaims(bountyId, callback) {
    const filter = this.contract.filters.ClaimCreated(bountyId);

    this.contract.on(filter, async (bountyIdEvent, claimId, claimer) => {
      try {
        const claimData = await this.getClaim(bountyId, claimId.toString());
        if (callback) {
          await callback({
            bountyId: bountyIdEvent.toString(),
            claimId: claimId.toString(),
            claimer,
            ...claimData
          });
        }
      } catch (error) {
        console.error(error?.message || String(error));
      }
    });
  }

  async getClaim(bountyId, claimId) {
    const claim = await this.contract.getClaim(bountyId, claimId);

    return {
      claimer: claim.claimer,
      description: claim.description,
      imageURI: claim.imageURI,
      createdAt: Number(claim.createdAt),
      accepted: claim.accepted
    };
  }

  async getAllClaims(bountyId) {
    const claimCount = await this.contract.getBountyClaimCount(bountyId);
    const claims = [];

    for (let i = 0; i < claimCount; i++) {
      const claim = await this.getClaim(bountyId, i.toString());
      claims.push({ claimId: i.toString(), ...claim });
    }

    return claims;
  }

  async acceptClaim(bountyId, claimId) {
    const tx = await this.contract.acceptClaim(bountyId, claimId, { gasLimit: 300000 });
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      explorerUrl: getExplorerUrl(receipt.hash, this.network)
    };
  }

  async getBounty(bountyId) {
    const bounty = await this.contract.getBounty(bountyId);

    return {
      issuer: bounty.issuer,
      name: bounty.name,
      description: bounty.description,
      amount: formatEther(bounty.amount),
      deadline: Number(bounty.deadline),
      completed: bounty.completed,
      claimCount: Number(bounty.claimCount)
    };
  }
}
