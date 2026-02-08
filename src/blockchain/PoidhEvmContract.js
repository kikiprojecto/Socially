import { Contract } from 'ethers';

const DEFAULT_ADDRESSES = {
  arbitrum: '0x0aa50ce0d724cc28f8f7af4630c32377b4d5c27d',
  base: '0xb502c5856f7244dccdd0264a541cc25675353d39',
  degen: '0x2445BfFc6aB9EEc6C562f8D7EE325CddF1780814'
};

const POIDH_ABI = [
  'function createBounty(string name, string description, string imageUri, uint256 amount) payable returns (uint256)',
  'function getBounty(uint256 bountyId) view returns (tuple(address issuer, uint256 amount, uint256 deadline, bool completed, address winner))',
  'function getClaims(uint256 bountyId) view returns (uint256[] memory)',
  'function acceptClaim(uint256 bountyId, uint256 claimId)',
  'event BountyCreated(uint256 indexed bountyId, address indexed issuer, uint256 amount)',
  'event ClaimSubmitted(uint256 indexed bountyId, uint256 indexed claimId, address indexed claimer)',
  'event ClaimAccepted(uint256 indexed bountyId, uint256 indexed claimId, address winner)'
];

export class PoidhEvmContract {
  constructor({ signer, network }) {
    this.signer = signer;
    this.network = (network || process.env.EVM_NETWORK || 'base').trim();
    this.address = (process.env.POIDH_EVM_CONTRACT_ADDRESS || DEFAULT_ADDRESSES[this.network] || '').trim();
    if (!this.address) {
      throw new Error('Missing POIDH contract address (set POIDH_EVM_CONTRACT_ADDRESS)');
    }

    this.contract = new Contract(this.address, POIDH_ABI, signer);
  }

  async createBounty({ title, description, imageUri, amountWei }) {
    const tx = await this.contract.createBounty(title, description, imageUri || '', amountWei, { value: amountWei });
    const receipt = await tx.wait();

    const log = receipt.logs?.find((l) => {
      try {
        const parsed = this.contract.interface.parseLog(l);
        return parsed?.name === 'BountyCreated';
      } catch {
        return false;
      }
    });

    let bountyId = null;
    if (log) {
      const parsed = this.contract.interface.parseLog(log);
      bountyId = parsed?.args?.bountyId?.toString?.() || null;
    }

    return { bountyId, hash: receipt.hash, receipt };
  }

  async getBounty(bountyId) {
    return this.contract.getBounty(bountyId);
  }

  async getClaims(bountyId) {
    return this.contract.getClaims(bountyId);
  }

  async acceptClaim(bountyId, claimId) {
    const tx = await this.contract.acceptClaim(bountyId, claimId);
    const receipt = await tx.wait();
    return { hash: receipt.hash, receipt };
  }
}
