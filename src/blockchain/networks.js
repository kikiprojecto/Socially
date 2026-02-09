export const NETWORKS = {
  base: {
    name: 'Base',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    poidhContract: '0xb502c5856f7244dccdd0264a541cc25675353d39',
    explorerUrl: 'https://basescan.org',
    currency: 'ETH',
    testnet: false
  },
  'base-sepolia': {
    name: 'Base Sepolia',
    chainId: 84532,
    rpcUrl: 'https://sepolia.base.org',
    poidhContract: null,
    explorerUrl: 'https://sepolia.basescan.org',
    currency: 'ETH',
    testnet: true
  },
  arbitrum: {
    name: 'Arbitrum One',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    poidhContract: '0x0aa50ce0d724cc28f8f7af4630c32377b4d5c27d',
    explorerUrl: 'https://arbiscan.io',
    currency: 'ETH',
    testnet: false
  },
  'arbitrum-sepolia': {
    name: 'Arbitrum Sepolia',
    chainId: 421614,
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    poidhContract: null,
    explorerUrl: 'https://sepolia.arbiscan.io',
    currency: 'ETH',
    testnet: true
  },
  degen: {
    name: 'Degen Chain',
    chainId: 666666666,
    rpcUrl: 'https://rpc.degen.tips',
    poidhContract: '0x2445BfFc6aB9EEc6C562f8D7EE325CddF1780814',
    explorerUrl: 'https://explorer.degen.tips',
    currency: 'DEGEN',
    testnet: false
  }
};

export function getNetworkConfig(networkName) {
  const config = NETWORKS[networkName];
  if (!config) {
    throw new Error(`Unknown network: ${networkName}. Available: ${Object.keys(NETWORKS).join(', ')}`);
  }

  if (!config.poidhContract) {
    const override = (process.env.POIDH_EVM_CONTRACT_ADDRESS || '').trim();
    if (!override) {
      throw new Error(`Missing poidh contract address for ${networkName}. Set POIDH_EVM_CONTRACT_ADDRESS.`);
    }
    return { ...config, poidhContract: override };
  }
  return config;
}

export function getExplorerUrl(txHash, networkName) {
  const config = getNetworkConfig(networkName);
  return `${config.explorerUrl}/tx/${txHash}`;
}

export function getAddressUrl(address, networkName) {
  const config = getNetworkConfig(networkName);
  return `${config.explorerUrl}/address/${address}`;
}
